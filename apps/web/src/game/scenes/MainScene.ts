import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Goblin } from '../entities/Goblin';
import { RiftWarden } from '../entities/Boss';
import * as Colyseus from 'colyseus.js';
import { ArenaState, PlayerState } from '../schema/ArenaState';

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private goblins!: Phaser.GameObjects.Group;
  private boss!: RiftWarden;
  private lootGroup!: Phaser.Physics.Arcade.StaticGroup;
  private playerClass: 'vanguard' | 'rogue' = 'vanguard';
  private darkMode: boolean = false;
  
  // Multiplayer
  private room!: Colyseus.Room<ArenaState>;
  private otherPlayers: { [id: string]: Phaser.GameObjects.Sprite } = {};
  
  // Extraction
  private extractionZone!: Phaser.GameObjects.Zone;
  private extractionTimer: Phaser.Time.TimerEvent | null = null;
  private isExtracting: boolean = false;
  
  // UI
  private uiText!: Phaser.GameObjects.Text;
  private tooltipShown: Set<string> = new Set();

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: any) {
    if (data.playerClass) this.playerClass = data.playerClass;
    if (data.darkMode !== undefined) this.darkMode = data.darkMode;
  }

  preload() {
    this.load.image('vanguard', '/vanguard.jpg');
    this.load.image('rogue', '/rogue.jpg');
    this.load.image('goblin', '/goblin.jpg');
  }

  private makeTransparent(key: string) {
    // Use canvas to remove the magenta (#FF00FF) background
    const texture = this.textures.get(key);
    const src = texture.getSourceImage() as HTMLImageElement;
    const canvas = document.createElement('canvas');
    canvas.width = src.width;
    canvas.height = src.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(src, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      // Remove magenta pixels (high red, low green, high blue)
      if (r > 180 && g < 80 && b > 180) {
        data[i+3] = 0; // Set alpha to transparent
      }
    }
    ctx.putImageData(imageData, 0, 0);
    this.textures.remove(key);
    this.textures.addCanvas(key, canvas);
  }

  create() {
    // Strip magenta background from sprites
    this.makeTransparent('vanguard');
    this.makeTransparent('rogue');
    this.makeTransparent('goblin');

    const graphics = this.add.graphics();
    const gridColor = this.darkMode ? 0x1a3a1a : 0xd1fae5;
    graphics.lineStyle(1, gridColor, 1);
    
    const mapSize = 2000;
    this.physics.world.setBounds(0, 0, mapSize, mapSize);

    for (let i = 0; i < mapSize; i += 50) {
      graphics.moveTo(i, 0);
      graphics.lineTo(i, mapSize);
      graphics.moveTo(0, i);
      graphics.lineTo(mapSize, i);
    }
    graphics.strokePath();

    this.player = new Player(this, mapSize / 2, mapSize / 2, this.playerClass);
    this.cameras.main.setBounds(0, 0, mapSize, mapSize);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);

    // Extraction Point (Top Left)
    const exX = 300, exY = 300;
    const exGraphics = this.add.graphics();
    exGraphics.fillStyle(0x3b82f6, 0.3); // Blue zone
    exGraphics.fillCircle(exX, exY, 150);
    this.extractionZone = this.add.zone(exX, exY, 300, 300);
    this.physics.add.existing(this.extractionZone, true);
    
    // Add extraction beacon
    this.add.text(exX, exY - 20, 'EXTRACTION', { color: '#60a5fa', fontSize: '20px', fontFamily: 'monospace' }).setOrigin(0.5);

    const obstacles = this.physics.add.staticGroup();
    for (let i = 0; i < 20; i++) {
        const x = Phaser.Math.Between(100, mapSize - 100);
        const y = Phaser.Math.Between(100, mapSize - 100);
        // Don't spawn obstacle on extraction
        if (Phaser.Math.Distance.Between(x, y, exX, exY) < 300) continue;
        const block = this.add.rectangle(x, y, 64, 64, 0xf0fdf4);
        block.setStrokeStyle(2, 0x22c55e);
        obstacles.add(block);
    }
    this.physics.add.collider(this.player, obstacles);

    // Goblins
    this.goblins = this.add.group({ classType: Goblin, runChildUpdate: true });
    for (let i = 0; i < 15; i++) {
        let x = Phaser.Math.Between(100, mapSize - 100);
        let y = Phaser.Math.Between(100, mapSize - 100);
        // Prevent spawning directly on the player at the center
        while (Phaser.Math.Distance.Between(x, y, mapSize / 2, mapSize / 2) < 400) {
            x = Phaser.Math.Between(100, mapSize - 100);
            y = Phaser.Math.Between(100, mapSize - 100);
        }
        const goblin = new Goblin(this, x, y);
        goblin.setTarget(this.player);
        this.goblins.add(goblin);
    }
    this.physics.add.collider(this.goblins, obstacles);
    this.physics.add.collider(this.goblins, this.goblins);

    // Spawn Boss (Center of map)
    this.boss = new RiftWarden(this, mapSize / 2, mapSize / 2 - 200);
    this.boss.setTarget(this.player);
    this.physics.add.collider(this.boss, obstacles);

    // Particle Manager for explosions
    const particles = this.add.particles(0, 0, 'boss', { // Using boss texture as a placeholder for particles
      scale: { start: 0.2, end: 0 },
      alpha: { start: 1, end: 0 },
      speed: { min: 50, max: 200 },
      lifespan: 800,
      blendMode: 'ADD',
      emitting: false
    });

    // Loot
    this.lootGroup = this.physics.add.staticGroup();
    
    this.events.on('goblin-died', (x: number, y: number) => {
      // Particle burst
      particles.setParticleTint(0xef4444);
      particles.emitParticleAt(x, y, 15);

      // 50% chance to drop common loot
      if (Math.random() > 0.5) {
        const loot = this.add.rectangle(x, y, 16, 16, 0x9ca3af); // Gray for common
        this.physics.add.existing(loot, true);
        (loot as any).lootName = 'Scrap Metal (Common)';
        this.lootGroup.add(loot);
      }
    });

    this.events.on('boss-died', (x: number, y: number) => {
      // Massive Particle burst
      particles.setParticleTint(0xd97706);
      particles.emitParticleAt(x, y, 50);

      // 100% chance to drop Epic/Legendary loot
      const loot = this.add.rectangle(x, y, 24, 24, 0xf59e0b); // Orange/Gold for Legendary
      this.physics.add.existing(loot, true);
      (loot as any).lootName = 'Rift Core (Legendary)';
      this.lootGroup.add(loot);
      
      const loot2 = this.add.rectangle(x + 20, y + 20, 20, 20, 0x8b5cf6); // Purple for Epic
      this.physics.add.existing(loot2, true);
      (loot2 as any).lootName = 'Warden Greaves (Epic)';
      this.lootGroup.add(loot2);
    });

    // Loot Pickup
    this.physics.add.overlap(this.player, this.lootGroup, (_player, item) => {
      const itemName = (item as any).lootName || 'Mysterious Item';
      item.destroy();
      document.dispatchEvent(new CustomEvent('loot-pickup', { detail: { item: itemName } }));
    });

    // Floating Text Helper
    const showDamageNumber = (x: number, y: number, damage: number, color: string = '#000000') => {
      const text = this.add.text(x, y - 40, damage.toString(), { fontSize: '22px', color, fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5);
      this.tweens.add({
        targets: text,
        y: y - 80,
        alpha: 0,
        duration: 800,
        onComplete: () => text.destroy()
      });
    };

    // Player attacks Enemies (Goblins)
    this.physics.add.overlap(this.player.attackHitbox, this.goblins, (_hitbox, enemy) => {
      if (this.player.getIsAttacking()) {
        const dmg = 45; // Buffed from 25
        const enemySprite = enemy as Phaser.Physics.Arcade.Sprite & { takeDamage: (dmg: number) => void, lastAttackTime: number, entityType: string };
        if (enemySprite.entityType === 'goblin') {
          enemySprite.takeDamage(dmg);
          showDamageNumber(enemySprite.x, enemySprite.y, dmg);
          const dir = new Phaser.Math.Vector2(enemySprite.x - this.player.x, enemySprite.y - this.player.y).normalize().scale(300);
          enemySprite.setVelocity(dir.x, dir.y);
        }
      }
    });

    // Player attacks Enemies (Boss)
    this.physics.add.overlap(this.player.attackHitbox, this.boss, (_hitbox, enemy) => {
      if (this.player.getIsAttacking()) {
        const dmg = 45; // Buffed from 25
        const enemySprite = enemy as Phaser.Physics.Arcade.Sprite & { takeDamage: (dmg: number) => void, lastAttackTime: number, entityType: string };
        if (enemySprite.entityType === 'boss') {
          enemySprite.takeDamage(dmg);
          showDamageNumber(enemySprite.x, enemySprite.y, dmg);
          // Bosses don't get knocked back easily
        }
      }
    });

    // Enemies hit Player (Goblins)
    this.physics.add.collider(this.player, this.goblins, (_p, e) => {
        const now = this.time.now;
        const enemySprite = e as Phaser.Physics.Arcade.Sprite & { lastAttackTime: number, entityType: string };
        
        if (enemySprite.entityType === 'goblin') {
          if (now - enemySprite.lastAttackTime > 1000) { // 1 sec cooldown
            enemySprite.lastAttackTime = now;
            this.player.takeDamage(5); // Nerfed from 10
            showDamageNumber(this.player.x, this.player.y, 5, '#ef4444');
            this.cameras.main.shake(150, 0.005);
            this.cancelExtraction(); // Interrupt extraction!
          }
        }
    });

    // Enemies hit Player (Boss)
    this.physics.add.collider(this.player, this.boss, (_p, e) => {
        const now = this.time.now;
        const enemySprite = e as Phaser.Physics.Arcade.Sprite & { lastAttackTime: number, entityType: string };
        
        if (enemySprite.entityType === 'boss') {
          if (now - enemySprite.lastAttackTime > 1500) { // 1.5 sec cooldown
            enemySprite.lastAttackTime = now;
            this.player.takeDamage(15); // Nerfed from 30
            showDamageNumber(this.player.x, this.player.y, 15, '#ef4444');
            this.cameras.main.shake(250, 0.01);
            this.cancelExtraction();
          }
        }
    });

    // UI Text
    this.uiText = this.add.text(10, 10, 'Health: 100/100', { fontSize: '24px', color: '#166534', fontFamily: 'monospace', fontStyle: 'bold' })
      .setScrollFactor(0); // Fixed to camera
    
    this.events.on('player-health-changed', (hp: number, max: number) => {
      this.uiText.setText(`Health: ${hp}/${max}`);
    });

    this.events.on('player-died', () => {
      this.uiText.setText('YOU DIED.');
      this.uiText.setColor('#ef4444');
      this.cancelExtraction();
      // Dispatch event to React overlay
      document.dispatchEvent(new CustomEvent('match-died'));
    });

    // ── CONTEXTUAL TOOLTIPS ────────────────────────────────
    const showTooltip = (id: string, lines: string[], duration = 4000) => {
      if (this.tooltipShown.has(id)) return;
      this.tooltipShown.add(id);

      const camW = this.cameras.main.width;
      const camH = this.cameras.main.height;
      const padding = 16;
      const lineH = 24;
      const boxH = lines.length * lineH + padding * 2;
      const boxW = 340;

      const bg = this.add.rectangle(0, 0, boxW, boxH, 0x000000, 0.75).setOrigin(0);
      bg.setStrokeStyle(1.5, 0x22c55e);
      const texts = lines.map((line, i) =>
        this.add.text(padding, padding + i * lineH, line, {
          fontSize: i === 0 ? '14px' : '13px',
          color: i === 0 ? '#22c55e' : '#d1fae5',
          fontFamily: 'monospace',
          fontStyle: i === 0 ? 'bold' : 'normal',
        })
      );

      // Position higher up to avoid covering mobile joystick (160px from bottom)
      const container = this.add.container(camW / 2 - boxW / 2, camH - boxH - 160, [bg, ...texts]);
      container.setScrollFactor(0).setDepth(100).setAlpha(0);

      this.tweens.add({ targets: container, alpha: 1, duration: 300 });
      this.time.delayedCall(duration, () => {
        this.tweens.add({ targets: container, alpha: 0, duration: 400, onComplete: () => container.destroy() });
      });
    };

    // Fire first-entry tips in sequence
    this.time.delayedCall(1000,  () => showTooltip('move',    ['[ MOVEMENT ]',   'Use WASD or Arrow Keys to move your operator.']));
    this.time.delayedCall(5500,  () => showTooltip('attack',  ['[ ATTACK ]',     'Press SPACE to swing at nearby enemies.', 'You deal 25 damage per hit.']));
    this.time.delayedCall(10000, () => showTooltip('dodge',   ['[ DODGE ROLL ]', 'Press SHIFT while moving to dash.', 'You are invincible during the roll!']));
    this.time.delayedCall(16000, () => showTooltip('loot',    ['[ LOOT ]',       'Enemies drop items when killed.', 'Walk over them to collect.']));
    this.time.delayedCall(22000, () => showTooltip('extract', ['[ EXTRACTION ]', 'Find the BLUE BEACON zone on the map.', 'Stand inside for 4 seconds to escape safely.', 'Getting hit will cancel the extraction!']));
    this.time.delayedCall(32000, () => showTooltip('pvp',     ['[ WARNING ]',    'Other players are in this zone.', 'They can kill you and take your loot.', 'Decide: push further, or extract now?']));

    this.connectToServer();
  }

  async connectToServer() {
    // Connect to the production Railway backend (note: wss:// for secure websocket)
    const client = new Colyseus.Client('wss://rift-raiders-production.up.railway.app');
    
    try {
      this.room = await client.joinOrCreate<ArenaState>('arena');
      
      this.room.state.players.onAdd((playerState: PlayerState, sessionId: string) => {
        if (sessionId === this.room.sessionId) {
          // This is us, sync initial server position
          const px = typeof playerState.x === 'number' && !isNaN(playerState.x) ? playerState.x : 1000;
          const py = typeof playerState.y === 'number' && !isNaN(playerState.y) ? playerState.y : 1000;
          this.player.setPosition(px, py);
          return;
        }
        
        // This is another player
        const ox = typeof playerState.x === 'number' && !isNaN(playerState.x) ? playerState.x : 1000;
        const oy = typeof playerState.y === 'number' && !isNaN(playerState.y) ? playerState.y : 1000;
        const otherPlayer = this.add.sprite(ox, oy, 'vanguard');
        otherPlayer.setTint(0x3b82f6); // Blue for other players
        this.otherPlayers[sessionId] = otherPlayer;
        
        playerState.onChange(() => {
          // Smooth interpolate in a real game, teleport for MVP
          const nx = typeof playerState.x === 'number' && !isNaN(playerState.x) ? playerState.x : otherPlayer.x;
          const ny = typeof playerState.y === 'number' && !isNaN(playerState.y) ? playerState.y : otherPlayer.y;
          otherPlayer.setPosition(nx, ny);
          if(playerState.isDead) otherPlayer.setTint(0xff0000).setAngle(90);
        });
      });

      this.room.state.players.onRemove((_playerState: any, sessionId: string) => {
        if (this.otherPlayers[sessionId]) {
          this.otherPlayers[sessionId].destroy();
          delete this.otherPlayers[sessionId];
        }
      });
      
    } catch (e) {
      console.error("Colyseus connection error", e);
    }
  }

  update() {
    this.player.update();
    if (this.boss) this.boss.update();

    // Broadcast movement
    if (this.room && !this.player.isDead) {
      this.room.send('move', { x: this.player.x, y: this.player.y });
    }

    // Extraction Logic
    if (this.player.isDead) return;

    if (this.physics.overlap(this.player, this.extractionZone)) {
      if (!this.isExtracting) {
        this.startExtraction();
      }
    } else {
      if (this.isExtracting) {
        this.cancelExtraction();
      }
    }
  }

  private startExtraction() {
    this.isExtracting = true;
    let countdown = 4; // Made extraction easier (4 seconds)
    
    // Spawn ambush!
    const exX = this.extractionZone.x;
    const exY = this.extractionZone.y;
    for (let i = 0; i < 1; i++) { // Only 1 goblin ambush
        const angle = Math.random() * Math.PI * 2;
        const goblin = new Goblin(this, exX + Math.cos(angle) * 350, exY + Math.sin(angle) * 350);
        goblin.setTarget(this.player);
        this.goblins.add(goblin);
    }
    
    const exText = this.add.text(this.player.x, this.player.y - 40, `Extracting... ${countdown}`, { color: '#60a5fa', fontSize: '16px' }).setOrigin(0.5);
    
    this.extractionTimer = this.time.addEvent({
      delay: 1000,
      repeat: 3,
      callback: () => {
        countdown--;
        exText.setPosition(this.player.x, this.player.y - 40);
        if (countdown > 0) {
          exText.setText(`Extracting... ${countdown}`);
        } else {
          exText.setText('SUCCESS!');
          exText.setColor('#22c55e');
          this.player.isDead = true; // Freeze player
          document.dispatchEvent(new CustomEvent('match-extracted'));
        }
      }
    });

    // Store reference to clean up text if interrupted
    (this.extractionTimer as any).exText = exText;
  }

  private cancelExtraction() {
    if (!this.isExtracting) return;
    this.isExtracting = false;
    if (this.extractionTimer) {
      (this.extractionTimer as any).exText.destroy();
      this.extractionTimer.remove();
      this.extractionTimer = null;
    }
  }
}

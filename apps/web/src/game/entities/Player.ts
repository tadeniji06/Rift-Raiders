import Phaser from 'phaser';
import { virtualKeys } from '../virtualKeys';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private speed: number = 200;
  
  // Abilities state
  private isDodging: boolean = false;
  private canDodge: boolean = true;
  private isAttacking: boolean = false;
  private canAttack: boolean = true;
  private lastFacingDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);

  // Status
  public health: number = 100;
  public maxHealth: number = 100;
  public isDead: boolean = false;

  // References
  public attackHitbox!: Phaser.Physics.Arcade.Sprite;
  public playerClass: 'vanguard' | 'rogue';

  constructor(scene: Phaser.Scene, x: number, y: number, playerClass: 'vanguard' | 'rogue' = 'vanguard') {
    super(scene, x, y, playerClass);
    this.playerClass = playerClass;
    
    // Set class stats
    if (this.playerClass === 'rogue') {
      this.speed = 300;
      this.health = 75;
      this.maxHealth = 75;
    } else {
      this.speed = 200;
      this.health = 100;
      this.maxHealth = 100;
    }

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    
    // Set size and texture
    this.setTexture(playerClass);
    this.setDisplaySize(96, 96);
    this.setOrigin(0.5, 0.5);

    // Setup Attack Hitbox (invisible by default)
    this.attackHitbox = scene.physics.add.sprite(x, y, 'vanguard').setAlpha(0);
    this.attackHitbox.body!.setSize(80, 80);
    (this.attackHitbox.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    } else {
      // Mobile: no keyboard – virtual keys handle input instead
      this.cursors = {} as any;
    }
  }

  update() {
    if (this.isDead || this.isDodging) return; // Can't act while dead or dodging

    const kbd = this.scene.input.keyboard;
    const keys = kbd ? kbd.addKeys('W,A,S,D,SPACE,SHIFT') as any : {};

    // Movement – merge keyboard + virtual touch controls
    let vx = 0;
    let vy = 0;

    if ((this.cursors.left?.isDown)  || keys.A?.isDown  || virtualKeys.left)  vx = -this.speed;
    else if ((this.cursors.right?.isDown) || keys.D?.isDown || virtualKeys.right) vx = this.speed;

    if ((this.cursors.up?.isDown)   || keys.W?.isDown  || virtualKeys.up)    vy = -this.speed;
    else if ((this.cursors.down?.isDown)  || keys.S?.isDown  || virtualKeys.down)  vy = this.speed;

    this.setVelocity(vx, vy);

    if (this.body && this.body.velocity.lengthSq() > 0) {
      (this.body.velocity as Phaser.Math.Vector2).normalize().scale(this.speed);
      this.lastFacingDirection.copy(this.body.velocity).normalize();
    }

    // Dodge (Shift or virtual)
    if ((keys.SHIFT?.isDown || virtualKeys.dodge) && this.canDodge && (vx !== 0 || vy !== 0)) {
      this.performDodge();
    }

    // Attack (Space or virtual)
    if ((keys.SPACE?.isDown || virtualKeys.attack) && this.canAttack) {
      this.performAttack();
    }
    
    // Update Hitbox Position
    this.attackHitbox.setPosition(this.x + this.lastFacingDirection.x * 50, this.y + this.lastFacingDirection.y * 50);
    // CRITICAL: Manually positioned physics sprites need their body updated!
    if (this.attackHitbox.body) {
      (this.attackHitbox.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
    }
  }

  private performDodge() {
    this.isDodging = true;
    this.canDodge = false;
    
    // Boost speed (Rogue is much faster)
    const dodgeSpeed = this.playerClass === 'rogue' ? 900 : 600;
    this.setVelocity(this.lastFacingDirection.x * dodgeSpeed, this.lastFacingDirection.y * dodgeSpeed);
    
    // Stealth effect for rogue
    this.setAlpha(this.playerClass === 'rogue' ? 0.2 : 0.5);

    // End dodge after 200ms
    this.scene.time.delayedCall(200, () => {
      this.isDodging = false;
      this.setAlpha(1);
    });

    // Cooldown
    this.scene.time.delayedCall(1500, () => {
      this.canDodge = true;
    });
  }

  private performAttack() {
    this.isAttacking = true;
    this.canAttack = false;

    // Visual feedback for attack (swipe)
    const swipe = this.scene.add.rectangle(this.attackHitbox.x, this.attackHitbox.y, 40, 40, 0xffffff, 0.8);
    this.scene.tweens.add({
      targets: swipe,
      alpha: 0,
      scale: 1.5,
      duration: 200,
      onComplete: () => {
        swipe.destroy();
        this.isAttacking = false;
      }
    });

    // Cooldown
    this.scene.time.delayedCall(500, () => {
      this.canAttack = true;
    });
  }

  public getIsAttacking() {
    return this.isAttacking;
  }

  public takeDamage(amount: number) {
    if (this.isDead || this.isDodging) return; // I-frames during dodge

    this.health -= amount;
    
    // Flash red
    this.setTint(0xff0000).setTintMode(Phaser.TintModes.FILL);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
      // Ensure tint mode is reset if needed, though clearTint should suffice.
    });

    // Emit health event for UI
    this.scene.events.emit('player-health-changed', this.health, this.maxHealth);

    if (this.health <= 0) {
      this.die();
    }
  }

  private die() {
    this.isDead = true;
    this.setVelocity(0, 0);
    this.setTint(0xff0000); // Turn solid red
    this.setAngle(90); // Fall over
    
    this.scene.events.emit('player-died');
  }
}

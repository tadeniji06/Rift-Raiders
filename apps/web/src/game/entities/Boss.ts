import Phaser from 'phaser';

export class RiftWarden extends Phaser.Physics.Arcade.Sprite {
  public health: number = 500;
  public maxHealth: number = 500;
  private speed: number = 75;
  private target: Phaser.Physics.Arcade.Sprite | null = null;
  private aiState: 'IDLE' | 'CHASE' | 'PHASE_2' | 'DEAD' = 'IDLE';
  public lastAttackTime: number;
  private isEnraged: boolean = false;
  public entityType: string = 'boss';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    
    // Draw Rift Warden
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xd97706); // Amber/Orange for Boss
    graphics.fillRect(0, 0, 64, 64);
    graphics.lineStyle(4, 0x991b1b);
    graphics.strokeRect(0, 0, 64, 64);
    graphics.generateTexture('boss', 64, 64);
    this.setTexture('boss');
    this.setOrigin(0.5, 0.5);
    
    this.lastAttackTime = scene.time.now;

    // AI Loop
    scene.time.addEvent({
      delay: 500,
      callback: this.evaluateState,
      callbackScope: this,
      loop: true
    });
  }

  setTarget(target: Phaser.Physics.Arcade.Sprite) {
    this.target = target;
  }

  takeDamage(amount: number) {
    if (this.aiState === 'DEAD') return;

    this.health -= amount;
    
    // Flash white when hit
    this.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    // Phase 2 transition at 50% health
    if (this.health <= this.maxHealth / 2 && !this.isEnraged) {
      this.enterPhase2();
    }

    if (this.health <= 0) {
      this.die();
    }
  }

  private enterPhase2() {
    this.isEnraged = true;
    this.speed = 150; // Moves faster
    this.setTint(0xef4444); // Turns red
    
    // Create an enrage shockwave effect
    const shockwave = this.scene.add.circle(this.x, this.y, 10, 0xef4444, 0.5);
    this.scene.tweens.add({
      targets: shockwave,
      scale: 20,
      alpha: 0,
      duration: 1000,
      onComplete: () => shockwave.destroy()
    });
  }

  private die() {
    this.aiState = 'DEAD';
    this.setVelocity(0, 0);
    this.setTint(0x555555); // Turn gray
    this.body!.checkCollision.none = true;
    
    // Massive loot drop event
    this.scene.events.emit('boss-died', this.x, this.y);
    
    // Boss explosion effect
    this.scene.tweens.add({
      targets: this,
      scale: 1.5,
      alpha: 0,
      duration: 1500,
      onComplete: () => this.destroy()
    });
  }

  private evaluateState() {
    if (this.aiState === 'DEAD' || !this.target) return;

    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    
    if (distance < 800) {
      this.aiState = 'CHASE';
    } else {
      this.aiState = 'IDLE';
      this.setVelocity(0, 0);
    }
  }

  update() {
    if (this.aiState === 'DEAD') return;

    if (this.aiState === 'CHASE' && this.target) {
      this.scene.physics.moveToObject(this, this.target, this.speed);
    }
  }
}

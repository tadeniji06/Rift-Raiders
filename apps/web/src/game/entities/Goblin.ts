import Phaser from 'phaser';

export class Goblin extends Phaser.Physics.Arcade.Sprite {
  public health: number = 30; // Reduced for ease
  private speed: number = 70; // Reduced for ease
  private target: Phaser.Physics.Arcade.Sprite | null = null;
  private aiState: 'IDLE' | 'CHASE' | 'DEAD' = 'IDLE';
  public lastAttackTime: number;
  public entityType: string = 'goblin';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'goblin');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    
    // Draw placeholder graphic for Goblin
    this.setTexture('goblin');
    this.setDisplaySize(96, 96);
    this.setOrigin(0.5, 0.5);
    
    this.lastAttackTime = scene.time.now;

    // AI timer to check state periodically
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

    if (this.health <= 0) {
      this.die();
    }
  }

  private die() {
    this.aiState = 'DEAD';
    this.setVelocity(0, 0);
    this.setTint(0x555555); // Turn gray
    this.body!.checkCollision.none = true;
    
    // Emit death event for loot drops
    this.scene.events.emit('goblin-died', this.x, this.y);
    
    // Fade out and destroy
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 1000,
      onComplete: () => this.destroy()
    });
  }

  private evaluateState() {
    if (this.aiState === 'DEAD' || !this.target) return;

    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    
    if (distance < 400) {
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

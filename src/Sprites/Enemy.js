class Enemy extends Phaser.GameObjects.Sprite {
    
    constructor(scene, x, y, img, frame, type, speed) {
        super(scene, x, y, img, frame);

        this.type = type;
        this.attackCooldown = Math.random() * (4) + 3;
        this.speed = speed;
        this.scene = scene;

        scene.add.existing(this);
 
        return this;
    }

    update(t, delta) {
        let dt = delta / 1000

        if (this.type == 3) {
            this.attackCooldown -= dt; 
        }

        if (this.active) {
            if (this.type == 1) {
                this.y += this.speed * dt / 4;
                if (this.y > (this.scene.game.config.height + this.displayHeight)) {
                    this.changeStatus(false);
                    this.scene.lives -= 1;
                    this.scene.updateLives();
                    this.scene.remainingEnemies -= 1;
                }
            }
        }
    }

    changeStatus(status) {
        this.visible = status;
        this.active = status;
    }

}
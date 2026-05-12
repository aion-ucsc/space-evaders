class Bullet extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, img, frame, isEnemy, speed) {
        super(scene, x, y, img, frame);

        this.x = x;
        this.y = y;
        this.direction = 1;

        if (isEnemy == null || isEnemy == false) {
            this.deleteHeight = -(this.displayHeight);
            this.changeStatus(false);
        } else {
            this.deleteHeight = scene.game.config.height;
            this.direction = -1;
            this.changeStatus(true);
            scene.add.existing(this);
        }

        if (speed != null) {
            this.speed = speed;
        }

        scene.children.bringToTop(this);

        return this;
    }

    update(t, delta) {
        let dt = delta / 1000;
        if (this.active) {
            this.y -= this.speed * dt * this.direction;
            if (this.deleteHeight < 300 && this.y < this.deleteHeight) {
                this.changeStatus(false);
            }
        }
    }


    changeStatus(status) {
        this.visible = status;
        this.active = status;
    }
}
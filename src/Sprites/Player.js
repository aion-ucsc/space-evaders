class Player extends Phaser.GameObjects.Sprite {
    
    constructor(scene, x, y, img, frame, lKey, rKey, speed) {
        super(scene, x, y, img, frame);

        this.left = lKey;
        this.right = rKey;
        this.speed = speed;

        scene.add.existing(this);

        return this;
    }

    update(t, delta) {
        let dt = delta / 1000;

        if (this.left.isDown) {
            if (this.x > (this.displayWidth)) {
                this.x -= this.speed * dt
            }
        }

        if (this.right.isDown) {
            if (this.x < (game.config.width - (this.displayWidth))) {
                this.x += this.speed * dt
            }
        }
    }

}
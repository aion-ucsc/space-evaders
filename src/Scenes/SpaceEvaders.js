class SpaceEvaders extends Phaser.Scene {
    constructor() {
        super("spaceEvaders")

        this.obj = {sprite: {}, text: {}};

        this.playerSpeed = 250;
        this.bulletSpeed = 400;

        this.bulletCD = 0.5;
        this.bulletCDCounter = 0;

        this.score = 0;
        this.lives = 3;
        this.stagesclear = 0;

        this.restarting = true;
        this.restartTimeOut = 1.5;

        this.direction = 1;
        this.movementIncrement = 25;
    }

    preload() {
        this.load.setPath("./assets/Kenney_space-shooter-remastered");
        
        this.load.image("bg", "/Backgrounds/darkPurple.png");

        this.load.image("pSatellite", "/PNG/Enemies/enemyBlack1.png");
        this.load.image("pBullet", "/PNG/Lasers/laserBlue05.png");
        this.load.image("eBullet", "/PNG/Lasers/laserGreen05.png");

        this.load.image("sFlare", "/PNG/Lasers/laserRed05.png");
        this.load.image("meteor", "/PNG/Meteors/meteorBrown_big3.png");
       
        this.load.setPath("./assets/Kenney_space-shooter-extension/PNG");

        this.load.image("eSatellite", "/Sprites/Ships/spaceShips_004.png");
        this.load.image("fuelTank", "/Sprites/Rockets/spaceRockets_004.png");

        this.load.setPath("./assets");
        
        this.load.bitmapFont('CossetteTexte', "CossetteTexte-Bitmap_0.png", "CossetteTexte-Bitmap.fnt");

        this.load.audio("explosion_sound", "explosion.wav");
        this.load.audio("laser_sound", "laser.wav");
        this.load.audio("win_sound", "win.wav");
        this.load.audio("lose_sound", "lose.wav");
    }

    create() {
        let obj = this.obj;

        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.space = this.input.keyboard.addKey("SPACE");

        obj.sprite.bg = this.add.sprite(game.config.width/2, game.config.height/2, "bg");
        obj.sprite.bg.setScale(4);

        this.points = [

        ]

        obj.text.health = this.add.bitmapText(0,510, "CossetteTexte", "LIVES: 3");
        obj.text.score = this.add.bitmapText(0,540, "CossetteTexte", "SCORE: 0");
        obj.text.stagesclear = this.add.bitmapText(0,570, "CossetteTexte", "STAGES CLEAR: 0");
        obj.text.endText = this.add.bitmapText(325,250, "CossetteTexte", "STAGE CLEAR");
        obj.text.endText.visible = false;

        this.explosion = this.sound.add("explosion_sound", {volume: 0.75, loop: false});
        this.laser = this.sound.add("laser_sound", {volume: 0.5, loop: false});
        this.winSound = this.sound.add("win_sound", {volume: 0.75, loop: false});
        this.loseSound = this.sound.add("lose_sound", {volume: 0.75, loop: false});
    }

    init_game() {
        let obj = this.obj;

        this.remainingEnemies = 0;

        this.obj.sprite.enemies = [];
        this.obj.sprite.enemyBullets = [];
        this.paths = [];
        this.curves = [];

        obj.sprite.pSatellite = new Player(this, this.game.config.width/2, game.config.height - 40, "pSatellite", null, this.left, this.right, this.playerSpeed);
        obj.sprite.pSatellite.setScale(0.5);
        obj.sprite.pSatellite.rotation = Math.PI;

        obj.sprite.bulletGroup = this.add.group({
            active: true,
            defaultKey: "pBullet",
            maxSize: 3, 
            runChildUpdate: true,
            setScale: 0.5
        });
        
        obj.sprite.bulletGroup.createMultiple({
            classType: Bullet,
            active: false,
            key: obj.sprite.bulletGroup.defaultKey,
            repeat: obj.sprite.bulletGroup.maxSize - 1,
        });
        obj.sprite.bulletGroup.propertyValueSet("speed", this.bulletSpeed);

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                let enemyType = null;
                let enemySprite = null;
                let rand = Math.ceil(Math.random() * 100);

                if (rand < 50) { 
                    enemyType = 2;
                    enemySprite = "meteor";
                } else if (rand < 75) {
                    enemyType = 3;
                    enemySprite = "eSatellite";
                } else if (rand < 90) {
                    enemyType = 1;
                    enemySprite = "sFlare";
                } else if (rand <= 100) {
                    enemyType = 4;
                    enemySprite = "fuelTank"
                }

                let x = (j+2) * this.game.config.width/10;
                let y = (i+1) * this.game.config.height/10;

                obj.sprite.enemies[j + i * 7] = new Enemy(this, x, y, enemySprite, null, enemyType, 100);
                this.remainingEnemies += 1;
                
                if (enemyType == 1) {
                    obj.sprite.enemies[j + i * 7].setScale(1.5);
                } else if (enemyType == 4) {
                    obj.sprite.enemies[j + i * 7].setScale(0.15);
                    obj.sprite.enemies[j + i * 7].rotation = Math.PI;
                } else {
                    obj.sprite.enemies[j + i * 7].setScale(0.5);
                }

                //I'm leaving this here as a small little reminder of my suffering with pathing

                /*if (enemyType != 1) {
                    this.paths[j + i * 7] = [];

                    this.paths[j + i *7].push(
                        x, y,
                    )
                    for (let i2 = i; i2 < 6; i2++) {
                        if (i2 % 2 == 0) {
                            this.paths[j + i * 7].push(
                                x + this.game.config.width * 0.4, y + i2 * this.game.config.height/10,
                                this.game.config.width + x, y + (i2+1) * this.game.config.height/10,
                            )
                        } else {
                            this.paths[j + i * 7].push(
                                x + this.game.config.width * -0.4, y + i2 * this.game.config.height/10,
                                this.game.config.width - x, y + (i2+1) * this.game.config.height/10,
                            )
                        }
                    }

                    this.curves[j + i * 7] = new Phaser.Curves.Spline(this.paths[j + i * 7]);

                    console.log(this.curves[j + i * 7])

                    let initPoint = this.curves[j + i * 7].points[0];
                    if (this.curves[j + i * 7].points[0]) {
                        obj.sprite.enemies[j + i * 7].x = initPoint.x;
                        obj.sprite.enemies[j + i * 7].y = initPoint.y;
                        obj.sprite.enemies[j + i * 7].startFollow({
                            from: 0,
                            to: 1,
                            delay: 0,
                            duration : this.curves[j + i * 7] / 100 * 1000,
                            ease: 'Sine.easeInOut',
                            repeat : -1,
                            yoyo : false,
                            rotateToPath: false,
                        });
                    }
                }*/

            }
        }

        this.restarting = false;


    }

    destroy_game() {
        let obj = this.obj;

        for (let sprite of obj.sprite.enemies) {
            if (sprite != null) {
                sprite.destroy();
                sprite = null;
            }
        }

        for (let sprite of obj.sprite.enemyBullets) {
            if (sprite != null) {
                sprite.destroy();
                sprite = null;
            }
        }

        this.paths = [];
        this.curves = [];
        obj.sprite.pSatellite.destroy();

        for (let sprite of obj.sprite.bulletGroup.getChildren()) {
            sprite.destroy();
        }

        obj.sprite.bulletGroup.clear(true);
    }

    update(t, delta) {

        let obj = this.obj;
        let dt = delta/1000

        if (this.restarting) {
            if (this.restartTimeOut < 2) {
                this.restartTimeOut += dt;
            } else {
                obj.text.endText.visible = false;
                this.init_game();
                this.restartTimeOut = 0;
            }
            return;
        } else if (this.remainingEnemies == 0) {
            this.restarting = true;
            this.destroy_game();

            this.stagesclear += 1;
            this.lives += 1;
            this.updateLives();
            this.winSound.play();

            
            obj.text.stagesclear.setText("STAGES CLEAR: " + this.stagesclear);
            obj.text.endText.setText("STAGE CLEAR!");
            obj.text.endText.visible = true;
            
            return;
        } else if (this.lives <= 0) {
            this.restarting = true;
            this.destroy_game();

            this.lives = 3;
            this.score = 0;
            this.stagesclear = 0;
            this.loseSound.play();
            
            obj.text.stagesclear.setText("STAGES CLEAR: " + this.stagesclear);
            this.updateScore();
            this.updateLives(); 
            obj.text.endText.setText("GAME OVER!");
            obj.text.endText.visible = true;
            
            return;
        }
        
        this.bulletCDCounter -= dt;

        if (this.space.isDown) {
            if (this.bulletCDCounter < 0) {
                let bullet = obj.sprite.bulletGroup.getFirstDead();
                if (bullet != null) {
                    this.bulletCDCounter = this.bulletCD;
                    bullet.changeStatus(true);
                    bullet.x = obj.sprite.pSatellite.x;
                    bullet.y = obj.sprite.pSatellite.y - (obj.sprite.pSatellite.displayHeight/2);
                    this.laser.play();
                }
            }
        }

        for (let bullet of obj.sprite.bulletGroup.getChildren()) {
            if (bullet.active) {
                for (let sprite of obj.sprite.enemies) {
                    if (sprite != null && this.collides(sprite, bullet)) {
                        bullet.changeStatus(false);
                        this.register_collision(sprite);
                    }
                }
            }
        }

        obj.sprite.pSatellite.update(t, delta);

        let directionCheck = false;

        for (let sprite of obj.sprite.enemies) {
            if (sprite != null) {
                sprite.update(t, delta);

                let index = obj.sprite.enemies.indexOf(sprite);

                if (sprite.type == 3 && sprite.attackCooldown <= 0) {
                    obj.sprite.enemyBullets.push(new Bullet(
                        this, sprite.x, sprite.y + sprite.displayHeight/2, "eBullet", null, true, 200)
                    );
                    sprite.attackCooldown = Math.random() * (4) + 3;
                } else if (sprite.type == 1) {
                    if (sprite.y >= this.game.config.height - 2 * obj.sprite.pSatellite.displayHeight) {
                        if (this.collides(sprite, this.obj.sprite.pSatellite)) {
                            obj.sprite.enemies[index].y = 1000;
                        }
                    }
                }

                if (sprite.type != 1) {
                    if (this.direction > 0) {
                        if (sprite.x > 19 * this.game.config.width/20) {
                            this.direction = -1;
                            directionCheck = true;
                        }
                    } else {
                        if (sprite.x < this.game.config.width/20) {
                            this.direction = 1;
                            directionCheck = true;
                        }
                    }
                }

            }
        }

        if (directionCheck) {
            for (let sprite of obj.sprite.enemies) {
                if (sprite != null && sprite.type != 1) {
                    sprite.y += this.game.config.height/10;
                    if (sprite.y >= this.game.config.height * 9/10) {
                        this.lives = -999;
                    }
                }
            }
        } else {
            for (let sprite of obj.sprite.enemies) {
                if (sprite != null && sprite.type != 1) {
                    sprite.x += this.movementIncrement * dt * this.direction;
                }
            }
        }
        
        obj.sprite.enemyBullets = obj.sprite.enemyBullets.filter((bullet) => bullet.y < (this.game.config.height + bullet.displayHeight/2));

        for (let bullet of obj.sprite.enemyBullets) {
            if (bullet != null) {
                bullet.update(t, delta);
                if (bullet.y >= this.game.config.height + bullet.displayHeight/2) {
                    
                    bullet.changeStatus(false);
                }
                if (bullet.y >= this.game.config.height - 2 * obj.sprite.pSatellite.displayHeight) {
                    if (this.collides(bullet, this.obj.sprite.pSatellite)) {
                        let index = obj.sprite.enemyBullets.indexOf(bullet)
                        bullet.destroy();
                        obj.sprite.enemyBullets[index].y = 1000;

                        this.lives -= 1;
                        this.explosion.play()
                        this.updateLives();
                    }
                }
            }
        }

    }

    register_collision(sprite) {
        let spriteType = sprite.type;
        let enemies = this.obj.sprite.enemies;
        let index = enemies.indexOf(sprite);

        sprite.destroy();
        enemies[index] = null;

        if (spriteType == 1) {
            this.score += 150;
        } else if (spriteType == 2) {
            this.score += 100;
        } else if (spriteType == 3) {
            this.score += 250;
        } else if (spriteType == 4) {
            this.score += 400;
            if (index % 7 != 0 && enemies[index-1] != null && enemies[index-1].type != 1) {
                this.register_collision(enemies[index-1]);
            }
            if (index > 6 && enemies[index-7] != null && enemies[index-7].type != 1) {
                this.register_collision(enemies[index-7]);
            }
            if (index % 7 != 6 && enemies[index+1] != null && enemies[index+1].type != 1) {
                this.register_collision(enemies[index+1]);
            }
            if (index < 35 && enemies[index+7] != null && enemies[index+7 ].type != 1) {
                this.register_collision(enemies[index+7]);
            }
        }

        this.updateScore()
        this.explosion.play();
        this.remainingEnemies -= 1;
    }

    collides(a, b) {
        if (Math.abs(a.x-b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y-b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    updateScore() {
        let obj = this.obj
        obj.text.score.setText("SCORE: " + this.score)
    }

    updateLives() {
        let obj = this.obj
        obj.text.health.setText("LIVES: " + this.lives)
    }

}
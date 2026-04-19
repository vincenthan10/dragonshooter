import Player from "./player.js";
import Dragon from "./dragon.js";
export default class MysteryBox {
    constructor(player, dragon) {
        this.player = player;
        this.dragon = dragon;

        this.img = new Image();
        this.img.src = "images/mysterybox.png";
        this.BASEIMGWIDTH = 80;
        this.BASEIMGHEIGHT = 80;
        this.imageWidth = this.BASEIMGWIDTH;
        this.imageHeight = this.BASEIMGHEIGHT;
        this.width = 0;
        this.height = 0;

        this.active = false;
        this.playerCollected = false;
        this.dragonCollected = false;
        this.effectNumber = 0;
        this.activeTime = 0;
        this.inactiveTime = 0;
        this.affectTime = 0;
        this.spawnTime = Math.random() * 12500 + 2500;
        this.despawnTime = Math.random() * 2500 + 5000;
        this.effectTime = Math.random() * 3000 + 4500;
        this.x = Math.random() * 0.9 + 0.05;
        this.y = Math.random() * 0.7 + 0.25;
    }

    draw(ctx, mapWidth, mapHeight) {
        ctx.save();
        if (this.active) {
            ctx.drawImage(this.img, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight)
        }
        ctx.restore();
    }

    update(deltaTime, mapWidth, mapHeight, baseWidth, baseHeight) {
        if (this.active) {
            this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth);
            this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight);
            this.width = this.imageWidth / mapWidth;
            this.height = this.imageHeight / mapHeight;
            this.activeTime += deltaTime;
            if (this.activeTime >= this.despawnTime) {
                this.active = false;
                this.activeTime = 0;
                this.despawnTime = Math.random() * 2500 + 5000;
                this.x = Math.random() * 0.9 + 0.05;
                this.y = Math.random() * 0.7 + 0.25;
            }
        } else {
            this.inactiveTime += deltaTime;
            if (this.inactiveTime >= this.spawnTime) {
                this.active = true;
                this.inactiveTime = 0;
                this.spawnTime = Math.random() * 8000 + 9000;
            }
        }
        if (this.playerCollected || this.dragonCollected) {
            this.affectTime += deltaTime;
            if (this.affectTime >= this.effectTime) {
                if (this.playerCollected) {
                    this.playerCollected = false;
                    this.playerEffect(this.player, false, this.effectNumber);
                } 
                if (this.dragonCollected) {
                    this.dragonCollected = false;
                    this.dragonEffect(this.dragon, false);
                }
                this.affectTime = 0;
                this.effectTime = Math.random() * 3000 + 4500;
            }
        }
    }

    isColliding(entity) {
        if (this.active && this.x + this.width >= entity.x && this.x <= entity.x + entity.width && this.y + this.height >= entity.y && this.y <= entity.y + entity.height) {
            this.active = false;
            return true;
        }
        return false;
    }

    playerEffect(player, collected, effectNumber) {
        let rolled = (effectNumber == 0) ? Math.floor(Math.random() * 2) + 1 : effectNumber;
        switch (rolled) {
            case 1:
                player.speedX = collected ? player.baseSpeedX * 1.4 : player.baseSpeedX;
                player.speedY = collected ? player.baseSpeedY * 1.4 : player.baseSpeedY;
                break;
            case 2:
                player.shootingDelay = collected ? player.baseShootingDelay * 0.6 : player.baseShootingDelay;
                break;
        }
        this.effectNumber = collected ? rolled : 0;
    }

    dragonEffect(dragon, collected) {
        dragon.speedMultiplier = collected ? 1.8 : 1;
    }
}

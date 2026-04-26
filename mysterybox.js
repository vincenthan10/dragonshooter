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
                this.inactiveTime = 0;
                this.despawnTime = Math.random() * 2000 + 4000;
                this.x = Math.random() * 0.9 + 0.05;
                this.y = Math.random() * 0.7 + 0.25;
            }
        } else {
            this.inactiveTime += deltaTime;
            if (this.inactiveTime >= this.spawnTime) {
                this.active = true;
                this.activeTime = 0;
                this.inactiveTime = 0;
                this.spawnTime = Math.random() * 10000 + 10000;
            }
        }
        if (this.player.collected || this.dragon.collected) {
            this.affectTime += deltaTime;
            if (this.affectTime >= this.effectTime) {
                if (this.player.collected) {
                    this.player.collected = false;
                    this.playerEffect(this.player, false, this.effectNumber);
                } 
                if (this.dragon.collected) {
                    this.dragon.collected = false;
                    this.dragonEffect(this.dragon, false, this.effectNumber);
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
        let rolled = (effectNumber == 0) ? Math.floor(Math.random() * 8) + 1 : effectNumber;
        switch (rolled) {
            case 1:
                player.speedMultiplier = collected ? 1.5 : 1;
                break;
            case 2:
                player.fireRateMultiplier = collected ? 0.65 : 1;
                break;
            case 3:
                player.fireRateMultiplier = collected ? 1.2 : 1;
                player.bulletDmg = collected ? 2 : 1;
                break;
            case 4:
                player.speedMultiplier = collected ? 0.75 : 1;
                player.fireRateMultiplier = collected ? 1.4 : 1;
                player.sizeMultiplier = collected ? 1.3 : 1;
                player.bulletDmg = collected ? 3 : 1;
                break;
            case 5:
                player.speedMultiplier = collected ? 1.3 : 1;
                player.fireRateMultiplier = collected ? 0.8 : 1;
                player.sizeMultiplier = collected ? 0.65 : 1;
                break;
            case 6:
                player.fireRateMultiplier = collected ? 1.8 : 1;
                break;
            case 7:
                player.speedMultiplier = collected ? 0.6 : 1;
                player.ltnInvinc = collected ? true : false;
                break;
            case 8:
                player.speedMultiplier = collected ? 2 : 1;
                player.fireRateMultiplier = collected ? 2 : 1;
                break;

        }
        this.effectNumber = collected ? rolled : 0;
    }

    dragonEffect(dragon, collected, effectNumber) {
        let rolled = (effectNumber == 0) ? Math.floor(Math.random() * 5) + 1 : effectNumber;
        switch (rolled) {
            case 1:
                dragon.speedMultiplier = collected ? 1.8 : 1;
                break;
            case 2:
                dragon.speedMultiplier = collected ? 0.85 : 1;
                dragon.sizeMultiplier = collected ? 1.2 : 1;
                break;
            case 3:
                dragon.sizeMultiplier = collected ? 0.6 : 1;
                dragon.speedMultiplier = collected ? 1.5 : 1;
                dragon.moveMultiplier = collected ? 0.3 : 1;
                break;
            case 4:
                dragon.speedMultiplier = collected ? 0.75 : 1;
                dragon.fireRateMultiplier = collected ? 0.4 : 1;
                dragon.moveMultiplier = collected ? 1.25 : 1;
                dragon.ltnInvinc = collected ? true : false;
                break;
            case 5:
                if (collected) {
                    let heal = Math.round(Math.random() * 12 + 6);
                    dragon.hp = Math.min(dragon.hp + heal, dragon.maxHp);
                }
                break;
        }
        this.effectNumber = collected ? rolled : 0;
    }
}

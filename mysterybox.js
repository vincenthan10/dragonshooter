export default class MysteryBox {
    constructor() {

        this.img = new Image();
        this.img.src = "images/mysterybox.png";
        this.BASEIMGWIDTH = 80;
        this.BASEIMGHEIGHT = 80;
        this.imageWidth = this.BASEIMGWIDTH;
        this.imageHeight = this.BASEIMGHEIGHT;
        this.width = 0;
        this.height = 0;

        this.active = false;
        this.collected = false;
        this.activeTime = 0;
        this.inactiveTime = 0;
        this.affectTime = 0;
        this.spawnTime = Math.random() * 12500 + 2500;
        this.despawnTime = Math.random() * 2500 + 5000;
        this.effectTime = Math.random() * 1250 + 7500;
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
        if (this.collected) {
            this.affectTime += deltaTime;
            if (this.affectTime >= this.effectTime) {
                this.collected = false;
                this.affectTime = 0;
                this.effectTime = Math.random() * 1250 + 7500;
            }
        }
    }

    collisionHandler(entity) {
        if (this.active && this.x + this.width >= entity.x && this.x <= entity.x + entity.width && this.y + this.height >= entity.y && this.y <= entity.y + entity.height) {
            this.collected = true;
            this.active = false;
        }
    }
}
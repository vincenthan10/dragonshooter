export default class Bullet {
    constructor(x, y, dir, damage, sizeMultiplier) {
        this.x = x;
        this.y = y;
        this.baseSpeed = 0.0072;
        this.speed = this.baseSpeed * dir;
        this.damage = damage;
        this.sizeMultiplier = sizeMultiplier;
        this.img = new Image();
        this.img.src = "images/bullet.png";
        this.BASEIMGWIDTH = 36;
        this.BASEIMGHEIGHT = 24;
        this.imageWidth = this.BASEIMGWIDTH * this.sizeMultiplier;
        this.imageHeight = this.BASEIMGHEIGHT * this.sizeMultiplier;
        this.width = 0;
        this.height = 0;
    }

    draw(ctx, mapWidth, mapHeight) {
        ctx.save();
        ctx.drawImage(this.img, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
        ctx.restore();
    }

    update(deltaTime, mapWidth, mapHeight, baseWidth, baseHeight) {
        this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth) * this.sizeMultiplier;
        this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight) * this.sizeMultiplier;
        this.width = this.imageWidth / mapWidth;
        this.height = this.imageHeight / mapHeight;
        this.x += this.speed;
    }

    isColliding(entity) {
        if (this.x + this.width * 0.8 >= entity.x && this.x <= entity.x + entity.width * 0.9 && this.y + this.height * 0.85 >= entity.y && this.y <= entity.y + entity.height * 0.9) {
            return true;
        }
        return false;
    }
}

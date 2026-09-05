export default class Ice {
    constructor(x, y, damage) {
        this.x = x;
        this.y = y;
        this.baseSpeed = 0.005;
        this.speed = this.baseSpeed;
        this.damage = damage;

        this.img = new Image();
        this.img.src = "images/ice.png";
        this.BASEIMGWIDTH = 25;
        this.BASEIMGHEIGHT = 37;
        this.imageWidth = this.BASEIMGWIDTH;
        this.imageHeight = this.BASEIMGHEIGHT;
        this.width = 0;
        this.height = 0;
    }

    draw(ctx, mapWidth, mapHeight) {
        ctx.save();
        ctx.drawImage(this.img, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
        ctx.restore();
    }

    update(deltaTime, mapWidth, mapHeight, baseWidth, baseHeight) {
        this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth);
        this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight);
        this.width = this.imageWidth / mapWidth;
        this.height = this.imageHeight / mapHeight;
        this.y += this.speed;
    }

    isColliding(entity) {
        return this.x + this.width * 0.8 >= entity.x &&
            this.x <= entity.x + entity.width * 0.9 &&
            this.y + this.height * 0.85 >= entity.y &&
            this.y <= entity.y + entity.height * 0.9;
    }
}
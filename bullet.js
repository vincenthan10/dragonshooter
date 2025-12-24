export default class Bullet {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.baseSpeed = 0.0067;
        this.speed = this.baseSpeed * dir;

        this.img = new Image();
        this.img.src = "images/bullet.png";
        this.BASEIMGWIDTH = 36;
        this.BASEIMGHEIGHT = 24;
        this.imageWidth = this.BASEIMGWIDTH;
        this.imageHeight = this.BASEIMGHEIGHT;
    }

    draw(ctx, mapWidth, mapHeight) {
        ctx.save();
        ctx.drawImage(this.img, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
        ctx.restore();
    }

    update(deltaTime, mapWidth, mapHeight, baseWidth, baseHeight) {
        this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth);
        this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight);
        this.x += this.speed;
    }
}

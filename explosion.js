export default class Explosion {
    constructor(x, y, src, baseWidth, baseHeight, drawTime, sizeMultiplier) {
        this.x = x;
        this.y = y;
        this.img = new Image();
        this.img.src = src;
        this.BASEIMAGEWIDTH = baseWidth;
        this.BASEIMAGEHEIGHT = baseHeight;
        this.imageWidth = this.BASEIMAGEWIDTH;
        this.imageHeight = this.BASEIMAGEHEIGHT;

        this.active = true;
        this.drawTime = drawTime;
        this.timeAlive = 0;
        this.sizeMultiplier = sizeMultiplier;
    }

    draw(ctx, mapWidth, mapHeight) {
        ctx.save();
        if (this.active) {
            ctx.drawImage(this.img, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
        }
        ctx.restore();
    }

    update(deltaTime, mapWidth, mapHeight, baseWidth, baseHeight) {
        this.imageWidth = this.BASEIMAGEWIDTH * (mapWidth / baseWidth) * this.sizeMultiplier;
        this.imageHeight = this.BASEIMAGEHEIGHT * (mapHeight / baseHeight) * this.sizeMultiplier;
        this.timeAlive += deltaTime;
        if (this.timeAlive >= this.drawTime) {
            this.active = false;
        }
    }
}

export default class Explosion {
    constructor(x, y, src, baseWidth, baseHeight) {
        this.x = x;
        this.y = y;
        this.img = new Image();
        this.img.src = src;
        this.BASEIMAGEWIDTH = baseWidth;
        this.BASEIMAGEHEIGHT = baseHeight;
        this.width = 0;
        this.height = 0;

        this.active = true;
        this.drawTime = 400;
        this.timeSinceDraw = 0;
    }

    draw(ctx, mapWidth, mapHeight) {
        ctx.save();
        if (this.active) {
            ctx.drawImage(this.img, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
        }
        ctx.restore();
    }

    update(deltaTime, mapWidth, mapHeight, baseWidth, baseHeight) {
        this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth);
        this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight);
        let now = performance.now();
        if (now - timeSinceDraw >= drawTime) {
            active = false;
        }
    }
}
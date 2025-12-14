export default class Dragon {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.img = new Image();
        this.img.src = "images/greendragon.png";
        this.BASEIMGWIDTH = 210;
        this.BASEIMGHEIGHT = 233;
    }

    draw(ctx, mapWidth, mapHeight, baseWidth, baseHeight) {
        ctx.save();
        ctx.drawImage(this.img, this.x * mapWidth, this.y * mapHeight, this.BASEIMGWIDTH * (mapWidth / baseWidth), this.BASEIMGHEIGHT * (mapHeight / baseHeight));
        ctx.restore();
    }
}

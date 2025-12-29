export default class Cloud {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.img = new Image();
        this.img.src = "images/cloud.png";

        this.ltnImg = new Image();
        this.ltnImg.src = "images/lightning.png";
        this.BASEIMGWIDTH = 109;
        this.BASEIMGHEIGHT = 556;
        this.imageWidth = this.BASEIMGWIDTH;
        this.imageHeight = this.BASEIMGHEIGHT;
        this.width = 0;
        this.height = 0;

    }

    draw(ctx, mapWidth, mapHeight, baseWidth, baseHeight) {
        ctx.save();
        ctx.drawImage(this.img, this.x, this.y, mapWidth * 1.2, mapHeight * 0.12);
        ctx.drawImage(this.ltnImg, 0.5 * mapWidth - this.imageWidth / 2, mapHeight * 0.08, this.imageWidth, this.imageHeight);

        ctx.beginPath();
        ctx.moveTo(0.5 * mapWidth, mapHeight * 0.08);
        ctx.lineTo(0.5 * mapWidth, mapHeight);
        ctx.strokeStyle = "#0b4f73ff";
        ctx.stroke();
        ctx.restore();
    }

    update(deltaTime, mapWidth, mapHeight, canvas, baseWidth, baseHeight) {
        this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth);
        this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight);
        this.width = this.imageWidth / mapWidth;
        this.height = this.imageHeight / mapHeight;
    }
}

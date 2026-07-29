export default class LightningHelmet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.maxHp = 45;
        this.hp = this.maxHp;
        this.alive = false;

        this.img = new Image();
        this.img.src = "images/lightninghelmet.png";
        this.BASEIMGWIDTH = 64;
        this.BASEIMGHEIGHT = 24;
        this.imageWidth = this.BASEIMGWIDTH;
        this.imageHeight = this.BASEIMGHEIGHT;
        this.icon = new Image();
        this.icon.src = "images/lightninghelmeticon.png";
        this.BASEICONWIDTH = 54;
        this.BASEICONHEIGHT = 33;
        this.sizeMultiplier = 1;
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
    }
}

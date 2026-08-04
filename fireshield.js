export default class FireShield {
    constructor(x, y, sizeMultiplier) {
        this.x = x;
        this.y = y;
        this.maxHp = 3;
        this.hp = this.maxHp;
        this.alive = false;

        this.img = new Image();
        this.img.src = "images/fireshield.png";
        this.BASEIMGWIDTH = 54;
        this.BASEIMGHEIGHT = 80;
        this.imageWidth = this.BASEIMGWIDTH;
        this.imageHeight = this.BASEIMGHEIGHT;
        this.icon = new Image();
        this.icon.src = "images/fireshieldicon.png";
        this.BASEICONWIDTH = 42;
        this.BASEICONHEIGHT = 56;
        this.sizeMultiplier = sizeMultiplier;
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
    }
}
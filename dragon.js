export default class Dragon {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.img = new Image();
        this.img.src = "images/greendragon.png";
    }

    draw(ctx) {
        ctx.save();
        ctx.drawImage(this.img, this.x, this.y);
    }
}
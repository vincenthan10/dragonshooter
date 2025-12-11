export default class Cloud {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.img = new Image();
        this.img.src = "images/cloud.png";
    }

    draw(ctx, canvas) {
        ctx.save();
        ctx.drawImage(this.img, this.x, this.y, canvas.width * 1.2, canvas.height * 0.12);
    }
}
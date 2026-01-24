export default class Dragon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 0.1;

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

    follow(target, deltaTime) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return;

        let newX = this.x + (dx / dist) * this.speed * deltaTime / 1000;
        let newY = this.y + (dy / dist) * this.speed * deltaTime / 1000;
        this.x = newX;
        this.y = newY;
    }
}

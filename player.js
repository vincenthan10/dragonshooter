export default class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 0.00235;
        this.alive = true;

        this.img = new Image();
        this.img.src = "images/player.png";
        this.BASEIMGWIDTH = 150;
        this.BASEIMGHEIGHT = 95;
    }

    draw(ctx, mapWidth, mapHeight, baseWidth, baseHeight) {
        ctx.save();
        ctx.drawImage(this.img, this.x * mapWidth, this.y * mapHeight, this.BASEIMGWIDTH * (mapWidth / baseWidth), this.BASEIMGHEIGHT * (mapHeight / baseHeight));
        ctx.restore();
    }

    update(deltaTime, keysPressed, mapWidth, mapHeight, canvas, baseWidth, baseHeight) {
        if (this.alive) {
            let dx = 0;
            let dy = 0;
            if (keysPressed.has("w") || keysPressed.has("arrowup")) dy -= this.speed * (mapHeight / baseHeight);
            if (keysPressed.has("s") || keysPressed.has("arrowdown")) dy += this.speed * (mapHeight / baseHeight);
            if (keysPressed.has("a") || keysPressed.has("arrowleft")) dx -= this.speed * (mapWidth / baseWidth);
            if (keysPressed.has("d") || keysPressed.has("arrowright")) dx += this.speed * (mapWidth / baseWidth);
            if (dx !== 0 && dy !== 0) {
                dx /= Math.sqrt(2);
                dy /= Math.sqrt(2);
            }
            if (this.x <= 0 && dx < 0) {
                dx = 0;
            }
            if (this.x + this.img.width >= mapWidth && dx > 0) {
                dx = 0;
            }
            if (this.y <= 0 && dy < 0) {
                dy = 0;
            }
            if (this.y + this.img.height >= mapHeight && dy > 0) {
                dy = 0;
            }
            let newX = this.x + dx;
            let newY = this.y + dy;
            this.x = newX;
            this.y = newY;
        }
    }
}

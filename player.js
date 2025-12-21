import Bullet from "./bullet.js";
export default class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speedX = 0.003;
        this.speedY = 0.0054;
        this.alive = true;

        this.img = new Image();
        this.img.src = "images/player.png";
        this.BASEIMGWIDTH = 150;
        this.BASEIMGHEIGHT = 95;
        this.imageWidth = this.BASEIMGWIDTH;
        this.imageHeight = this.BASEIMGHEIGHT;

        this.bullets = [];
    }

    draw(ctx, mapWidth, mapHeight) {
        ctx.save();
        ctx.drawImage(this.img, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
        this.bullets.forEach(b => b.draw(ctx, mapWidth, mapHeight));
        ctx.restore();
    }

    update(deltaTime, keysPressed, mapWidth, mapHeight, canvas, baseWidth, baseHeight) {
        this.bullets.forEach(b => b.update(deltaTime, mapWidth, mapHeight, baseWidth, baseHeight));
        if (this.alive) {
            console.log(this.speedY * (mapHeight / baseHeight));
            this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth);
            this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight);
            let dx = 0;
            let dy = 0;
            if (keysPressed.has("w") || keysPressed.has("arrowup")) dy -= this.speedY * (mapHeight / baseHeight);
            if (keysPressed.has("s") || keysPressed.has("arrowdown")) dy += this.speedY * (mapHeight / baseHeight);
            if (keysPressed.has("a") || keysPressed.has("arrowleft")) dx -= this.speedX * (mapWidth / baseWidth);
            if (keysPressed.has("d") || keysPressed.has("arrowright")) dx += this.speedX * (mapWidth / baseWidth);

            if (dx !== 0 && dy !== 0) {
                dx /= Math.sqrt(2);
                dy /= Math.sqrt(2);
            }
            if (this.x <= -0.05 && dx < 0) {
                dx = 0;
            }
            if (this.x + this.imageWidth / mapWidth >= 1.05 && dx > 0) {
                dx = 0;
            }
            if (this.y <= 0.12 && dy < 0) {
                dy = 0;
            }
            if (this.y + this.imageHeight / mapHeight >= 1.05 && dy > 0) {
                dy = 0;
            }
            let newX = this.x + dx;
            let newY = this.y + dy;
            this.x = newX;
            this.y = newY;
            // console.log(this.x + ", " + this.y);
        }
    }

    shoot() {
        this.bullets.push(new Bullet(this.x, this.y, 0));
    }
}

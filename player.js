import Bullet from "./bullet.js";
export default class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speedX = 0.13;
        this.speedY = 0.3;
        this.alive = true;

        this.img = new Image();
        this.img.src = "images/player.png";
        this.BASEIMGWIDTH = 150;
        this.BASEIMGHEIGHT = 95;
        this.imageWidth = this.BASEIMGWIDTH;
        this.imageHeight = this.BASEIMGHEIGHT;

        this.bullets = [];
        this.lastShootTime = 0;
        this.shootingDelay = 700;
    }

    draw(ctx, mapWidth, mapHeight) {
        ctx.save();
        ctx.drawImage(this.img, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
        this.bullets.forEach(b => b.draw(ctx, mapWidth, mapHeight));
        ctx.restore();
    }

    update(deltaTime, keysPressed, mapWidth, mapHeight, canvas, baseWidth, baseHeight) {
        this.bullets.forEach(b => b.update(deltaTime, mapWidth, mapHeight, baseWidth, baseHeight));
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            if (this.bullets[i].x <= -0.1 || this.bullets[i].x + this.bullets[i].imageWidth / mapWidth >= 1.1) {
                this.bullets.splice(i, 1);
            }
        }
        if (this.alive) {
            const dt = deltaTime / 1000;
            // console.log(this.speedY * (mapHeight / baseHeight));
            this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth);
            this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight);
            let dx = 0;
            let dy = 0;
            if (keysPressed.has("KeyW") || keysPressed.has("ArrowUp")) dy -= this.speedY * dt;
            if (keysPressed.has("KeyS") || keysPressed.has("ArrowDown")) dy += this.speedY * dt;
            if (keysPressed.has("KeyA") || keysPressed.has("ArrowLeft")) dx -= this.speedX * dt;
            if (keysPressed.has("KeyD") || keysPressed.has("ArrowRight")) dx += this.speedX * dt;

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
        this.bullets.push(new Bullet(this.x, this.y + 0.02, -1));
    }
}

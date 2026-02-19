import Bullet from "./bullet.js";
export default class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speedX = 0.15;
        this.speedY = 0.33;
        this.alive = true;
        this.maxHp = 1;
        this.hp = this.maxHp;
        this.facing = -1; // - = left, + = right

        this.img = new Image();
        this.img.src = "images/player.png";
        this.imgR = new Image();
        this.imgR.src = "images/playerR.png";
        this.BASEIMGWIDTH = 150;
        this.BASEIMGHEIGHT = 92;
        this.imageWidth = this.BASEIMGWIDTH;
        this.imageHeight = this.BASEIMGHEIGHT;
        this.width = 0;
        this.height = 0;

        this.bullets = [];
        this.shootingDelay = 900;
        this.lastShootTime = this.shootingDelay * -1;
    }

    draw(ctx, mapWidth, mapHeight) {
        ctx.save();
        if (this.alive) {
            if (this.facing < 0) {
                ctx.drawImage(this.img, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
            } else {
                ctx.drawImage(this.imgR, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight)
            }
        }

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
        if (this.hp <= 0) this.alive = false;

        if (this.alive) {
            const dt = deltaTime / 1000;
            // console.log(this.speedY * (mapHeight / baseHeight));
            this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth);
            this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight);
            this.width = this.imageWidth / mapWidth;
            this.height = this.imageHeight / mapHeight;
            let dx = 0;
            let dy = 0;
            if (keysPressed.has("KeyW") || keysPressed.has("ArrowUp")) dy -= this.speedY * dt;
            if (keysPressed.has("KeyS") || keysPressed.has("ArrowDown")) dy += this.speedY * dt;
            const left = keysPressed.has("KeyA") || keysPressed.has("ArrowLeft");
            const right = keysPressed.has("KeyD") || keysPressed.has("ArrowRight");

            if (left && !right) {
                dx -= this.speedX * dt;
            } else if (right && !left) {
                dx = this.speedX * dt;
            }

            if (dx < 0) this.facing = -1;
            else if (dx > 0) this.facing = 1;

            if (dx !== 0 && dy !== 0) {
                dx /= Math.sqrt(2);
                dy /= Math.sqrt(2);
            }
            if (this.x <= -0.05 && dx < 0) {
                dx = 0;
            }
            if (this.x + this.width >= 1.05 && dx > 0) {
                dx = 0;
            }
            if (this.y <= 0.12 && dy < 0) {
                dy = 0;
            }
            if (this.y + this.height >= 1.05 && dy > 0) {
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
        if (this.facing < 0) {
            this.bullets.push(new Bullet(this.x, this.y + 0.02, -1));
        } else {
            this.bullets.push(new Bullet(this.x + this.width, this.y + 0.02, 1));
        }
    }
}

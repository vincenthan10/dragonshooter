import Fireball from "./fireball.js";
export default class Dragon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 0.125;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.facing = 1; // - = left, + = right

        this.img = new Image();
        this.img.src = "images/greendragon.png";
        this.imgL = new Image();
        this.imgL.src = "images/greendragonL.png";
        this.BASEIMGWIDTH = 210;
        this.BASEIMGHEIGHT = 233;
        this.width = 0;
        this.height = 0;

        this.charging = false;
        this.restTime = Math.random() * 1500 + 3000;
        this.chargeTime = Math.random() * 750 + 2750;
        this.lastMoveTime = 0;

        this.fireballs = []
        this.shooting = true;
        this.shootingDelay = 2400;
        this.lastShootTime = 0;
    }

    draw(ctx, mapWidth, mapHeight) {
        ctx.save();
        if (this.facing > 0) {
            ctx.drawImage(this.img, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
        } else {
            ctx.drawImage(this.imgL, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
        }

        this.fireballs.forEach(f => f.draw(ctx, mapWidth, mapHeight));
        ctx.restore();
    }

    update(deltaTime, mapWidth, mapHeight, canvas, baseWidth, baseHeight, target) {
        const now = performance.now();
        this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth);
        this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight);
        this.width = this.imageWidth / mapWidth;
        this.height = this.imageHeight / mapHeight;

        this.fireballs.forEach(f => f.update(deltaTime, mapWidth, mapHeight, baseWidth, baseHeight));
        for (let i = this.fireballs.length - 1; i >= 0; i--) {
            if (this.fireballs[i].x <= -0.1 || this.fireballs[i].x + this.fireballs[i].imageWidth / mapWidth >= 1.1) {
                this.fireballs.splice(i, 1);
            }
        }
        if (this.shooting && now - this.lastShootTime >= this.shootingDelay) {
            this.shoot();
            this.lastShootTime = now;
        }

        if (!this.charging && now - this.lastMoveTime >= this.restTime) {
            let dx = target.x + target.width / 2 - this.x - this.width / 2;
            let dy = target.y + target.height / 2 - this.y - this.height / 2;
            let dist = Math.sqrt(dx * dx + dy * dy);
            this.xSpeed = (dx / dist) * this.speed * deltaTime / 1000;
            this.ySpeed = (dy / dist) * this.speed * deltaTime / 1000;
            if (this.xSpeed > 0) {
                this.facing = 1;
            } else {
                this.facing = -1;
            }
            this.charging = true;
            this.chargeTime = Math.random() * 1000 + 3000;
            this.lastMoveTime = now;
        }
        if (this.charging) {
            let newX = this.x + this.xSpeed;
            let newY = this.y + this.ySpeed;
            this.x = newX;
            this.y = newY;

            if (now - this.lastMoveTime >= this.chargeTime) {
                this.charging = false;
                this.restTime = Math.random() * 1750 + 2750;
                this.lastMoveTime = now;
            }
        }
    }

    isColliding(entity) {
        if (this.x + this.width * 0.8 >= entity.x && this.x <= entity.x + entity.width * 0.9 && this.y + this.height * 0.85 >= entity.y && this.y <= entity.y + entity.height * 0.9) {
            return true;
        }
        return false;
    }

    shoot() {
        if (this.facing < 0) {
            this.fireballs.push(new Fireball(this.x, this.y + 0.075, -1));
        } else {
            this.fireballs.push(new Fireball(this.x + this.width, this.y + 0.075, 1));
        }
    }
}

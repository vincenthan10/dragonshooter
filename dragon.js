import Fireball from "./fireball.js";
export default class Dragon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 0.09;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.facing = 1; // - = left, + = right
        this.maxHp = 25;
        this.hp = this.maxHp;
        this.phase = 1;

        this.img = new Image();
        this.img.src = "images/greendragon.png";
        this.imgL = new Image();
        this.imgL.src = "images/greendragonL.png";
        this.BASEIMGWIDTH = 210;
        this.BASEIMGHEIGHT = 233;
        this.imageWidth = this.BASEIMGWIDTH;
        this.imageHeight = this.BASEIMGHEIGHT;
        this.width = 0;
        this.height = 0;

        this.charging = false;
        this.restTime = Math.random() * 2000 + 4000;
        this.chargeTime = Math.random() * 750 + 2750;
        this.lastMoveTime = 0;

        this.fireballs = []
        this.shooting = true;
        this.shootingDelay = 2500;
        this.lastShootTime = 0;
    }

    draw(ctx, mapWidth, mapHeight) {
        ctx.save();
        if (this.facing > 0) {
            ctx.drawImage(this.img, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
        } else {
            ctx.drawImage(this.imgL, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
        }

        // HP bar
        const barX = this.x * mapWidth;
        const barY = (this.y - 0.02) * mapHeight;
        const barWidth = this.imageWidth;
        const barHeight = this.imageHeight / 15;

        ctx.fillStyle = "red";
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = "limegreen";
        ctx.fillRect(barX, barY, (this.hp / this.maxHp) * barWidth, barHeight);

        if (this.phase == 1) {
            ctx.strokeStyle = "green";
        } else if (this.phase == 2) {
            ctx.strokeStyle = "yellow";
        } else {
            ctx.strokeStyle = "red";
        }
        ctx.lineWidth = 2.5;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        const centerX = barX + barWidth / 2;
        const centerY = barY + barHeight / 2;

        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.fillText(this.hp + "/" + this.maxHp, centerX, centerY);

        this.fireballs.forEach(f => f.draw(ctx, mapWidth, mapHeight));
        ctx.restore();
    }

    update(deltaTime, mapWidth, mapHeight, canvas, baseWidth, baseHeight, target) {
        const now = performance.now();
        this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth);
        this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight);
        this.width = this.imageWidth / mapWidth;
        this.height = this.imageHeight / mapHeight;

        if (this.hp < 0) {
            this.hp = 0;
        }
        if (this.hp >= this.maxHp * 0.6) {
            this.phase = 1;
        } else if (this.hp >= this.maxHp * 0.3 && this.hp < this.maxHp * 0.6) {
            this.phase = 2;
        } else {
            this.phase = 3;
        }

        if (this.phase == 1) {
            this.restTime = Math.random() * 2000 + 4000;
            this.chargeTime = Math.random() * 750 + 2750;
            this.shootingDelay = 2500;
            this.speed = 0.09;
        } else if (this.phase == 2) {
            this.restTime = Math.random() * 1750 + 3250;
            this.chargeTime = Math.random() * 1000 + 3000;
            this.shootingDelay = 2200;
            this.speed = 0.1;
        } else {
            this.restTime = Math.random() * 1000 + 2500;
            this.chargeTime = Math.random() * 1500 + 3500;
            this.shootingDelay = 1750;
            this.speed = 0.115;
        }

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
            this.xSpeed = (dx / dist) * this.speed;
            this.ySpeed = (dy / dist) * this.speed;
            if (this.xSpeed > 0) {
                this.facing = 1;
            } else {
                this.facing = -1;
            }
            this.charging = true;
            console.log(this.chargeTime);
            this.lastMoveTime = now;
        }
        if (this.charging) {
            this.x += this.xSpeed * deltaTime / 1000;
            this.y += this.ySpeed * deltaTime / 1000;
            if (now - this.lastMoveTime >= this.chargeTime) {
                this.charging = false;
                console.log(this.restTime);
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

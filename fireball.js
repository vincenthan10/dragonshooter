export default class Fireball {
    constructor(x, y, dir, damage, sizeMultiplier, health, superType, iceType, homing = false, target = null) {
        this.x = x;
        this.y = y;
        this.baseSpeed = 0.0065;
        this.dir = dir;
        this.damage = damage;
        this.health = health;
        this.sizeMultiplier = sizeMultiplier;
        this.homing = homing;
        this.target = target;
        this.super = superType;
        this.speed = this.baseSpeed * this.dir * (this.super ? 0.15 : 1);
        this.ice = iceType;
        if (dir > 0) {
            this.img = new Image();
            this.img.src = this.ice ? "images/fireballice.png" : "images/fireball.png";
        } else {
            this.img = new Image();
            this.img.src = this.ice ? "images/fireballiceL.png" : "images/fireballL.png";
        }
        this.BASEIMGWIDTH = 55;
        this.BASEIMGHEIGHT = 20;
        this.imageWidth = this.BASEIMGWIDTH * this.sizeMultiplier;
        this.imageHeight = this.BASEIMGHEIGHT * this.sizeMultiplier;
        this.width = 0;
        this.height = 0;
        this.lastAdjustmentTime = 0;
        this.adjustmentInterval = 750; // Update trajectory every 750ms
    }

    draw(ctx, mapWidth, mapHeight) {
        ctx.save();
        const drawX = this.x * mapWidth;
        const drawY = this.y * mapHeight;
        if (this.homing && this.speedY !== undefined) {
            const directionAngle = Math.atan2(this.speedY, this.speed);
            const spriteAngle = this.dir > 0 ? 0 : Math.PI;
            ctx.translate(drawX + this.imageWidth / 2, drawY + this.imageHeight / 2);
            ctx.rotate(directionAngle - spriteAngle);
            ctx.drawImage(this.img, -this.imageWidth / 2, -this.imageHeight / 2, this.imageWidth, this.imageHeight);
        } else {
            ctx.drawImage(this.img, drawX, drawY, this.imageWidth, this.imageHeight);
        }
        ctx.restore();
    }

    update(deltaTime, mapWidth, mapHeight, baseWidth, baseHeight) {
        this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth) * this.sizeMultiplier;
        this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight) * this.sizeMultiplier;
        this.width = this.imageWidth / mapWidth;
        this.height = this.imageHeight / mapHeight;
        // Handle homing bullet trajectory adjustment
        if (this.homing && this.target && this.target.alive) {
            this.lastAdjustmentTime += deltaTime;
            
            if (this.lastAdjustmentTime >= this.adjustmentInterval) {
                // Calculate direction towards target
                const targetCenterX = this.target.x + this.target.width / 2;
                const targetCenterY = this.target.y + this.target.height / 3;
                const bulletCenterX = this.x + this.width / 2;
                const bulletCenterY = this.y + this.height / 3;
                
                const dx = targetCenterX - bulletCenterX;
                const dy = targetCenterY - bulletCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    // Normalize and apply to speed components
                    const normDx = dx / distance;
                    const normDy = dy / distance;
                    
                    this.speed = this.baseSpeed * normDx;
                    this.speedY = this.baseSpeed * normDy;
                } else {
                    this.speedY = 0;
                }
                
                this.lastAdjustmentTime = 0;
            }
        }
        
        this.x += this.speed;
        if (this.homing && this.speedY !== undefined) {
            this.y += this.speedY;
        }
    }

    isColliding(entity) {
        if (this.x + this.width * 0.8 >= entity.x && this.x <= entity.x + entity.width * 0.9 && this.y + this.height * 0.85 >= entity.y && this.y <= entity.y + entity.height * 0.9) {
            return true;
        }
        return false;
    }

    isSuperColliding(entity) {
        if (this.x + this.width * 0.98 >= entity.x && this.x + this.width * 0.5 <= entity.x + entity.width && this.y + this.height >= entity.y && this.y <= entity.y + entity.height) {
            return true;
        }
        return false;
    }
}

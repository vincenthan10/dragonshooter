export default class Bullet {
    constructor(x, y, dir, damage, sizeMultiplier, health, superType, iceType, homing = false, target = null) {
        this.x = x;
        this.y = y;
        this.baseSpeed = 0.0072;
        this.dir = dir;
        this.speed = this.baseSpeed * this.dir;
        this.damage = damage;
        this.sizeMultiplier = sizeMultiplier;
        this.health = health;
        this.img = new Image();
        this.img.src = "images/bullet.png";
        this.iceImg = new Image();
        this.iceImg.src = "images/bulletice.png";
        this.BASEIMGWIDTH = 24;
        this.BASEIMGHEIGHT = 24;
        this.imageWidth = this.BASEIMGWIDTH * this.sizeMultiplier;
        this.imageHeight = this.BASEIMGHEIGHT * this.sizeMultiplier;
        this.width = 0;
        this.height = 0;
        this.super = superType;
        this.ice = iceType;
        this.homing = homing;
        this.target = target;
        this.lastAdjustmentTime = 0;
        this.adjustmentInterval = 750; // Update trajectory every 750ms
    }

    draw(ctx, mapWidth, mapHeight) {
        ctx.save();
        if (this.ice) {
            ctx.drawImage(this.iceImg, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
        } else {
            ctx.drawImage(this.img, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
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
                const targetCenterY = this.target.y + this.target.height / 2;
                const bulletCenterX = this.x + this.width / 2;
                const bulletCenterY = this.y + this.height / 2;
                
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
}

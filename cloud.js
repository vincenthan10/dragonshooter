export default class Cloud {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.img = new Image();
        this.img.src = "images/cloud.png";

        this.ltnImg = new Image();
        this.ltnImg.src = "images/lightning.png";
        this.BASEIMGWIDTH = 109;
        this.BASEIMGHEIGHT = 556;
        this.imageWidth = this.BASEIMGWIDTH;
        this.imageHeight = this.BASEIMGHEIGHT;
        this.width = 0;
        this.height = 0;

        this.warningActive = false
        this.lightningActive = false;
        this.canDamage = false;
        this.strikeInterval = Math.random() * 4500 + 3500;
        this.strikeTimer = 0;
        this.warningTimer = 0;
        this.lightningTimer = 0;
        this.warningTime = 1500;
        this.strikeTime = 400;
        this.strikePosition = 0;
        this.lightningDmg = 10;

    }

    draw(ctx, mapWidth, mapHeight, baseWidth, baseHeight) {
        ctx.save();
        ctx.drawImage(this.img, this.x, this.y, mapWidth * 1.2, mapHeight * 0.12);
        if (this.lightningActive) {
            ctx.drawImage(this.ltnImg, this.strikePosition - this.imageWidth / 2, mapHeight * 0.08, this.imageWidth, this.imageHeight);
        }

        if (this.warningActive) {
            ctx.beginPath();
            ctx.moveTo(this.strikePosition, mapHeight * 0.08);
            ctx.lineTo(this.strikePosition, mapHeight);
            ctx.strokeStyle = "#0b4f73ff";
            ctx.stroke();
        }

        ctx.restore();

    }

    update(deltaTime, mapWidth, mapHeight, canvas, baseWidth, baseHeight) {
        this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth);
        this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight);
        this.width = this.imageWidth / mapWidth;
        this.height = this.imageHeight / mapHeight;

        if (!this.warningActive && !this.lightningActive) {
            this.strikeTimer += deltaTime;

            if (this.strikeTimer >= this.strikeInterval) {
                this.strikeTimer = 0;
                this.strikePosition = Math.random() * mapWidth * 0.90 + mapWidth * 0.05;
                this.warningActive = true;
                this.warningTimer = 0;
            }
        }
        if (this.warningActive) {
            this.warningTimer += deltaTime;
            
            if (this.warningTimer >= this.warningTime) {
                this.warningActive = false;
                this.lightningActive = true;
                this.lightningTimer = 0;
                this.canDamage = true;
                this.lightningDmg = Math.round(Math.random() * 4 + 8);
            }            
        }
        if (this.lightningActive) {
            this.lightningTimer += deltaTime;

            if (this.lightningTimer >= this.strikeTime) {
                this.lightningActive = false;
                this.canDamage = false;

                this.strikeInterval = Math.random() * 5000 + 3000;
            }
        }
    }


    collisionHandler(entity, mapWidth) {
        let relativePosition = this.strikePosition / mapWidth;
        let relativeWidth = this.imageWidth / mapWidth;
        if (this.canDamage && entity.alive && relativePosition - relativeWidth / 3 <= entity.x + entity.width && relativePosition + relativeWidth / 3 >= entity.x) {
            entity.hp -= this.lightningDmg;
            this.canDamage = false;
        }
    }
}

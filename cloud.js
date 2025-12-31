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

        this.warningActive = false;
        this.startTime = 0;
        this.lightningActive = false;
        this.strikeInterval = Math.random() * 4500 + 3500;
        this.lastStrikeTime = 0;
        this.warningTime = 1500;
        this.strikeTime = 400;
        this.strikePosition = 0;

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
        const now = performance.now();
        this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth);
        this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight);
        this.width = this.imageWidth / mapWidth;
        this.height = this.imageHeight / mapHeight;

        if (!this.warningActive && !this.lightningActive && now - this.lastStrikeTime >= this.strikeInterval) {
            this.strikePosition = Math.random() * mapWidth * 0.90 + mapWidth * 0.05;
            this.warningActive = true;
            this.startTime = now;
        }
        if (this.warningActive && now - this.startTime >= this.warningTime) {
            this.warningActive = false;
            this.lightningActive = true;
            this.startTime = now;
        }
        if (this.lightningActive && now - this.startTime >= this.strikeTime) {
            this.lightningActive = false;
            this.lastStrikeTime = now;
            this.strikeInterval = Math.random() * 5000 + 3000;
        }
    }
}

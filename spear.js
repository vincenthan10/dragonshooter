export default class Spear {
    constructor(x, y, sizeMultiplier) {
        this.x = x;
        this.y = y;
        this.maxUses = 8;
        this.uses = this.maxUses;
        this.active = true;
        this.usedThisLevel = false;
        this.attacking = false;
        this.attackDuration = 500;
        this.extensionDuration = 200;
        this.attackTime = 0;
        this.extensionProgress = 0;
        this.facing = 1;
        this.hitboxX = 0;
        this.hitboxWidth = 0;

        this.img = new Image();
        this.img.src = "images/spear.png";
        this.imgL = new Image();
        this.imgL.src = "images/spearL.png";
        this.BASEIMGWIDTH = 175;
        this.BASEIMGHEIGHT = 41;
        this.imageWidth = this.BASEIMGWIDTH;
        this.imageHeight = this.BASEIMGHEIGHT;
        this.icon = new Image();
        this.icon.src = "images/spearicon.png";
        this.BASEICONWIDTH = 64;
        this.BASEICONHEIGHT = 15;
        this.sizeMultiplier = sizeMultiplier;
        this.width = 0;
        this.height = 0;
    }

    draw(ctx, mapWidth, mapHeight) {
        if (!this.active || !this.attacking) {
            return;
        }
        ctx.save();
        ctx.drawImage(
            this.facing > 0 ? this.img : this.imgL,
            this.x * mapWidth,
            this.y * mapHeight,
            this.imageWidth,
            this.imageHeight
        );
        ctx.restore();
    }

    update(deltaTime, mapWidth, mapHeight, baseWidth, baseHeight, player) {
        this.sizeMultiplier = player.sizeMultiplier;
        this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth) * this.sizeMultiplier;
        this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight) * this.sizeMultiplier;
        if (!this.attacking) {
            this.extensionProgress = 0;
            this.width = this.imageWidth / mapWidth;
            this.height = this.imageHeight / mapHeight;
            this.hitboxWidth = 0;
            return;
        }

        if (this.attackTime <= 0) {
            this.attacking = false;
            this.extensionProgress = 0;
            this.hitboxWidth = 0;
            return;
        }

        this.attackTime = Math.max(0, this.attackTime - deltaTime);
        const elapsed = this.attackDuration - this.attackTime;
        this.extensionProgress = Math.min(1, elapsed / this.extensionDuration);
        this.width = this.imageWidth / mapWidth;
        this.height = this.imageHeight / mapHeight;
        const playerSide = this.facing > 0 ? player.x + player.width * 0.8 : player.x + player.width * 0.2;
        const oppositeSide = this.facing > 0 ? player.x + player.width * 0.2 : player.x + player.width * 0.8;
        this.x = this.facing > 0
            ? oppositeSide + (playerSide - oppositeSide) * this.extensionProgress
            : oppositeSide - this.width - (oppositeSide - playerSide) * this.extensionProgress;
        this.y = player.y + (player.height - this.height) / 2;
        this.hitboxX = this.facing > 0 ? playerSide : this.x;
        this.hitboxWidth = this.facing > 0
            ? Math.max(0, this.x + this.width - playerSide)
            : Math.max(0, playerSide - this.x);
    }

    startAttack(facing) {
        if (!this.active || this.attacking || this.usedThisLevel || this.uses <= 0) {
            return false;
        }

        this.uses--;
        this.usedThisLevel = true;
        this.attacking = true;
        this.attackTime = this.attackDuration;
        this.extensionProgress = 0;
        this.hitboxWidth = 0;
        this.facing = facing;
        return true;
    }

    isColliding(entity) {
        return this.hitboxX < entity.x + entity.width &&
            this.hitboxX + this.hitboxWidth > entity.x &&
            this.y < entity.y + entity.height &&
            this.y + this.height > entity.y;
    }
}
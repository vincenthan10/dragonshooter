import Player from "./player.js";
import Ice from "./ice.js";
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
        this.damageInterval = 30;
        this.damageTime = 0;
        this.hitEntities = new Set();
        this.reflectedLightning = [];
        this.strikeInterval = Math.random() * 4500 + 3500;
        this.strikeTimer = 0;
        this.warningTimer = 0;
        this.lightningTimer = 0;
        this.warningTime = 1000;
        this.strikeTime = Math.random() * 230 + 230;
        this.strikePosition = 0;
        this.lightningDmg = 1;
        this.iceSpawnTime = Math.random() * 500 + 1100;
        this.iceSpawnTimer = 0;
        this.ices = [];
        this.iceDamage = 1;

    }

    draw(ctx, mapWidth, mapHeight, baseWidth, baseHeight) {
        ctx.save();
        ctx.drawImage(this.img, this.x, this.y, mapWidth * 1.2, mapHeight * 0.12);
        if (this.lightningActive) {
            ctx.drawImage(this.ltnImg, this.strikePosition - this.imageWidth / 2, mapHeight * 0.08, this.imageWidth, this.imageHeight);
        }
        this.reflectedLightning.forEach(bolt => {
            const startX = bolt.startX * mapWidth;
            const startY = bolt.startY * mapHeight;
            const dx = (bolt.targetX - bolt.startX) * mapWidth;
            const dy = (bolt.targetY - bolt.startY) * mapHeight;
            const length = Math.hypot(dx, dy);
            ctx.save();
            ctx.translate(startX, startY);
            ctx.rotate(Math.atan2(-dx, dy));
            ctx.drawImage(this.ltnImg, -this.imageWidth / 2, 0, this.imageWidth, length);
            ctx.restore();
        });

        if (this.warningActive) {
            ctx.beginPath();
            ctx.moveTo(this.strikePosition, mapHeight * 0.08);
            ctx.lineTo(this.strikePosition, mapHeight);
            ctx.strokeStyle = "#0b4f73ff";
            ctx.stroke();
        }

        ctx.restore();

    }

    update(deltaTime, mapWidth, mapHeight, canvas, baseWidth, baseHeight, level) {
        this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth);
        this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight);
        this.width = this.imageWidth / mapWidth;
        this.height = this.imageHeight / mapHeight;
        this.reflectedLightning.forEach(bolt => {
            bolt.remainingTime -= deltaTime;
        });
        this.reflectedLightning = this.reflectedLightning.filter(bolt => bolt.remainingTime > 0);

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

                this.damageTime = 0;
                this.hitEntities.clear();
            }            
        }
        if (this.lightningActive) {
            this.damageTime += deltaTime;

            if (this.damageTime >= this.damageInterval) {
                this.damageTime = 0;
                this.hitEntities.clear();
            }
            this.lightningTimer += deltaTime;

            if (this.lightningTimer >= this.strikeTime) {
                this.lightningActive = false;

                this.strikeInterval = Math.random() * 5000 + 3000;
                if (level == 8) {
                    this.strikeInterval /= 8;
                } else if ((level >= 10 && level <= 12) || level == 14) {
                    this.strikeInterval *= 3;
                }
                this.strikeTime = Math.random() * 230 + 230;
            }
        }

        this.ices.forEach(ice => ice.update(deltaTime, mapWidth, mapHeight, baseWidth, baseHeight));
        for (let i = this.ices.length - 1; i >= 0; i--) {
            if (this.ices[i].y >= 2) {
                this.ices.splice(i, 1);
            }
        }

        if (level >= 10 && level <= 14) {
            this.iceSpawnTimer += deltaTime;
            if (this.iceSpawnTimer >= this.iceSpawnTime) {
                this.ices.push(new Ice(Math.random() * 0.92 + 0.04, -0.1, this.iceDamage));
                this.iceSpawnTimer = 0;
                this.iceSpawnTime = Math.random() * 500 + 1100;
                if (level == 13) {
                    this.iceSpawnTime /= 2;
                }
                if (level == 14) {
                    this.iceDamage = 2;
                }
            }
        }
    }

    drawIce(ctx, mapWidth, mapHeight) {
        this.ices.forEach(ice => ice.draw(ctx, mapWidth, mapHeight));
    }


    collisionHandler(entity, mapWidth, mapHeight, dragons = []) {
        let relativePosition = this.strikePosition / mapWidth;
        let relativeWidth = this.imageWidth / mapWidth;
        if (this.lightningActive && entity.alive && !entity.ltnInvinc && !this.hitEntities.has(entity) && 
        relativePosition - relativeWidth / 3 <= entity.x + entity.width && 
        relativePosition + relativeWidth / 3 >= entity.x) {
            
            if (entity instanceof Player) {
                if (entity.lightningHelmet.alive) {
                    entity.lightningHelmet.hp -= this.lightningDmg;
                    if (entity.lightningHelmet.hp <= 0) {
                        entity.lightningHelmet.alive = false;
                    }
                    if (entity.lightningHelmet.reflectsLightning) {
                        const playerCenterX = entity.x + entity.width / 2;
                        const playerCenterY = entity.y + entity.height / 2;
                        const target = entity.getNearestLivingDragon(dragons);
                        if (target) {
                            const targetCenterX = target.x + target.width / 2;
                            const targetCenterY = target.y + target.height / 2;
                            const reflectedX = (targetCenterX - playerCenterX) * mapWidth;
                            const reflectedY = (targetCenterY - playerCenterY) * mapHeight;
                            const reflectedLength = Math.hypot(reflectedX, reflectedY);
                            this.reflectedLightning.push({
                                startX: playerCenterX,
                                startY: playerCenterY,
                                targetX: targetCenterX,
                                targetY: targetCenterY,
                                remainingTime: 100
                            });
                            target.takeDamage(this.lightningDmg);
                            if (reflectedLength > 0) {
                                const knockback = 0.008 / Math.pow(target.sizeMultiplier, 4) /
                                    (target.boss ? Math.pow(target.bossMultiplier, 3) : 1);
                                const knockbackPixels = knockback * mapHeight;
                                target.x += reflectedX / reflectedLength * knockbackPixels / mapWidth;
                                target.y += reflectedY / reflectedLength * knockbackPixels / mapHeight;
                            }
                        }
                        this.hitEntities.add(entity);
                        return;
                    }
                } else {
                    entity.hp -= this.lightningDmg;
                }
                entity.y += 0.025 / Math.pow(entity.sizeMultiplier, 4);
            } else {
                entity.y += 0.008 / Math.pow(entity.sizeMultiplier, 4) / (entity.boss ? Math.pow(entity.bossMultiplier, 3) : 1);
                entity.takeDamage(this.lightningDmg);
            }
            this.hitEntities.add(entity);
        }
    }
}

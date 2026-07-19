import Fireball from "./fireball.js";
import Meteorite from "./meteorite.js";
export default class Dragon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hpChooser = 0;
        this.baseSpeeds = [0.12, 0.12, 0.12, 0.12, 0.135, 0.25, 0.064];
        this.baseSpeed = this.baseSpeeds[this.hpChooser];
        this.effectiveSpeed = 0;
        this.yMultiplier = 1.2;
        this.speedMultiplier = 1;
        this.facing = 1; // - = left, + = right
        this.rewards = [
            Math.round(Math.random() * 16 + 26), 
            Math.round(Math.random() * 18 + 42), 
            Math.round(Math.random() * 20 + 62), 
            Math.round(Math.random() * 16 + 145),
            Math.round(Math.random() * 27 + 44),
            Math.round(Math.random() * 15 + 49),
            Math.round(Math.random() * 18 + 88)];
        this.reward = this.rewards[this.hpChooser];
        this.maxHp = [25, 40, 60, 100, 50, 20, 80];
        this.hp = this.maxHp[this.hpChooser];
        this.phase = 1;
        this.alive = true;
        this.fading = false;
        this.boss = false;
        this.bossMultiplier = 1;

        this.img = new Image();
        this.img.src = "images/greendragon.png";
        this.imgL = new Image();
        this.imgL.src = "images/greendragonL.png";
        this.bossImg = new Image();
        this.bossImg.src = "images/bossdragon.png";
        this.bossImgL = new Image();
        this.bossImgL.src = "images/bossdragonL.png";
        this.BASEIMGWIDTH = 210;
        this.BASEIMGHEIGHT = 233;
        this.imageWidth = this.BASEIMGWIDTH;
        this.imageHeight = this.BASEIMGHEIGHT;
        this.sizeMultiplier = 1;
        this.width = 0;
        this.height = 0;

        this.dirX = 0;
        this.dirY = 0;

        this.charging = false;
        this.restTimes = [
            Math.random() * 1500 + 3000,
            Math.random() * 1500 + 3000,
            Math.random() * 1500 + 3000,
            Math.random() * 1500 + 3000,
            Math.random() * 1250 + 2500,
            Math.random() * 1500 + 1000,
            0];
        this.restTime = this.restTimes[this.hpChooser];
        this.chargeTimes = [
            Math.random() * 750 + 2750,
            Math.random() * 750 + 2750,
            Math.random() * 750 + 2750,
            Math.random() * 750 + 2750,
            Math.random() * 1000 + 3000,
            Math.random() * 1500 + 1250,
            Math.random() * 750 + 750];
        this.chargeTime = this.chargeTimes[this.hpChooser];
        this.moveTime = 0;
        this.moveMultiplier = 1;

        this.fireballs = []
        this.shooting = true;
        this.shootingDelays = [2500, 2500, 2500, 2500, 2100, 1400, 2500];
        this.shootingDelay = this.shootingDelays[this.hpChooser];
        this.shootingTime = 0;
        this.fireDmg = [1, 1, 1, 1, 1, 1, 1];
        this.fireRateMultiplier = 1;

        this.fadeTime = 1;

        this.ltnInvinc = false;

        this.collected = false;

        this.abilityActive = false;
        this.warningActive = false;
        this.abilityWarning = 0;
        this.warningTime = 1500;
        this.abilityCooldown = 0;
        this.cooldownTime = Math.random() * 12500 + 15000;
        this.abilityDuration = 0;
        this.durationTime = Math.random() * 10000 + 8000;
        this.spawnTime = Math.random() * 300 + 900;
        this.spawnCooldown = this.spawnTime;
        this.spawnPosition = 0;
        this.meteorites = [];
    }

    draw(ctx, mapWidth, mapHeight, level) {
        ctx.save();
        ctx.globalAlpha = this.fadeTime;
        if (this.alive || this.fading) {
            if (this.facing > 0) {
                ctx.drawImage(this.boss ? this.bossImg : this.img, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
            } else {
                ctx.drawImage(this.boss ? this.bossImgL : this.imgL, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
            }

            if (this.collected && this.alive) {
                ctx.strokeStyle = "#9c7003";
                ctx.strokeRect(this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
            }
            if (this.warningActive) {
                ctx.strokeStyle = "rgb(151, 134, 5)";
                ctx.lineWidth = 4;
                ctx.strokeRect(this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
            }
            if (this.abilityActive) {
                ctx.strokeStyle = "rgb(151, 134, 5)";
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
            }
            // HP bar
            const barX = this.x * mapWidth;
            const barY = (this.y - 0.02) * mapHeight;
            const barWidth = this.imageWidth;
            const barHeight = this.imageHeight / 15;

            ctx.fillStyle = "red";
            ctx.fillRect(barX, barY, barWidth, barHeight);

            ctx.fillStyle = "limegreen";
            ctx.fillRect(barX, barY, (this.hp / this.maxHp[this.hpChooser]) * barWidth, barHeight);

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
            ctx.fillText(this.hp + "/" + this.maxHp[this.hpChooser], centerX, centerY);
        }


        ctx.globalAlpha = 1;
        this.fireballs.forEach(f => f.draw(ctx, mapWidth, mapHeight));
        this.meteorites.forEach(m => m.draw(ctx, mapWidth, mapHeight));
        ctx.restore();
    }

    update(deltaTime, mapWidth, mapHeight, canvas, baseWidth, baseHeight, target, level) {
        this.fireballs.forEach(f => f.update(deltaTime, mapWidth, mapHeight, baseWidth, baseHeight));
        for (let i = this.fireballs.length - 1; i >= 0; i--) {
            if (this.fireballs[i].x <= -0.1 || this.fireballs[i].x + this.fireballs[i].imageWidth / mapWidth >= 1.1) {
                this.fireballs.splice(i, 1);
            }
        }
        this.meteorites.forEach(m => m.update(deltaTime, mapWidth, mapHeight, baseWidth, baseHeight));
        for (let i = this.meteorites.length - 1; i >= 0; i--) {
            if (this.meteorites[i].y >= 1.1) {
                this.meteorites.splice(i, 1);
            }
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        } else if (this.hp >= this.maxHp[this.hpChooser] * 0.65) {
            this.phase = 1;
        } else if (this.hp >= this.maxHp[this.hpChooser] * 0.3 && this.hp < this.maxHp[this.hpChooser] * 0.65) {
            this.phase = 2;
        } else {
            this.phase = 3;
        }

        if (this.alive) {
            if (this.boss) {
                this.bossMultiplier = 1.2;
                if (!this.warningActive && !this.abilityActive) {
                    this.abilityCooldown += deltaTime;
            
                    if (this.abilityCooldown >= this.cooldownTime) {
                        this.warningActive = true;
                        this.abilityCooldown = 0;
                        this.cooldownTime = Math.random() * 12500 + 15000;
                    }
                }
                if (this.warningActive) {
                    this.abilityWarning += deltaTime;

                    if (this.abilityWarning >= this.warningTime) {
                        this.warningActive = false;
                        this.abilityActive = true;
                        this.abilityWarning = 0;
                    }
                }
                if (this.abilityActive) {
                    this.spawnCooldown += deltaTime;

                    if (this.spawnCooldown >= this.spawnTime) {
                        this.strikePosition = Math.random();
                        this.meteorites.push(new Meteorite(this.strikePosition, -0.1, 2));
                        this.spawnCooldown = 0;
                        this.spawnTime = Math.random() * 300 + 900;
                    }
                    this.abilityDuration += deltaTime;

                    if (this.abilityDuration >= this.durationTime) {
                        this.abilityActive = false;
                        this.abilityDuration = 0;
                        this.durationTime = Math.random() * 10000 + 8000;
                    }
                }
            } else {
                this.bossMultiplier = 1;
            }
            if (this.warningActive || this.abilityActive) {
                this.shooting = false;
                this.charging = false;
            } else {
                this.shooting = true;
            }
            this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth) * this.sizeMultiplier * this.bossMultiplier;
            this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight) * this.sizeMultiplier * this.bossMultiplier;
            this.width = this.imageWidth / mapWidth;
            this.height = this.imageHeight / mapHeight;
            if (this.phase == 1) {
                this.restTime = this.restTimes[this.hpChooser] * this.moveMultiplier / this.bossMultiplier;
                this.chargeTime = this.chargeTimes[this.hpChooser] * this.bossMultiplier;
                this.shootingDelay = this.shootingDelays[this.hpChooser] * this.fireRateMultiplier / this.bossMultiplier;
                this.baseSpeed = this.baseSpeeds[this.hpChooser];
            } else if (this.phase == 2) {
                this.restTime = this.restTimes[this.hpChooser] * 0.9 * this.moveMultiplier / this.bossMultiplier;
                this.chargeTime = this.chargeTimes[this.hpChooser] * 1.1 * this.bossMultiplier;
                this.shootingDelay = this.shootingDelays[this.hpChooser] * 0.9 * this.fireRateMultiplier / this.bossMultiplier;
                this.baseSpeed = this.baseSpeeds[this.hpChooser] * 1.1;
            } else {
                this.restTime = this.restTimes[this.hpChooser] * 0.7 * this.moveMultiplier / this.bossMultiplier;
                this.chargeTime = this.chargeTimes[this.hpChooser] * 1.3 * this.bossMultiplier;
                this.shootingDelay = this.shootingDelays[this.hpChooser] * 0.7 * this.fireRateMultiplier / this.bossMultiplier;
                this.baseSpeed = this.baseSpeeds[this.hpChooser] * 1.3;
            }
            if (this.hpChooser == 5) {
                this.ltnInvinc = true;
            }
            if (this.shooting) {
                this.shootingTime += deltaTime;
                if (this.shootingTime >= this.shootingDelay) {
                    this.shoot();
                    this.shootingTime = 0;
                }
            }
            this.moveTime += deltaTime;
            if (!this.charging && !this.warningActive && !this.abilityActive && this.moveTime >= this.restTime) {
                let dx = target.x + target.width / 2 - this.x - this.width / 2;
                let dy = target.y + target.height / 2 - this.y - this.height / 3;
                let dist = Math.sqrt(dx * dx + dy * dy);
                this.dirX = dx / dist;
                this.dirY = dy / dist;
                this.effectiveSpeed = this.baseSpeed * this.speedMultiplier;
                if (this.dirX > 0) {
                    this.facing = 1;
                } else {
                    this.facing = -1;
                }
                this.charging = true;
                // console.log(this.chargeTime);
                this.moveTime = 0;
            }
            if (this.charging) {
                this.effectiveSpeed = this.baseSpeed * this.speedMultiplier;
                this.x += this.dirX * this.effectiveSpeed * deltaTime / 1000;
                this.y += this.dirY * this.yMultiplier * this.effectiveSpeed * deltaTime / 1000;
                if (this.moveTime >= this.chargeTime) {
                    this.charging = false;
                    // console.log(this.restTime);
                    this.moveTime = 0;
                }
            }
        } else {
            if (this.fading) {
                this.imageWidth *= 1.04;
                this.imageHeight *= 1.04;
                this.fadeTime -= deltaTime / 350;
                if (this.fadeTime <= 0) {
                    this.fadeTime = 0;
                    this.fading = false;
                }
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
            this.fireballs.push(new Fireball(this.x, this.y + 0.075, -1, this.fireDmg, this.sizeMultiplier * this.bossMultiplier));
        } else {
            this.fireballs.push(new Fireball(this.x + this.width, this.y + 0.075, 1, this.fireDmg, this.sizeMultiplier * this.bossMultiplier));
        }
    }
}

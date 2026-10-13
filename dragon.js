import Fireball from "./fireball.js";
import Meteorite from "./meteorite.js";
export default class Dragon {
    constructor(x, y, stats) {
        this.x = x;
        this.y = y;
        this.hpChooser = 0;
        this.baseSpeeds = stats.baseSpeeds;
        this.baseSpeed = this.baseSpeeds[this.hpChooser];
        this.effectiveSpeed = 0;
        this.xMultipliers = stats.xMultipliers;
        this.xMultiplier = this.xMultipliers[this.hpChooser];
        this.burstShooting = stats.burstShooting === true;
        this.zoneAbility = stats.zoneAbility === true;
        this.zoneAbilityActive = false;
        this.zoneRadius = 0;
        this.zoneX = 0;
        this.zoneY = 0;
        this.yMultiplier = 1.2;
        this.speedMultiplier = 1;
        this.abilitySpeedMultiplier = 1;
        this.facing = stats.facing // - = left, + = right
        this.rewards = stats.rewards;
        this.reward = this.rewards[this.hpChooser];
        this.maxHp = stats.maxHp;
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
        this.frozenImg = new Image();
        this.frozenImg.src = "images/frozendragon.png";
        this.frozenImgL = new Image();
        this.frozenImgL.src = "images/frozendragonL.png";
        this.BASEIMGWIDTH = 210;
        this.BASEIMGHEIGHT = 233;
        this.imageWidth = this.BASEIMGWIDTH;
        this.imageHeight = this.BASEIMGHEIGHT;
        this.sizeMultipliers = stats.sizeMultipliers;
        this.sizeMultiplier = this.sizeMultipliers[this.hpChooser];
        this.width = 0;
        this.height = 0;

        this.dirX = 0;
        this.dirY = 0;

        this.charging = false;
        this.restTimes = stats.restTimes;
        this.restTime = this.getRandomRange(this.restTimes[this.hpChooser]);
        this.chargeTimes = stats.chargeTimes;
        this.chargeTime = this.getRandomRange(this.chargeTimes[this.hpChooser]);
        this.moveTime = 0;
        this.moveMultiplier = 1;

        this.fireballs = []
        this.shooting = true;
        this.shootingDelays = stats.shootingDelays;
        this.shootingDelay = this.shootingDelays[this.hpChooser];
        this.shootingTime = 0;
        this.burstShotsRemaining = 0;
        this.burstShotTimer = 0;
        this.fireDmg = stats.fireDmg;
        this.fireHealth = stats.fireHealth;
        this.fireRateMultiplier = 1;
        this.freezeTimer = 0;
        this.isFrozen = false;
        this.savedSpeed = 0;
        this.fadeTime = 1;

        this.ltnInvinc = false;
        this.homingFireballActive = false;
        this.iceActive = false;

        this.collected = false;

        this.abilityActive = false;
        this.warningActive = false;
        this.abilityWarning = 0;
        this.warningTime = 1500;
        this.abilityCooldown = 0;
        this.cooldownTime = Math.random() * 12500 + 15000;
        this.abilityDuration = 0;
        this.durationTime = Math.random() * 10000 + 8000;
        this.abilityFireballShot = false;
        this.abilityMovingToPlayer = false;
        this.spawnTime = Math.random() * 250 + 600;
        this.spawnCooldown = this.spawnTime;
        this.spawnPosition = 0;
        this.meteorites = [];
    }

    draw(ctx, mapWidth, mapHeight, level) {
        ctx.save();
        ctx.globalAlpha = this.fadeTime;
        if (this.alive || this.fading) {
            if (this.facing > 0) {
                ctx.drawImage(this.isFrozen ? this.frozenImg : this.boss ? this.bossImg : this.img, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
            } else {
                ctx.drawImage(this.isFrozen ? this.frozenImgL : this.boss ? this.bossImgL : this.imgL, this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
            }

            if (this.collected && this.alive) {
                ctx.strokeStyle = "#9c7003";
                const insetX = this.imageWidth * 0.025;
                const insetY = this.imageHeight * 0.025;
                ctx.strokeRect(
                    this.x * mapWidth + insetX,
                    this.y * mapHeight + insetY,
                    this.imageWidth * 0.95,
                    this.imageHeight * 0.95
                );
            }
            if (this.warningActive) {
                ctx.strokeStyle = "rgb(151, 134, 5)";
                ctx.lineWidth = 4;
                ctx.strokeRect(this.x * mapWidth, this.y * mapHeight, this.imageWidth, this.imageHeight);
            }
            if (this.abilityActive || this.zoneAbilityActive) {
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

    drawAbilityZone(ctx, mapWidth, mapHeight) {
        if (!this.zoneAbility || !this.zoneAbilityActive) {
            return;
        }

        ctx.save();
        ctx.fillStyle = "rgba(151, 134, 5, 0.5)";
        ctx.strokeStyle = "rgb(151, 134, 5)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.zoneX * mapWidth, this.zoneY * mapHeight, this.zoneRadius * mapWidth, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    update(deltaTime, mapWidth, mapHeight, canvas, baseWidth, baseHeight, target, level, player = null) {
        if (player) {
            this.player = player;
        }
        this.fireballs.forEach(f => f.update(deltaTime, mapWidth, mapHeight, baseWidth, baseHeight));
        for (let i = this.fireballs.length - 1; i >= 0; i--) {
            if (this.fireballs[i].x <= -1 || this.fireballs[i].x + this.fireballs[i].imageWidth / mapWidth >= 2 ||
                this.fireballs[i].y <= -1 || this.fireballs[i].y + this.fireballs[i].imageHeight / mapHeight >= 2) {
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
            this.kill();
        }

        if (!this.alive) {
            if (this.fading) {
                this.imageWidth *= 1.04;
                this.imageHeight *= 1.04;
                this.fadeTime -= deltaTime / 350;
                if (this.fadeTime <= 0) {
                    this.fadeTime = 0;
                    this.fading = false;
                }
            }
            return;
        }

        if (this.freezeTimer > 0) {
            this.freezeTimer -= deltaTime;
            this.moveTime += deltaTime;
            if (this.freezeTimer <= 0) {
                this.freezeTimer = 0;
                this.isFrozen = false;
                this.effectiveSpeed = this.savedSpeed;
                this.savedSpeed = 0;
                if (this.warningActive || this.abilityActive) {
                    this.shooting = false;
                } else {
                    this.shooting = true;
                }
            }
            return;
        }

        if (this.hp >= this.maxHp[this.hpChooser] * 0.65) {
            this.phase = 1;
        } else if (this.hp >= this.maxHp[this.hpChooser] * 0.3 && this.hp < this.maxHp[this.hpChooser] * 0.65) {
            this.phase = 2;
        } else {
            this.phase = 3;
        }

        if (this.alive) {
            const hasZoneAbility = this.zoneAbility && level == 18;
            if (hasZoneAbility) {
                if (!this.zoneAbilityActive) {
                    this.abilityCooldown += deltaTime;
                    if (this.abilityCooldown >= this.cooldownTime) {
                        this.zoneAbilityActive = true;
                        this.abilityCooldown = 0;
                        this.abilityDuration = 0;
                        this.cooldownTime = Math.random() * 12500 + 15000;
                        this.durationTime = Math.random() * 10000 + 8000;
                        this.zoneRadius = Math.random() * 0.1 + 0.1;
                        this.charging = false;
                        this.moveTime = 0;

                        const radiusPixels = this.zoneRadius * mapWidth;
                        const minX = radiusPixels;
                        const maxX = mapWidth - radiusPixels;
                        const minY = radiusPixels;
                        const maxY = mapHeight - radiusPixels;
                        this.zoneX = maxX >= minX ? (minX + Math.random() * (maxX - minX)) / mapWidth : 0.5;
                        this.zoneY = maxY >= minY ? (minY + Math.random() * (maxY - minY)) / mapHeight : 0.5;
                    }
                } else {
                    this.abilityDuration += deltaTime;
                    if (this.abilityDuration >= this.durationTime) {
                        this.zoneAbilityActive = false;
                        this.abilityDuration = 0;
                        this.moveTime = 0;
                        this.restTime = this.getRandomRange(this.restTimes[this.hpChooser]);
                    }
                }
            }

            if (this.boss) {
                if (level == 4) {
                    this.bossMultiplier = 1.2;
                } else {
                    this.bossMultiplier = 0.8;
                }
                if (level != 14) {
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
                            this.strikePosition = Math.random() * 0.88 + 0.05;
                            this.meteorites.push(new Meteorite(this.strikePosition, -0.1, 2));
                            this.spawnCooldown = 0;
                            this.spawnTime = Math.random() * 250 + 600;
                        }
                        this.abilityDuration += deltaTime;

                        if (this.abilityDuration >= this.durationTime) {
                            this.abilityActive = false;
                            this.abilityDuration = 0;
                            this.durationTime = Math.random() * 10000 + 8000;
                        }
                    }
                } else {
                    if (!this.abilityActive) {
                        this.abilityCooldown += deltaTime;

                        if (this.abilityCooldown >= this.cooldownTime) {
                            this.abilityActive = true;
                            this.abilityCooldown = 0;
                            this.cooldownTime = Math.random() * 12500 + 15000;
                        }
                    }
                    
                    if (this.abilityActive) {
                        this.shooting = false;
                        
                        if (!this.abilityMovingToPlayer) {
                            // Phase 1: Move to left side and shoot
                            this.charging = true;
                            let dx = 0 - this.x - this.width / 2;
                            let dy = 0.5 - this.y - this.height / 3;
                            let dist = Math.sqrt(dx * dx + dy * dy);
                            this.dirX = dx / dist;
                            this.dirY = dy / dist;
                            if (this.dirX > 0) {
                                this.facing = 1;
                            } else {
                                this.facing = -1;
                            }
                            this.effectiveSpeed = this.baseSpeed * this.speedMultiplier * 2;
                            
                            // Check if reached target position
                            if (dist < 0.05) {
                                this.charging = false;
                                this.facing = 1;
                                
                                // Only shoot once per ability activation
                                if (!this.abilityFireballShot) {
                                    this.abilityFireballShot = true;
                                    this.shootSuperFireball(level);
                                }
                                
                                // Check if fireball is gone or has traveled far enough
                                let fireballGone = this.fireballs.length === 0 || this.fireballs.some(f => f.health <= 0 || f.x >= 0.85);
                                
                                if (fireballGone) {
                                    this.abilityMovingToPlayer = true;
                                    // Initialize phase 2 charging state
                                    this.charging = false;
                                    this.moveTime = 0;
                                    this.restTime = 0;  // Start immediately with first charge
                                }
                            }
                        } else {
                            // Phase 2: Move toward player after fireball is gone - manual charging cycle
                            this.moveTime += deltaTime;
                            
                            if (!this.charging && this.moveTime >= this.restTime) {
                                // Rest time is up, start next charge
                                let dx = target.x + target.width / 2 - this.x - this.width / 2;
                                let dy = target.y + target.height / 2 - this.y - this.height / 3;
                                let dist = Math.sqrt(dx * dx + dy * dy);
                                this.dirX = dx / dist;
                                this.dirY = dy / dist;
                                if (this.dirX > 0) {
                                    this.facing = 1;
                                } else {
                                    this.facing = -1;
                                }
                                
                                const chargeRange = this.chargeTimes[this.hpChooser];
                                const chargePhaseMultiplier = this.phase == 1 ? 1 : this.phase == 2 ? 1.05 : 1.15;
                                this.chargeTime = this.getRandomRange(chargeRange) * chargePhaseMultiplier * this.bossMultiplier;
                                this.effectiveSpeed = this.baseSpeed * this.speedMultiplier;
                                
                                this.charging = true;
                                this.moveTime = 0;
                            } else if (this.charging && this.moveTime >= this.chargeTime) {
                                // Charge time is up, start rest period
                                const restRange = this.restTimes[this.hpChooser];
                                const restPhaseMultiplier = this.phase == 1 ? 1 : this.phase == 2 ? 0.9 : 0.7;
                                this.restTime = this.getRandomRange(restRange) * restPhaseMultiplier * this.moveMultiplier / this.bossMultiplier;
                                this.charging = false;
                                this.moveTime = 0;
                            }
                            
                            this.abilityDuration += deltaTime;
                            if (this.abilityDuration >= this.durationTime) {
                                this.abilityActive = false;
                                this.abilityDuration = 0;
                                this.abilityFireballShot = false;
                                this.abilityMovingToPlayer = false;
                                this.durationTime = Math.random() * 10000 + 8000;
                            }
                        }
                    }
                }
            } else {
                this.bossMultiplier = 1;
            }
            if (this.warningActive || this.abilityActive) {
                if (level == 9) {   
                    this.abilitySpeedMultiplier = 0.75;
                } else if (level == 14) {
                    this.abilitySpeedMultiplier = this.abilityMovingToPlayer ? 1.4 : 1.6;
                }
                this.shooting = false;
                if (level == 4) {
                    this.charging = false;
                }
            } else {
                this.abilitySpeedMultiplier = 1;
                this.shooting = true;
            }
            this.imageWidth = this.BASEIMGWIDTH * (mapWidth / baseWidth) * this.sizeMultiplier * this.bossMultiplier;
            this.imageHeight = this.BASEIMGHEIGHT * (mapHeight / baseHeight) * this.sizeMultiplier * this.bossMultiplier;
            this.width = this.imageWidth / mapWidth;
            this.height = this.imageHeight / mapHeight;
            const shootingPhaseMultiplier = this.phase == 1 ? 1 : this.phase == 2 ? 0.9 : 0.7;
            this.shootingDelay = this.shootingDelays[this.hpChooser] * shootingPhaseMultiplier * this.fireRateMultiplier / this.bossMultiplier;
            this.baseSpeed = this.baseSpeeds[this.hpChooser] * (this.phase == 1 ? 1 : this.phase == 2 ? 1.1 : 1.3);
            this.xMultiplier = this.xMultipliers[this.hpChooser];
            if (this.zoneAbilityActive) {
                const dx = target.x + target.width / 2 - this.x - this.width / 2;
                const dy = target.y + target.height / 2 - this.y - this.height / 3;
                const distance = Math.hypot(dx, dy);
                if (distance > 0) {
                    this.dirX = dx / distance;
                    this.dirY = dy / distance;
                    this.facing = this.dirX > 0 ? 1 : -1;
                }
                this.effectiveSpeed = this.baseSpeed * this.speedMultiplier * this.abilitySpeedMultiplier * 0.5;
                this.moveWithBoundaryBounce(deltaTime, level);
            }
            if (this.hpChooser == 5) {
                this.ltnInvinc = true;
            }
            const waitingForFirstDragon = level == 17 && !this.burstShooting &&
                this.primaryDragon && this.primaryDragon.alive;
            if (level != 18 && !this.isFrozen && this.shooting && !waitingForFirstDragon) {
                if (level == 17 && this.burstShooting && this.burstShotsRemaining > 0) {
                    this.burstShotTimer += deltaTime;
                    while (this.burstShotTimer >= 600 && this.burstShotsRemaining > 0) {
                        this.shootFireball(level);
                        this.burstShotsRemaining--;
                        this.burstShotTimer -= 600;
                    }
                } else {
                    this.shootingTime += deltaTime;
                    if (this.shootingTime >= this.shootingDelay) {
                        this.shoot(level);
                        this.shootingTime = 0;
                    }
                }
            }
            this.moveTime += deltaTime;
            if (!this.zoneAbilityActive && !this.charging && ((!this.warningActive && !this.abilityActive) || level == 9) && this.moveTime >= this.restTime) {
                const chargeRange = this.chargeTimes[this.hpChooser];
                const chargePhaseMultiplier = this.phase == 1 ? 1 : this.phase == 2 ? 1.05 : 1.15;
                this.chargeTime = this.getRandomRange(chargeRange) * chargePhaseMultiplier * this.bossMultiplier;

                if (level == 18) {
                    const angle = Math.random() * Math.PI * 2;
                    this.dirX = Math.cos(angle);
                    this.dirY = Math.sin(angle);
                } else {
                    let dx = target.x + target.width / 2 - this.x - this.width / 2;
                    let dy = target.y + target.height / 2 - this.y - this.height / 3;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    this.dirX = dx / dist;
                    this.dirY = dy / dist;
                }
                this.effectiveSpeed = this.baseSpeed * this.speedMultiplier * this.abilitySpeedMultiplier;
                if (level == 12) {
                    this.facing = 1;
                } else if (this.dirX > 0) {
                    this.facing = 1;
                } else {
                    this.facing = -1;
                }
                this.charging = true;
                this.moveTime = 0;
            }
            if (!this.zoneAbilityActive && this.charging) {
                this.effectiveSpeed = this.baseSpeed * this.speedMultiplier * this.abilitySpeedMultiplier;
                this.moveWithBoundaryBounce(deltaTime, level);
                if (this.moveTime >= this.chargeTime) {
                    const restRange = this.restTimes[this.hpChooser];
                    const restPhaseMultiplier = this.phase == 1 ? 1 : this.phase == 2 ? 0.9 : 0.7;
                    this.restTime = this.getRandomRange(restRange) * restPhaseMultiplier * this.moveMultiplier / this.bossMultiplier;
                    this.charging = false;
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

    getRandomRange(range) {
        if (!Array.isArray(range) || range.length < 2) {
            return 0;
        }
        const [min, max] = range;
        return Math.random() * (max - min) + min;
    }

    moveWithBoundaryBounce(deltaTime, level) {
        if (level == 18) {
            const minX = -0.1;
            const maxX = 1.1 - this.width;
            const minY = -0.1;
            const maxY = 1.1 - this.height;

            if (this.x <= minX && this.dirX * this.xMultiplier < 0) {
                this.dirX = Math.abs(this.dirX);
                this.facing = this.dirX * this.xMultiplier > 0 ? 1 : -1;
            } else if (this.x >= maxX && this.dirX * this.xMultiplier > 0) {
                this.dirX = -Math.abs(this.dirX);
                this.facing = this.dirX * this.xMultiplier > 0 ? 1 : -1;
            }
            if (this.y <= minY && this.dirY * this.yMultiplier < 0) {
                this.dirY = Math.abs(this.dirY);
            } else if (this.y >= maxY && this.dirY * this.yMultiplier > 0) {
                this.dirY = -Math.abs(this.dirY);
            }
        }

        const movementX = this.dirX * this.xMultiplier * this.effectiveSpeed * deltaTime / 1000;
        const movementY = this.dirY * this.yMultiplier * this.effectiveSpeed * deltaTime / 1000;
        this.x += movementX;
        this.y += movementY;

        if (level == 18) {
            const minX = -0.1;
            const maxX = 1.1 - this.width;
            const minY = -0.1;
            const maxY = 1.1 - this.height;
            if (this.x < minX) {
                this.x = minX;
                this.dirX = Math.abs(this.dirX);
                this.facing = this.dirX * this.xMultiplier > 0 ? 1 : -1;
            } else if (this.x > maxX) {
                this.x = maxX;
                this.dirX = -Math.abs(this.dirX);
                this.facing = this.dirX * this.xMultiplier > 0 ? 1 : -1;
            }
            if (this.y < minY) {
                this.y = minY;
                this.dirY = Math.abs(this.dirY);
            } else if (this.y > maxY) {
                this.y = maxY;
                this.dirY = -Math.abs(this.dirY);
            }
        }
    }

    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.kill();
        }
    }

    kill() {
        this.hp = 0;
        this.alive = false;
        this.zoneAbilityActive = false;
        this.freezeTimer = 0;
        this.isFrozen = false;
        this.effectiveSpeed = this.savedSpeed;
        this.savedSpeed = 0;
    }

    freeze(duration) {
        this.freezeTimer = Math.max(this.freezeTimer, duration);
        if (this.alive && !this.isFrozen) {
            this.isFrozen = true;
            this.savedSpeed = this.effectiveSpeed;
            this.effectiveSpeed = 0;
            this.shooting = false;
        }
    }

    isColliding(entity) {
        if (this.x + this.width * 0.8 >= entity.x && this.x <= entity.x + entity.width * 0.9 && this.y + this.height * 0.85 >= entity.y && this.y <= entity.y + entity.height * 0.9) {
            return true;
        }
        return false;
    }

    isPlayerInAbilityZone(player, mapWidth, mapHeight) {
        if (!this.zoneAbilityActive || !player.alive) {
            return false;
        }

        const playerCenterX = (player.x + player.width / 2) * mapWidth;
        const playerCenterY = (player.y + player.height / 2) * mapHeight;
        const circleX = this.zoneX * mapWidth;
        const circleY = this.zoneY * mapHeight;
        const radius = this.zoneRadius * mapWidth;
        return Math.hypot(playerCenterX - circleX, playerCenterY - circleY) <= radius;
    }

    shoot(level) {
        if (level == 17 && this.burstShooting) {
            const numFireballs = Math.floor(Math.random() * 4) + 2;
            this.burstShotsRemaining = numFireballs - 1;
            this.burstShotTimer = 0;
            this.shootFireball(level);
            return;
        }

        this.shootFireball(level);
        if (level == 9) {
            this.shootFireball(level);
        }
    }

    shootFireball(level) {
        const hasLevel17Effects = level == 17;
        const ice = hasLevel17Effects ? Math.random() < 1 / 3 : this.iceActive;
        const homing = hasLevel17Effects ? Math.random() < 1 / 19 : this.homingFireballActive;
        if (this.facing < 0) {
            this.fireballs.push(new Fireball(this.x, this.y + 0.075, -1, this.fireDmg[level - 1], this.sizeMultiplier * this.bossMultiplier, this.fireHealth[level - 1], false, ice, homing, this.player));
        } else {
            this.fireballs.push(new Fireball(this.x + this.width, this.y + 0.075, 1, this.fireDmg[level - 1], this.sizeMultiplier * this.bossMultiplier, this.fireHealth[level - 1], false, ice, homing, this.player));
        }
    }

    shootSuperFireball(level) {
        let fireball = null;
        if (this.facing < 0) {
            fireball = new Fireball(this.x + 0.99, this.y - 0.3, -1, this.fireDmg[level - 1], this.sizeMultiplier * this.bossMultiplier * 35, 30, true, this.iceActive, false, this.player);
            this.fireballs.push(fireball);
        } else {
            fireball = new Fireball(this.x + this.width - 0.99, this.y - 0.3, 1, this.fireDmg[level - 1], this.sizeMultiplier * this.bossMultiplier * 35, 30, true, this.iceActive, false, this.player);
            this.fireballs.push(fireball);
        }
        return fireball;
    }
}

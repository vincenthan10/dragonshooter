import Dragon from "./dragon.js";
import Player from "./player.js";
import Cloud from "./cloud.js";
import Explosion from "./explosion.js";
import MysteryBox from "./mysterybox.js";

const canvas = document.getElementById("gameCanvas")
let mapWidth = canvas.width;
let mapHeight = canvas.height;
const BASEMAPWIDTH = 1280;
const BASEMAPHEIGHT = 580;
resizeCanvas();
const keysPressed = new Set();

const ctx = canvas.getContext("2d");

const playerSpawnX = 0.74;
const playerSpawnY = 0.4;
const dragonSpawnX = 0.1;
const dragonSpawnY = 0.3;
const dragon = new Dragon(dragonSpawnX, dragonSpawnY);
const player = new Player(playerSpawnX, playerSpawnY);
const cloud = new Cloud(-0.1 * canvas.width, 0);
const mystery = new MysteryBox(player, dragon);
const explosions = [];
const fireExplosion = {
    src: "images/fireexplosion.png",
    BASEIMAGEWIDTH: 200,
    BASEIMAGEHEIGHT: 113
}
const projExplosion = {
    src: "images/bulExplosion.png",
    BASEIMAGEWIDTH: 80,
    BASEIMAGEHEIGHT: 103
}
const basicExplosion = {
    src: "images/explosion.png",
    BASEIMAGEWIDTH: 95,
    BASEIMAGEHEIGHT: 97
}
let coinImage = new Image();
coinImage.src = "images/coin.png";

let fireShieldImage = new Image();
fireShieldImage.src = "images/fireshield.png";

let lightningHelmetImage = new Image();
lightningHelmetImage.src = "images/lightninghelmet.png";

let shooting = false;

let lastHit = 0;
let bodyHitTime = 75;

let deadTime = 0;
let gameOverTime = 1000;
let defeatTime = 0;
let victoryTime = 1500;
let gameState = "title";
let gameOver = false;

// Title screen play button state
let titleButton = {x: 0, y: 0, w: 0, h: 0, hover: false };
let deathButton = { x: 0, y: 0, w: 0, h: 0, hover: false };
let gameOverButton = { x: 0, y: 0, w: 0, h: 0, hover: false };
let victoryButton = { x: 0, y: 0, w: 0, h: 0, hover: false };
let pauseButton = { x: 0, y: 0, w: 0, h: 0, hover: false };
let gamePauseButton = { x: 0, y: 0, w: 0, h: 0, hover: false };
let upgradeOptionButtons = [
    { x: 0, y: 0, w: 0, h: 0, hover: false },
    { x: 0, y: 0, w: 0, h: 0, hover: false },
    { x: 0, y: 0, w: 0, h: 0, hover: false }
];
let upgradeContinueButton = { x: 0, y: 0, w: 0, h: 0, hover: false };

let upgradePool = [
    {   
        name: "Damage Up",
        baseCost: 250,
        availableLevel: 4,
        target: "player",
        apply: (player) => player.dmgUpgrade += 1,
        maxLevel: 2,
        currentLevel: 0,
        getCost() {
            return this.baseCost + this.currentLevel * 25;
        }
    },
    {
        name: "Speed Up",
        baseCost: 30,
        availableLevel: 1,
        target: "player",
        apply: (player) => player.speedUpgraded *= 1.09,
        maxLevel: 6,
        currentLevel: 0,
        getCost() {
            return this.baseCost + this.currentLevel * 25;
        }
    },
    {
        name: "Fire Rate Up",
        baseCost: 30,
        availableLevel: 1,
        target: "player",
        apply: (player) => player.fireRateUpgraded *= 0.91,
        maxLevel: 6,
        currentLevel: 0,
        getCost() {
            return this.baseCost + this.currentLevel * 30;
        }
    },
    {
        name: "Extra Life",
        baseCost: 50,
        availableLevel: 2,
        target: "player",
        apply: (player) => player.lives++,
        currentLevel: 0,
        getCost() {
            return this.baseCost + this.currentLevel * 25;
        }
    },
    {
        name: "Health Up",
        baseCost: 150,
        availableLevel: 3,
        target: "player",
        currentLevel: 0,
        apply(player) {
            player.maxHp += (this.currentLevel + 1);
            player.hp = player.maxHp;
        },
        maxLevel: 5,
        getCost() {
            return this.baseCost + this.currentLevel * this.currentLevel * 50;
        }
    },
    {
        name: "Fire Shield",
        baseCost: 175,
        availableLevel: 4,
        target: "player",
        currentLevel: 0,
        apply(player) {
        },
        getCost() {
            return this.baseCost;
        }
    },
    {
        name: "Lightning Helmet",
        baseCost: 175,
        availableLevel: 4,
        target: "player",
        currentLevel: 0,
        apply(player) {
        },
        getCost() {
            return this.baseCost;
        }
    },
    {
        name: "Reduce Dragon HP",
        baseCost: 40,
        availableLevel: 1,
        target: "dragon",
        currentLevel: 0,
        apply(dragon) {
            dragon.maxHp[level] = Math.round(dragon.maxHp[level] * 0.8);
        },
        getCost() {
            return this.baseCost;
        }
    },
    {
        name: "Bullet Health Up",
        baseCost: 125,
        availableLevel: 3,
        target: "player",
        currentLevel: 0,
        apply(player) {
            player.bhealthUpgrade += this.currentLevel + 1;
        },
        maxLevel: 5,
        getCost() {
            return this.baseCost + this.currentLevel * 25;
        }
    },
    {
        name: "Bullet Size Up",
        baseCost: 25,
        availableLevel: 1,
        target: "player",
        currentLevel: 0,
        apply(player) {
            player.bulletSizeMultiplier *= 1.1;
        },
        maxLevel: 4,
        getCost() {
            return this.baseCost + this.currentLevel * 50;
        }
    },
    {
        name: "Unlock Mystery Box",
        baseCost: 35,
        availableLevel: 1,
        target: "player",
        currentLevel: 0,
        apply(player) {
            player.unlockedMysteryBox = true;
        },
        maxLevel: 1,
        getCost() {
            return this.baseCost;
        }
    }
]
let available = [];
let chosen = [];
let upgradeHoverIndex = -1;

let level = 1;

function formatStat(value) {
    return Number(value).toFixed(3);
}

function getCurrentPlayerStats() {
    const speed = player.baseSpeedX * player.speedUpgraded;
    const reloadTime = (player.baseShootingDelay * player.fireRateUpgraded) / 1000;
    const damage = player.bulletDmg + player.dmgUpgrade;

    return {
        hp: player.maxHp,
        reloadTime,
        speed,
        damage,
        lives: player.lives
    };
}

function getUpgradePreviewText(upgrade) {
    if (!upgrade) {
        return null;
    }

    const current = getCurrentPlayerStats();

    switch (upgrade.name) {
        case "Damage Up":
            return { line: "damage", text: ` → ${current.damage + 1}` };
        case "Speed Up":
            return { line: "speed", text: ` → ${formatStat(current.speed * 1.09)}` };
        case "Fire Rate Up":
            return { line: "reload", text: ` → ${formatStat(current.reloadTime * 0.91)}s` };
        case "Extra Life":
            return { line: "lives", text: ` → ${current.lives + 1}` };
        case "Health Up":
            return { line: "hp", text: ` → ${player.maxHp + (upgrade.currentLevel + 1)}` };
        default:
            return null;
    }
}

function applyUpgradeChoice(index) {
    if (index < 0 || index >= chosen.length) {
        return;
    }

    const upgrade = chosen[index];
    if (!upgrade) {
        return;
    }

    const cost = upgrade.getCost();

    if (player.coins >= cost) {
        player.coins -= cost;
        const target = upgrade.target === "dragon" ? dragon : player;
        upgrade.apply(target);
        upgrade.currentLevel++;
        chosen[index] = null;
        upgradeInput = 0;
    }
}

function update(deltaTime) {
    if (gameState != "game") {
        return;
    } 
    //console.log(explosions);
    if (level >= 2) {
        cloud.update(deltaTime, mapWidth, mapHeight, canvas, BASEMAPWIDTH, BASEMAPHEIGHT);
        cloud.collisionHandler(player, mapWidth);
        cloud.collisionHandler(dragon, mapWidth);
    }
    if (player.unlockedMysteryBox) {
        mystery.update(deltaTime, mapWidth, mapHeight, BASEMAPWIDTH, BASEMAPHEIGHT);
        if (mystery.isColliding(player)) {
            player.collected = true;
            mystery.playerEffect(player, true, 0);
        }
        if (mystery.isColliding(dragon)) {
            dragon.collected = true;
            mystery.dragonEffect(dragon, true, 0);
        }
    }
    player.update(deltaTime, keysPressed, mapWidth, mapHeight, canvas, BASEMAPWIDTH, BASEMAPHEIGHT);
    if (!dragon.alive && !dragon.fading) {
        dragon.fading = true;
        defeatTime += deltaTime;
        if (defeatTime >= victoryTime) {
            gameState = "victory";
            player.coins += dragon.reward;
            player.coinsThisRun = 0;
            return;
        }
    }
    if (!player.alive && !player.fading) {
        player.fading = true;
        deadTime += deltaTime;
        if (deadTime >= gameOverTime) {
            player.lives--;
            if (player.lives <= 0) {
                gameState = "gameover";
                gameOver = true;
            } else {
                gameState = "deathscreen";
            }
            player.coins -= player.coinsThisRun;
            player.coinsThisRun = 0;
            return;
        }
    }
    if (shooting && player.alive && player.shootingTime >= player.shootingDelay) {
        player.shoot();
        player.shootingTime = 0;
    }
    dragon.update(deltaTime, mapWidth, mapHeight, canvas, BASEMAPWIDTH, BASEMAPHEIGHT, player, level);
    if (dragon.alive && dragon.isColliding(player) && lastHit >= bodyHitTime) {
        player.hp--;
        lastHit = 0;
    }
    lastHit += deltaTime;
    for (let i = dragon.fireballs.length - 1; i >= 0; i--) {
        let fireball = dragon.fireballs[i];
        if (fireball.isColliding(player) && player.alive) {
            player.hp -= fireball.damage;
            const knockbackAmount = 0.02 * Math.pow(fireball.sizeMultiplier, 4) / Math.pow(player.sizeMultiplier, 4);
            player.x = player.x + fireball.dir * knockbackAmount;
            explosions.push(new Explosion(fireball.x, fireball.y - 0.05, fireExplosion.src, fireExplosion.BASEIMAGEWIDTH, fireExplosion.BASEIMAGEHEIGHT, 400, 1));
            dragon.fireballs.splice(i, 1);
            continue;
        }
        for (let j = player.bullets.length - 1; j >= 0; j--) {
            let bullet = player.bullets[j];
            if (fireball.isColliding(bullet)) {
                if (bullet.super) {
                    explosions.push(new Explosion(fireball.x, fireball.y - 0.1, projExplosion.src, projExplosion.BASEIMAGEWIDTH, projExplosion.BASEIMAGEHEIGHT, 250, 3));
                } else {
                    explosions.push(new Explosion(fireball.x, fireball.y - 0.05, projExplosion.src, projExplosion.BASEIMAGEWIDTH, projExplosion.BASEIMAGEHEIGHT, 250, 1));
                }

                bullet.health -= fireball.damage;
                dragon.fireballs.splice(i, 1);

                if (bullet.health <= 0) {
                    player.bullets.splice(j, 1);
                }
                break;
            }
        }
    }
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        let bullet = player.bullets[i];
        if (bullet.isColliding(dragon) && dragon.alive) {
            dragon.hp -= bullet.damage;
            const knockbackAmount = 0.001 * Math.pow(bullet.sizeMultiplier, 4)  / 
            Math.pow(dragon.sizeMultiplier, 4) / (dragon.boss ? Math.pow(dragon.bossMultiplier, 3) : 1);
            dragon.x = dragon.x + bullet.dir * knockbackAmount;
            if (bullet.super) {
                explosions.push(new Explosion(bullet.x - 0.08, bullet.y - 0.2, basicExplosion.src, basicExplosion.BASEIMAGEWIDTH, basicExplosion.BASEIMAGEHEIGHT, 250, 4));
            } else {
                explosions.push(new Explosion(bullet.x - 0.02, bullet.y - 0.05, basicExplosion.src, basicExplosion.BASEIMAGEWIDTH, basicExplosion.BASEIMAGEHEIGHT, 250, 1));
            }
            player.bullets.splice(i, 1);
        }
    }
    if (dragon.boss) {
        for (let i = dragon.meteorites.length - 1; i >= 0; i--) {
            let meteorite = dragon.meteorites[i];
            if (meteorite.isColliding(player) && player.alive) {
                player.hp -= meteorite.damage;
                const knockbackAmount = 0.04 / Math.pow(player.sizeMultiplier, 4);
                player.y = player.y + knockbackAmount;
                explosions.push(new Explosion(meteorite.x - 0.04, meteorite.y - 0.02, fireExplosion.src, fireExplosion.BASEIMAGEWIDTH, fireExplosion.BASEIMAGEHEIGHT, 400, 1));
                dragon.meteorites.splice(i, 1);
            }
            for (let j = player.bullets.length - 1; j >= 0; j--) {
            let bullet = player.bullets[j];
            if (meteorite.isColliding(bullet)) {
                if (bullet.super) {
                    explosions.push(new Explosion(meteorite.x - 0.09, meteorite.y - 0.2, projExplosion.src, projExplosion.BASEIMAGEWIDTH, projExplosion.BASEIMAGEHEIGHT, 250, 3));
                } else {
                    explosions.push(new Explosion(meteorite.x - 0.01, meteorite.y, projExplosion.src, projExplosion.BASEIMAGEWIDTH, projExplosion.BASEIMAGEHEIGHT, 250, 1));
                }
                bullet.health -= meteorite.damage;
                dragon.meteorites.splice(i, 1);
                if (bullet.health <= 0) {
                    player.bullets.splice(j, 1);
                }
                break;
            }
        }
        }
    }
    explosions.forEach(e => e.update(deltaTime, mapWidth, mapHeight, BASEMAPWIDTH, BASEMAPHEIGHT));

}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    mapWidth = canvas.width;
    mapHeight = canvas.height;
}

function drawCenteredText(text, x, y) {
    const previousAlign = ctx.textAlign;
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
    ctx.textAlign = previousAlign;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx, mapWidth, mapHeight);
    dragon.draw(ctx, mapWidth, mapHeight, level);
    if (level >= 2) {
        cloud.draw(ctx, mapWidth, mapHeight);
        mystery.draw(ctx, mapWidth, mapHeight);
    }
    explosions.forEach(e => e.draw(ctx, mapWidth, mapHeight));

    if (gameState === "title") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        drawCenteredText("Dragon Shooter", canvas.width / 2, canvas.height / 2 - 80);

        ctx.font = "18px Arial";
        drawCenteredText("Use WASD or arrow keys to move, space to shoot", canvas.width / 2, canvas.height / 2 - 35);
        drawCenteredText("Defeat the dragon without getting hit!", canvas.width / 2, canvas.height / 2 - 12);

        ctx.font = "16px Arial";
        drawCenteredText("Press Play to start.", canvas.width / 2, canvas.height / 2 + 43);
        drawCenteredText("Or, press Enter on your keyboard.", canvas.width / 2, canvas.height / 2 + 63);

        // Draw Play button
        const btnW = Math.min(100, canvas.width * 0.1);
        const btnH = 45;
        const btnX = canvas.width / 2 - btnW / 2;
        const btnY = canvas.height / 2 + 105;
        titleButton.x = btnX;
        titleButton.y = btnY;
        titleButton.w = btnW;
        titleButton.h = btnH;

        // Button background
        ctx.fillStyle = titleButton.hover ? '#4CAF50' : '#2E8B57';
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(btnX, btnY, btnW, btnH);

        // Button text
        ctx.fillStyle = 'white';
        ctx.font = '18px Arial';
        const label = 'Play';
        drawCenteredText(label, canvas.width / 2, btnY + btnH / 2 + 8);
    }

    if (gameState == "paused") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        drawCenteredText("Game Paused", canvas.width / 2, canvas.height / 2 - 60);

        ctx.font = "16px Arial";
        drawCenteredText("Press the button or the Escape key to continue", canvas.width / 2, canvas.height / 2 - 20);
        // Draw Resume button
        const pW = Math.min(100, canvas.width * 0.15);
        const pH = 48;
        const pX = canvas.width / 2 - pW / 2;
        const pY = canvas.height / 2 + 30;
        pauseButton.x = pX; pauseButton.y = pY; pauseButton.w = pW; pauseButton.h = pH;
        ctx.fillStyle = pauseButton.hover ? '#4CAF50' : '#2E8B57';
        ctx.fillRect(pX, pY, pW, pH);
        ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.strokeRect(pX, pY, pW, pH);
        ctx.fillStyle = 'white'; ctx.font = '18px Arial';
        const resumeLabel = 'Resume';
        drawCenteredText(resumeLabel, canvas.width / 2, pY + pH / 2 + 6);
    }

    // Death screen
    if (gameState == "deathscreen") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        drawCenteredText("You Died", canvas.width / 2, canvas.height / 2 - 60);

        ctx.font = "16px Arial";
        drawCenteredText("Press the button or the Enter key to respawn", canvas.width / 2, canvas.height / 2 - 20);
        // Draw Respawn button
        const dW = Math.min(100, canvas.width * 0.15);
        const dH = 48;
        const dX = canvas.width / 2 - dW / 2;
        const dY = canvas.height / 2 + 30;
        deathButton.x = dX; deathButton.y = dY; deathButton.w = dW; deathButton.h = dH;
        ctx.fillStyle = deathButton.hover ? '#4CAF50' : '#2E8B57';
        ctx.fillRect(dX, dY, dW, dH);
        ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.strokeRect(dX, dY, dW, dH);
        ctx.fillStyle = 'white'; ctx.font = '18px Arial';
        const respawnLabel = 'Respawn';
        drawCenteredText(respawnLabel, canvas.width / 2, dY + dH / 2 + 6);
    }

    if (gameState == "gameover") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        drawCenteredText("Game Over", canvas.width / 2, canvas.height / 2 - 60);

        ctx.font = "16px Arial";
        drawCenteredText("Press the button or the Enter key to restart the game", canvas.width / 2, canvas.height / 2 - 20);
        // Draw Restart button
        const gW = Math.min(100, canvas.width * 0.15);
        const gH = 48;
        const gX = canvas.width / 2 - gW / 2;
        const gY = canvas.height / 2 + 30;
        gameOverButton.x = gX; gameOverButton.y = gY; gameOverButton.w = gW; gameOverButton.h = gH;
        ctx.fillStyle = gameOverButton.hover ? '#B22222' : '#8B0000';
        ctx.fillRect(gX, gY, gW, gH);
        ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.strokeRect(gX, gY, gW, gH);
        ctx.fillStyle = 'white'; ctx.font = '18px Arial';
        const restartLabel = 'Restart';
        drawCenteredText(restartLabel, canvas.width / 2, gY + gH / 2 + 6);
    }

    if (gameState == "victory") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        if (dragon.boss) {
            drawCenteredText("Boss Defeated", canvas.width / 2, canvas.height / 2 - 60);
        } else {
            drawCenteredText("Dragon Defeated", canvas.width / 2, canvas.height / 2 - 60);
        }

        ctx.drawImage(coinImage, canvas.width / 2 - 33, canvas.height / 2 - 42);
        ctx.font = "14px Arial";
        ctx.fillText("+" + dragon.reward, canvas.width / 2 + 9, canvas.height / 2 - 20);

        ctx.font = "16px Arial";
        drawCenteredText("Press the button or the Enter key to continue", canvas.width / 2, canvas.height / 2 + 60);
        // Draw Continue button
        const vW = Math.min(100, canvas.width * 0.15);
        const vH = 48;
        const vX = canvas.width / 2 - vW / 2;
        const vY = canvas.height / 2 + 90;
        victoryButton.x = vX; victoryButton.y = vY; victoryButton.w = vW; victoryButton.h = vH;
        ctx.fillStyle = victoryButton.hover ? '#4CAF50' : '#2E8B57';
        ctx.fillRect(vX, vY, vW, vH);
        ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.strokeRect(vX, vY, vW, vH);
        ctx.fillStyle = 'white'; ctx.font = '18px Arial';
        const contLabel = 'Continue';
        drawCenteredText(contLabel, canvas.width / 2, vY + vH / 2 + 6);
    }

    if (gameState == "upgrade") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        drawCenteredText("Pick an Upgrade", canvas.width / 2, canvas.height / 2 - 100);
        ctx.font = "16px Arial";
        drawCenteredText("Use number keys to highlight an upgrade, Space to buy it, or Enter to continue", canvas.width / 2, canvas.height / 2 + 105);

        const stats = getCurrentPlayerStats();
        const statPanelX = Math.max(20, canvas.width - 240);
        const statPanelY = 90;
        const hoveredIndex = upgradeOptionButtons.findIndex(btn => btn.hover);
        const activeHoverIndex = hoveredIndex >= 0 ? hoveredIndex : upgradeHoverIndex;
        const hoveredPreview = activeHoverIndex >= 0 ? getUpgradePreviewText(chosen[activeHoverIndex]) : null;
        ctx.font = "18px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Current Stats", statPanelX, statPanelY);
        ctx.font = "14px Arial";

        const statRows = [
            { key: "hp", label: `HP: ${stats.hp}`, y: statPanelY + 24 },
            { key: "reload", label: `Reload: ${formatStat(stats.reloadTime)}s`, y: statPanelY + 44 },
            { key: "speed", label: `Speed: ${formatStat(stats.speed)}`, y: statPanelY + 64 },
            { key: "damage", label: `Damage: ${stats.damage}`, y: statPanelY + 84 },
            { key: "lives", label: `Lives: ${stats.lives}`, y: statPanelY + 104 }
        ];

        statRows.forEach(({ key, label, y }) => {
            ctx.fillStyle = "white";
            ctx.fillText(label, statPanelX, y);
            if (hoveredPreview && hoveredPreview.line === key) {
                ctx.fillStyle = "#4cff7a";
                ctx.fillText(hoveredPreview.text, statPanelX + ctx.measureText(label).width, y);
            }
        });
        
        ctx.font = "18px Arial";
        const optionOffsets = [-40, -10, 20];

        for (let i = 0; i < chosen.length; i++) {
            const y = canvas.height / 2 + optionOffsets[i];
            const slot = chosen[i];
            const cost = slot ? slot.getCost() : 0;
            const affordable = slot ? player.coins >= cost : false;
            const selected = slot && ((activeHoverIndex === i) || upgradeOptionButtons[i].hover);
            const btnW = Math.min(360, canvas.width * 0.44);
            const btnH = 28;
            const btnX = canvas.width / 2 - btnW / 2;
            const btnY = y - 20;
            upgradeOptionButtons[i].x = btnX;
            upgradeOptionButtons[i].y = btnY;
            upgradeOptionButtons[i].w = btnW;
            upgradeOptionButtons[i].h = btnH;
            if (slot && selected) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';   
                ctx.fillRect(btnX, btnY, btnW, btnH);
            }

            ctx.fillStyle = "white";
            if (slot) {
                ctx.fillText("[" + (i + 1) + "] " + slot.name, canvas.width / 2 - 135, y);
                
                ctx.drawImage(coinImage, canvas.width / 2 + 48, y - 25);
                ctx.fillStyle = selected && !affordable ? "red" : "white";
                ctx.fillText(cost, canvas.width / 2 + 90, y);
            } else {
                ctx.fillStyle = "gray";
                drawCenteredText("[" + (i + 1) + "] Purchased", canvas.width / 2, y);
            }
            ctx.fillStyle = "white";

            if (slot && selected && !affordable) {
                ctx.fillStyle = "red";
                drawCenteredText("Not enough coins", canvas.width / 2, canvas.height / 2 + 65);
                ctx.fillStyle = "white";
            }
        }

        const cW = Math.min(100, canvas.width * 0.15);
        const cH = 48;
        const cX = canvas.width / 2 - cW / 2;
        const cY = canvas.height / 2 + 140;
        upgradeContinueButton.x = cX;
        upgradeContinueButton.y = cY;
        upgradeContinueButton.w = cW;
        upgradeContinueButton.h = cH;
        ctx.fillStyle = upgradeContinueButton.hover ? '#4CAF50' : '#2E8B57';
        ctx.fillRect(cX, cY, cW, cH);
        ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.strokeRect(cX, cY, cW, cH);
        ctx.fillStyle = 'white'; ctx.font = '18px Arial';
        const continueLabel = 'Continue';
        drawCenteredText(continueLabel, canvas.width / 2, cY + cH / 2 + 6);
    }

    ctx.drawImage(coinImage, canvas.width - 73, 20);
    ctx.fillStyle = gameState == "game" ? "black" : "white";
    ctx.font = "14px Arial";
    ctx.fillText(player.coins, canvas.width - 30, 42);
    ctx.fillText("Lives: " + player.lives, 135, 42);
    ctx.fillText("Level: " + level, canvas.width - 135, 42);

    const pauseW = 100;
    const pauseH = 32;
    const pauseX = 10;
    const pauseY = 21;
    gamePauseButton.x = pauseX;
    gamePauseButton.y = pauseY;
    gamePauseButton.w = pauseW;
    gamePauseButton.h = pauseH;
    if (gameState === "game") {
        if (player.superShotReady) {
            ctx.font = "24px Arial";
            drawCenteredText("Super Shot Ready! Press R to use", canvas.width / 2, canvas.height / 2 - 25);
        }
        ctx.fillStyle = gamePauseButton.hover ? '#4CAF50' : '#2E8B57';
        
    } else {
        ctx.fillStyle = '#555';
    }
    ctx.fillRect(pauseX, pauseY, pauseW, pauseH);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(pauseX, pauseY, pauseW, pauseH);
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    const pauseText = 'Pause';
    drawCenteredText(pauseText, pauseX + pauseW / 2, pauseY + pauseH / 2 + 6);
}

function reset(isLevelCleared) {
    player.imageWidth = player.BASEIMGWIDTH;
    player.imageHeight = player.BASEIMGHEIGHT;
    player.x = playerSpawnX;
    player.y = playerSpawnY;
    player.alive = true;
    player.hp = player.maxHp;
    player.facing = -1;
    player.fadeTime = 1;
    shooting = false;
    keysPressed.clear();
    player.bullets = [];
    player.shootingTime = 0;
    player.bulletDmg = 1;
    player.speedMultiplier = 1;
    player.fireRateMultiplier = 1;
    player.sizeMultiplier = 1;
    player.ltnInvinc = false;
    player.superShotReady = false;
    if (gameOver) {
        level = 1;
        player.lives = player.maxLives;
        player.coins = 0;
        player.maxHp = 1;
        player.hp = 1;
        player.dmgUpgrade = 0;
        player.fireRateUpgraded = 1;
        player.speedUpgraded = 1;
        player.bhealthUpgrade = 0;
        player.bulletSizeMultiplier = 1;
        player.unlockedMysteryBox = false;
        upgradePool.forEach(upgrade => {
            upgrade.currentLevel = 0;
        })
        dragon.boss = false;
        dragon.maxHp = [25, 40, 60, 100, 50, 20, 80];
        dragon.hp = dragon.maxHp[0];
        dragon.rewards = [
            Math.round(Math.random() * 16 + 26), 
            Math.round(Math.random() * 18 + 42), 
            Math.round(Math.random() * 20 + 62), 
            Math.round(Math.random() * 16 + 145),
            Math.round(Math.random() * 27 + 44),
            Math.round(Math.random() * 15 + 49),
            Math.round(Math.random() * 18 + 88)];
        gameOver = false;
    }

    cloud.warningActive = false;
    cloud.lightningActive = false;
    cloud.damageTime = 0;
    cloud.strikeTimer = 0;
    cloud.warningTimer = 0;
    cloud.lightningTimer = 0;
    cloud.strikeInterval = Math.random() * 5000 + 3000;
    cloud.hitEntities.clear();

    mystery.active = false;
    mystery.collected = false;
    mystery.affectTime = 0;
    mystery.activeTime = 0;
    mystery.inactiveTime = 0;
    mystery.spawnTime = Math.random() * 12500 + 2500;
    mystery.x = Math.random() * 0.9 + 0.05;
    mystery.y = Math.random() * 0.7 + 0.25;
    mystery.effectNumber = 0;
    player.collected = false;
    dragon.collected = false;

    dragon.x = dragonSpawnX;
    dragon.y = dragonSpawnY;
    dragon.imageWidth = dragon.BASEIMGWIDTH;
    dragon.imageHeight = dragon.BASEIMGHEIGHT;
    dragon.alive = true;
    dragon.facing = 1;
    dragon.fadeTime = 1;
    dragon.hpChooser = Math.min(level - 1, dragon.maxHp.length - 1);
    if (isLevelCleared) {
        dragon.hp = dragon.maxHp[dragon.hpChooser];
    } else {
        dragon.hp = Math.min(dragon.hp + Math.round(dragon.maxHp[dragon.hpChooser] / 3), dragon.maxHp[dragon.hpChooser]);
    }
    dragon.reward = dragon.rewards[dragon.hpChooser];
    dragon.phase = 1;
    dragon.charging = false;
    dragon.moveTime = 0;
    dragon.fireballs = [];
    dragon.shootingTime = 0;
    dragon.speedMultiplier = 1;
    dragon.sizeMultiplier = 1;
    dragon.moveMultiplier = 1;
    dragon.fireRateMultiplier = 1;
    dragon.fireDmg = 1;
    dragon.ltnInvinc = false;
    dragon.abilityActive = false;
    dragon.warningActive = false;
    dragon.abilityCooldown = 0;
    dragon.abilityWarning = 0;
    dragon.abilityDuration = 0;
    dragon.spawnCooldown = 0;
    explosions.splice(0, explosions.length);
    if (level == 4) {
        dragon.boss = true;
    } else {
        dragon.boss = false;
    }
    dragon.meteorites = [];

    lastHit = 0;
    deadTime = 0;
    defeatTime = 0;
    gameState = "game";
    upgradeInput = 0;
}

let lastTimestamp = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

const blockedKeys = [
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    "KeyW", "KeyA", "KeyS", "KeyD",
    "Space"
];

document.addEventListener("keydown", (e) => {
    if (blockedKeys.includes(e.code)) {
        e.preventDefault();
    }

    keysPressed.add(e.code);

    if (gameState == "game") {
        if (e.code === "Space") {
            shooting = true;
        }
        if (player.alive && e.code === "KeyR" && player.superShotReady) {
            player.shootSuperBullet();
        }
    }
    


    if (e.code === "Escape") {
        if (gameState == "paused") {
            gameState = "game";
        } else if (gameState == "game") {
            gameState = "paused";
        }
    }
    if (gameState == "upgrade") {
        const index = parseInt(e.code.replace("Digit", ""), 10) - 1;
        if (!Number.isNaN(index) && index >= 0 && index < chosen.length) {
            upgradeHoverIndex = index;
        } else if (e.code === "Space" && upgradeHoverIndex >= 0 && upgradeHoverIndex < chosen.length) {
            applyUpgradeChoice(upgradeHoverIndex);
        }
    }
    if (e.code === "Enter") {
        if (gameState == "deathscreen" || gameState == "title") {
            gameState = "game";
            reset(false);
        } else if (gameState == "upgrade") {
            gameState = "game";
            level++;
            reset(true);
        } else if (gameState == "victory") {
            available = upgradePool.filter(upgrade =>
                (upgrade.maxLevel == undefined ||
                upgrade.currentLevel < upgrade.maxLevel) &&
                upgrade.availableLevel <= level
            );
            chosen = [];
            for (let i = 0; i < 3; i++) {
                let index = Math.floor(Math.random() * available.length);
                chosen.push(available[index]);
                available.splice(index, 1);
            }
            upgradeHoverIndex = -1;
            gameState = "upgrade";
        } else if (gameState == "gameover") {
            reset(false);
            gameState = "title";
        }
    }
});


document.addEventListener("keyup", (e) => {
    if (blockedKeys.includes(e.code)) {
        e.preventDefault();
    }
    keysPressed.delete(e.code);
    if (e.code == "Space") {
        shooting = false;
    }
})

window.addEventListener("resize", resizeCanvas);

canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
})
// Mouse / touch interactions for title screen Play button
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    // Clear all hover states
    titleButton.hover = deathButton.hover = gameOverButton.hover = victoryButton.hover = pauseButton.hover = gamePauseButton.hover = false;
    upgradeOptionButtons.forEach(btn => btn.hover = false);
    upgradeContinueButton.hover = false;

    let anyHover = false;
    if (gameState === "title") {
        const over = mx >= titleButton.x && mx <= titleButton.x + titleButton.w && my >= titleButton.y && my <= titleButton.y + titleButton.h;
        titleButton.hover = over;
        anyHover = over;
    } else if (gameState === "deathscreen") {
        const over = mx >= deathButton.x && mx <= deathButton.x + deathButton.w && my >= deathButton.y && my <= deathButton.y + deathButton.h;
        deathButton.hover = over;
        anyHover = over;
    } else if (gameState === "gameover") {
        const over = mx >= gameOverButton.x && mx <= gameOverButton.x + gameOverButton.w && my >= gameOverButton.y && my <= gameOverButton.y + gameOverButton.h;
        gameOverButton.hover = over;
        anyHover = over;
    } else if (gameState === "victory") {
        const over = mx >= victoryButton.x && mx <= victoryButton.x + victoryButton.w && my >= victoryButton.y && my <= victoryButton.y + victoryButton.h;
        victoryButton.hover = over;
        anyHover = over;
    } else if (gameState === "paused") {
        const over = mx >= pauseButton.x && mx <= pauseButton.x + pauseButton.w && my >= pauseButton.y && my <= pauseButton.y + pauseButton.h;
        pauseButton.hover = over;
        anyHover = over;
    } else if (gameState === "game") {
        const over = mx >= gamePauseButton.x && mx <= gamePauseButton.x + gamePauseButton.w && my >= gamePauseButton.y && my <= gamePauseButton.y + gamePauseButton.h;
        gamePauseButton.hover = over;
        anyHover = over;
    } else if (gameState === "upgrade") {
        upgradeOptionButtons.forEach((btn) => {
            const over = mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h;
            if (over) {
                btn.hover = true;
                anyHover = true;
            }
        });
        const overContinue = mx >= upgradeContinueButton.x && mx <= upgradeContinueButton.x + upgradeContinueButton.w && my >= upgradeContinueButton.y && my <= upgradeContinueButton.y + upgradeContinueButton.h;
        upgradeContinueButton.hover = overContinue;
        anyHover = anyHover || overContinue;
    }

    canvas.style.cursor = anyHover ? 'pointer' : 'default';
});

canvas.addEventListener("mouseleave", () => {
    titleButton.hover = deathButton.hover = gameOverButton.hover = victoryButton.hover = pauseButton.hover = false;
    upgradeOptionButtons.forEach(btn => btn.hover = false);
    upgradeContinueButton.hover = false;
    canvas.style.cursor = 'default';
});

canvas.addEventListener("mousedown", (e) => {
    if (gameState === "title" && titleButton.hover) {
        gameState = "game";
        reset(false);
    } else if (gameState === "deathscreen" && deathButton.hover) {
        gameState = "game";
        reset(false);
    } else if (gameState === "gameover" && gameOverButton.hover) {
        reset(false);
        gameState = "title";
    } else if (gameState === "victory" && victoryButton.hover) {
        available = upgradePool.filter(upgrade =>
            (upgrade.maxLevel == undefined ||
            upgrade.currentLevel < upgrade.maxLevel) &&
            upgrade.availableLevel <= level
        );
        chosen = [];
        for (let i = 0; i < 3; i++) {
            let index = Math.floor(Math.random() * available.length);
            chosen.push(available[index]);
            available.splice(index, 1);
        }
        upgradeHoverIndex = -1;
        gameState = "upgrade";
    } else if (gameState === "paused" && pauseButton.hover) {
        gameState = "game";
    } else if (gameState === "game" && gamePauseButton.hover) {
        gameState = "paused";
    } else if (gameState === "upgrade") {
        for (let i = 0; i < upgradeOptionButtons.length; i++) {
            if (upgradeOptionButtons[i].hover) {
                applyUpgradeChoice(i);
                return;
            }
        }
        if (upgradeContinueButton.hover) {
            gameState = "game";
            level++;
            reset(true);
        }
    }
});

canvas.addEventListener("touchstart", (e) => {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const mx = touch.clientX - rect.left;
    const my = touch.clientY - rect.top;
    if (gameState === "title") {
        const over = mx >= titleButton.x && mx <= titleButton.x + titleButton.w && my >= titleButton.y && my <= titleButton.y + titleButton.h;
        if (over) { e.preventDefault(); gameState = "game"; reset(false); }
    } else if (gameState === "deathscreen") {
        const over = mx >= deathButton.x && mx <= deathButton.x + deathButton.w && my >= deathButton.y && my <= deathButton.y + deathButton.h;
        if (over) { e.preventDefault(); gameState = "game"; reset(false); }
    } else if (gameState === "gameover") {
        const over = mx >= gameOverButton.x && mx <= gameOverButton.x + gameOverButton.w && my >= gameOverButton.y && my <= gameOverButton.y + gameOverButton.h;
        if (over) { e.preventDefault(); reset(false); gameState = "title"; }
    } else if (gameState === "victory") {
        const over = mx >= victoryButton.x && mx <= victoryButton.x + victoryButton.w && my >= victoryButton.y && my <= victoryButton.y + victoryButton.h;
        if (over) {
            e.preventDefault();
            available = upgradePool.filter(upgrade =>
                (upgrade.maxLevel == undefined ||
                upgrade.currentLevel < upgrade.maxLevel) &&
                upgrade.availableLevel <= level
            );
            chosen = [];
            for (let i = 0; i < 3; i++) {
                let index = Math.floor(Math.random() * available.length);
                chosen.push(available[index]);
                available.splice(index, 1);
            }
            upgradeHoverIndex = -1;
            gameState = "upgrade";
        }
    } else if (gameState === "paused") {
        const over = mx >= pauseButton.x && mx <= pauseButton.x + pauseButton.w && my >= pauseButton.y && my <= pauseButton.y + pauseButton.h;
        if (over) { e.preventDefault(); gameState = "game"; }
    } else if (gameState === "game") {
        const over = mx >= gamePauseButton.x && mx <= gamePauseButton.x + gamePauseButton.w && my >= gamePauseButton.y && my <= gamePauseButton.y + gamePauseButton.h;
        if (over) { e.preventDefault(); gameState = "paused"; }
    } else if (gameState === "upgrade") {
        for (let i = 0; i < upgradeOptionButtons.length; i++) {
            const btn = upgradeOptionButtons[i];
            const over = mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h;
            if (over) {
                e.preventDefault();
                applyUpgradeChoice(i);
                return;
            }
        }
        const overContinue = mx >= upgradeContinueButton.x && mx <= upgradeContinueButton.x + upgradeContinueButton.w && my >= upgradeContinueButton.y && my <= upgradeContinueButton.y + upgradeContinueButton.h;
        if (overContinue) { e.preventDefault(); gameState = "game"; reset(true); }
    }
});
requestAnimationFrame(gameLoop);

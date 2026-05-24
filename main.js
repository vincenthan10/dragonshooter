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

let shooting = false;

let lastHit = 0;
let bodyHitTime = 275;

let deadTime = 0;
let gameOverTime = 1000;
let defeatTime = 0;
let victoryTime = 1500;
let gameState = "title";
let gameOver = false;

let upgradePool = [
    {   
        name: "Damage Up",
        baseCost: 125,
        apply: (player) => player.dmgUpgrade += 1,
        maxLevel: 2,
        currentLevel: 0,
        getCost() {
            return this.baseCost + this.currentLevel * 50;
        }
    },
    {
        name: "Speed Up",
        baseCost: 30,
        apply: (player) => player.speedUpgraded *= 1.1,
        maxLevel: 5,
        currentLevel: 0,
        getCost() {
            return this.baseCost + this.currentLevel * 10;
        }
    },
    {
        name: "Fire Rate Up",
        baseCost: 50,
        apply: (player) => player.fireRateUpgraded *= 0.9,
        maxLevel: 5,
        currentLevel: 0,
        getCost() {
            return this.baseCost + this.currentLevel * 20;
        }
    },
    {
        name: "Extra Life",
        baseCost: 50,
        apply: (player) => player.lives++,
        currentLevel: 0,
        getCost() {
            return this.baseCost + this.currentLevel * 10;
        }
    },
    {
        name: "Health Up",
        baseCost: 150,
        currentLevel: 0,
        apply(player) {
            player.maxHp += (this.currentLevel + 1);
            player.hp = player.maxHp;
        },
        maxLevel: 5,
        getCost() {
            return this.baseCost + this.currentLevel * this.currentLevel * 10;
        }
    }
]
let available = [];
let chosen = [];
let upgradeInput = 0;

function applyUpgradeChoice(index) {
    if (index < 0 || index >= chosen.length) {
        return;
    }

    const upgrade = chosen[index];
    const cost = upgrade.getCost();

    if (player.coins >= cost) {
        player.coins -= cost;
        upgrade.apply(player);
        upgrade.currentLevel++;
        chosen.splice(index, 1);
        upgradeInput = 0;
    }
}

function update(deltaTime) {
    if (gameState != "game") {
        return;
    } 
    //console.log(explosions);
    cloud.update(deltaTime, mapWidth, mapHeight, canvas, BASEMAPWIDTH, BASEMAPHEIGHT);
    cloud.collisionHandler(player, mapWidth);
    cloud.collisionHandler(dragon, mapWidth);
    mystery.update(deltaTime, mapWidth, mapHeight, BASEMAPWIDTH, BASEMAPHEIGHT);
    if (mystery.isColliding(player)) {
        player.collected = true;
        mystery.playerEffect(player, true, 0);
    }
    if (mystery.isColliding(dragon)) {
        dragon.collected = true;
        mystery.dragonEffect(dragon, true, 0);
    }
    player.update(deltaTime, keysPressed, mapWidth, mapHeight, canvas, BASEMAPWIDTH, BASEMAPHEIGHT);
    if (!dragon.alive && !dragon.fading) {
        dragon.fading = true;
        defeatTime += deltaTime;
        if (defeatTime >= victoryTime) {
            gameState = "victory";
            player.coins += 50;
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
    dragon.update(deltaTime, mapWidth, mapHeight, canvas, BASEMAPWIDTH, BASEMAPHEIGHT, player);
    if (dragon.alive && dragon.isColliding(player) && lastHit >= bodyHitTime) {
        player.hp--;
        lastHit = 0;
    }
    lastHit += deltaTime;
    for (let i = dragon.fireballs.length - 1; i >= 0; i--) {
        let fireball = dragon.fireballs[i];
        if (fireball.isColliding(player) && player.alive) {
            player.hp -= fireball.damage;
            explosions.push(new Explosion(fireball.x, fireball.y - 0.05, fireExplosion.src, fireExplosion.BASEIMAGEWIDTH, fireExplosion.BASEIMAGEHEIGHT, 400));
            dragon.fireballs.splice(i, 1);
            continue;
        }
        for (let j = player.bullets.length - 1; j >= 0; j--) {
            let bullet = player.bullets[j];
            if (fireball.isColliding(bullet)) {
                explosions.push(new Explosion(fireball.x, fireball.y - 0.05, projExplosion.src, projExplosion.BASEIMAGEWIDTH, projExplosion.BASEIMAGEHEIGHT, 250));
                dragon.fireballs.splice(i, 1);
                player.bullets.splice(j, 1);
                break;
            }
        }
    }
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        let bullet = player.bullets[i];
        if (bullet.isColliding(dragon) && dragon.alive) {
            dragon.hp -= bullet.damage;
            explosions.push(new Explosion(bullet.x, bullet.y - 0.05, basicExplosion.src, basicExplosion.BASEIMAGEWIDTH, basicExplosion.BASEIMAGEHEIGHT, 250));
            player.bullets.splice(i, 1);
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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx, mapWidth, mapHeight);
    dragon.draw(ctx, mapWidth, mapHeight);
    cloud.draw(ctx, mapWidth, mapHeight);
    mystery.draw(ctx, mapWidth, mapHeight);
    explosions.forEach(e => e.draw(ctx, mapWidth, mapHeight));

    if (gameState === "title") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("Dragon Shooter", canvas.width / 2 - 135, canvas.height / 2 - 50);

        ctx.font = "18px Arial";
        ctx.fillText("Use WASD or arrow keys to move, space to shoot", canvas.width / 2 - 192, canvas.height / 2 - 5);
        ctx.fillText("Defeat the dragon without getting hit!", canvas.width / 2 - 142, canvas.height / 2 + 25);

        ctx.font = "16px Arial";
        ctx.fillText("Press Enter to start", canvas.width / 2 - 70, canvas.height / 2 + 80);
    }

    if (gameState == "paused") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("Game Paused", canvas.width / 2 - 125, canvas.height / 2 - 40);

        ctx.font = "16px Arial";
        ctx.fillText("Press Escape to continue", canvas.width / 2 - 90, canvas.height / 2);
    }

    // Death screen
    if (gameState == "deathscreen") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("You Died", canvas.width / 2 - 85, canvas.height / 2 - 40);

        ctx.font = "16px Arial";
        ctx.fillText("Press Enter to respawn", canvas.width / 2 - 86, canvas.height / 2);
    }

    if (gameState == "gameover") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 93, canvas.height / 2 - 40);

        ctx.font = "16px Arial";
        ctx.fillText("Press Enter to restart the game", canvas.width / 2 - 102, canvas.height / 2);
    }

    if (gameState == "victory") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("Dragon Defeated", canvas.width / 2 - 135, canvas.height / 2 - 40);

        ctx.drawImage(coinImage, canvas.width / 2 - 30, canvas.height / 2 - 22);
        ctx.font = "14px Arial";
        ctx.fillText("+50", canvas.width / 2 + 15, canvas.height / 2);

        ctx.font = "16px Arial";
        ctx.fillText("Press Enter to continue", canvas.width / 2 - 80, canvas.height / 2 + 60);
    }

    if (gameState == "upgrade") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("Pick an Upgrade", canvas.width / 2 - 140, canvas.height / 2 - 40);

        ctx.font = "20px Arial";
        const optionOffsets = [10, 40, 70];

        for (let i = 0; i < chosen.length; i++) {
            const y = canvas.height / 2 + optionOffsets[i];
            const cost = chosen[i].getCost();
            const affordable = player.coins >= cost;
            const selected = upgradeInput == "Digit" + (i + 1);

            ctx.fillText("[" + (i + 1) + "] " + chosen[i].name, canvas.width / 2 - 110, y);
            ctx.drawImage(coinImage, canvas.width / 2 + 40, y - 25);
            ctx.fillStyle = selected && !affordable ? "red" : "white";
            ctx.fillText(cost, canvas.width / 2 + 83, y);
            ctx.fillStyle = "white";

            if (selected && !affordable) {
                ctx.fillStyle = "red";
                ctx.fillText("Not enough coins", canvas.width / 2 - 75, canvas.height / 2 + 120);
                ctx.fillStyle = "white";
            }
        }
    }

    ctx.drawImage(coinImage, canvas.width - 68, 0);
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText(player.coins, canvas.width - 25, 22);

    ctx.font = "14px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Lives: " + player.lives, 50, 50);
}

function reset() {
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
    if (gameOver) {
        player.lives = player.maxLives;
        player.coins = 0;
        player.maxHp = 1;
        player.dmgUpgrade = 0;
        player.fireRateUpgraded = 1;
        player.speedUpgraded = 1;
        upgradePool.forEach(upgrade => {
            upgrade.currentLevel = 0;
        })
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
    dragon.hp = dragon.maxHp;
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
    explosions.splice(0, explosions.length);

    lastHit = 0;
    deadTime = 0;
    defeatTime = 0;
    gameState = "game";
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

    if (e.code === "Space") {
        shooting = true;
    }

    if (e.code === "Escape") {
        if (gameState == "paused") {
            gameState = "game";
        } else if (gameState == "game") {
            gameState = "paused";
        }
    }
    if (gameState == "upgrade") {
        upgradeInput = e.code;
        const index = parseInt(e.code.replace("Digit", ""), 10) - 1;
        if (!Number.isNaN(index) && index >= 0 && index < chosen.length) {
            applyUpgradeChoice(index);
        }
    }
    if (e.code === "Enter") {
        if (gameState == "deathscreen" || gameState == "title" || gameState == "upgrade") {
            gameState = "game";
            reset();
        } else if (gameState == "victory") {
            available = upgradePool.filter(upgrade =>
                upgrade.maxLevel == undefined ||
                upgrade.currentLevel < upgrade.maxLevel
            );
            chosen = [];
            for (let i = 0; i < 3; i++) {
                let index = Math.floor(Math.random() * available.length);
                chosen.push(available[index]);
                available.splice(index, 1);
            }
            gameState = "upgrade";
        } else if (gameState == "gameover") {
            reset();
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
requestAnimationFrame(gameLoop);

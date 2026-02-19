import Dragon from "./dragon.js";
import Player from "./player.js";
import Cloud from "./cloud.js";
import Explosion from "./explosion.js";

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

let shooting = false;

let deadTime = 0;
let gameOverTime = 1000;
let gameState = "title";
let gameOver = false;

function update(deltaTime) {
    if (gameOver || gameState === "title") return;
    //console.log(explosions);
    const now = performance.now();
    cloud.update(deltaTime, mapWidth, mapHeight, canvas, BASEMAPWIDTH, BASEMAPHEIGHT);
    cloud.collisionHandler(player, mapWidth);
    player.update(deltaTime, keysPressed, mapWidth, mapHeight, canvas, BASEMAPWIDTH, BASEMAPHEIGHT);
    if (!player.alive && deadTime === 0) {
        deadTime = now;
    }
    if (!player.alive && now - deadTime >= gameOverTime) {
        gameOver = true;
        return;
    }
    if (shooting && player.alive && now - player.lastShootTime >= player.shootingDelay) {
        player.shoot();
        player.lastShootTime = now;
    }
    dragon.update(deltaTime, mapWidth, mapHeight, canvas, BASEMAPWIDTH, BASEMAPHEIGHT, player);
    if (dragon.isColliding(player)) {
        player.hp = 0;
    }
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
        if (bullet.isColliding(dragon)) {
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
    explosions.forEach(e => e.draw(ctx, mapWidth, mapHeight));

    if (gameState === "title") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("Dragon Shooter", canvas.width / 2 - 140, canvas.height / 2 - 50);

        ctx.font = "18px Arial";
        ctx.fillText("Use WASD or arrow keys to move, space to shoot", canvas.width / 2 - 200, canvas.height / 2 - 5);
        ctx.fillText("Defeat the dragon without getting hit!", canvas.width / 2 - 150, canvas.height / 2 + 25);

        ctx.font = "16px Arial";
        ctx.fillText("Press Enter to start", canvas.width / 2 - 80, canvas.height / 2 + 80);
    }

    // Game Over screen
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("You Died", canvas.width / 2 - 90, canvas.height / 2 - 40);

        ctx.font = "16px Arial";
        ctx.fillText("Press Enter to respawn", canvas.width / 2 - 92, canvas.height / 2);
    }
}

function reset() {
    let now = performance.now();
    player.x = playerSpawnX;
    player.y = playerSpawnY;
    player.alive = true;
    player.hp = player.maxHp;
    player.facing = -1;
    shooting = false;
    keysPressed.clear();
    player.bullets = [];
    player.lastShootTime = now;

    cloud.warningActive = false;
    cloud.lightningActive = false;
    cloud.canDamage = false;
    cloud.startTime = now;
    cloud.lastStrikeTime = now;

    dragon.x = dragonSpawnX;
    dragon.y = dragonSpawnY;
    dragon.facing = 1;
    dragon.hp = dragon.maxHp;
    dragon.charging = false;
    dragon.lastMoveTime = now;
    dragon.fireballs = [];
    dragon.lastShootTime = now;
    explosions.splice(0, explosions.length);

    deadTime = 0;
    gameOver = false;
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

    if (e.code === "Enter" && (gameOver || gameState === "title")) {
        reset();
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

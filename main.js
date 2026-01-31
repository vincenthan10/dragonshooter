import Dragon from "./dragon.js";
import Player from "./player.js";
import Cloud from "./cloud.js";

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

let shooting = false;

let deadTime = 0;
let gameOverTime = 1000;
let gameState = "title";
let gameOver = false;

function update(deltaTime) {
    if (gameOver || gameState === "title") return;
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
    if (shooting && now - player.lastShootTime >= player.shootingDelay) {
        player.shoot();
        player.lastShootTime = now;
    }
    dragon.update(deltaTime, mapWidth, mapHeight, canvas, BASEMAPWIDTH, BASEMAPHEIGHT, player);
    if (dragon.isColliding(player)) {
        player.hp = 0;
    }
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
    player.draw(ctx, mapWidth, mapHeight, BASEMAPWIDTH, BASEMAPHEIGHT);
    dragon.draw(ctx, mapWidth, mapHeight, BASEMAPWIDTH, BASEMAPHEIGHT);
    cloud.draw(ctx, mapWidth, mapHeight, BASEMAPWIDTH, BASEMAPHEIGHT);

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
    player.hp = 1;
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
    dragon.charging = false;
    dragon.lastMoveTime = now;

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

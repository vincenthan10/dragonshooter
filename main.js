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

const dragon = new Dragon(0.1, 0.3);
const player = new Player(0.74, 0.4);
const cloud = new Cloud(-0.1 * canvas.width, 0);

let shooting = false;

function update(deltaTime) {
    const now = performance.now();
    cloud.update(deltaTime, mapWidth, mapHeight, canvas, BASEMAPWIDTH, BASEMAPHEIGHT);
    cloud.collisionHandler(player, mapWidth);
    player.update(deltaTime, keysPressed, mapWidth, mapHeight, canvas, BASEMAPWIDTH, BASEMAPHEIGHT);
    if (shooting && now - player.lastShootTime >= player.shootingDelay) {
        player.shoot();
        player.lastShootTime = now;
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

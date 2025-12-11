import Dragon from "./dragon.js";
import Player from "./player.js";
import Cloud from "./cloud.js";

const canvas = document.getElementById("gameCanvas")

const ctx = canvas.getContext("2d");

const dragon = new Dragon(0.1 * canvas.width, 0.3 * canvas.height);
const player = new Player(0.74 * canvas.width, 0.4 * canvas.height);
const cloud = new Cloud(-0.1 * canvas.width, 0);

function update(deltaTime) {
    const now = performance.now();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Always adjust with screen (CHANGE LATER WHEN THEY START MOVING)
    dragon.x = 0.1 * canvas.width;
    dragon.y = 0.3 * canvas.height;
    player.x = 0.74 * canvas.width;
    player.y = 0.4 * canvas.height;

}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx);
    dragon.draw(ctx);
    cloud.draw(ctx, canvas);
}

let lastTimestamp = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

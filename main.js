import Dragon from "./dragon.js";

const canvas = document.getElementById("gameCanvas")

const ctx = canvas.getContext("2d");

const dragon = new Dragon(0.1 * canvas.width, 0.3 * canvas.height);

function update(deltaTime) {
    const now = performance.now();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    dragon.x = 0.1 * canvas.width;
    dragon.y = 0.3 * canvas.height;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    dragon.draw(ctx);
    console.log(canvas.height);
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

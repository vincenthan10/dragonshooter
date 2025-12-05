const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d");

function update(deltaTime) {
    const now = performance.now();
}

function draw() {
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
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

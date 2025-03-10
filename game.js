// 在game.js开头添加移动端适配
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;
ctx.scale(devicePixelRatio, devicePixelRatio);
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


// 系统状态
let gameState = {
    playerX: 100,
    moveDir: 0,
    isRaining: false,
    weatherTimer: 0,
    bgOffset: 0
};

// 小人动画帧
const playerAnim = {
    walk: [[-15,0,30,50], [-15,50,30,50], [-15,100,30,50]],
    umbrella: [[-20,150,40,50]],
    currentFrame: 0
};

// 数码雨粒子系统
const rainParticles = [];
function createRain() {
    for(let i=0; i<20; i++) {
        rainParticles.push({
            x: Math.random()*canvas.width,
            y: -Math.random()*canvas.height,
            speed: 5 + Math.random()*10
        });
    }
}

// 主绘制循环
function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制星空背景
    ctx.fillStyle = '#fff';
    for(let i=0; i<100; i++) {
        ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 2, 2);
    }

    // 绘制数码地面
    ctx.strokeStyle = '#0ff';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height-50);
    ctx.lineTo(canvas.width, canvas.height-50);
    ctx.stroke();

    // 绘制小人
    const frame = gameState.moveDir !== 0 ? 
        playerAnim.walk[(playerAnim.currentFrame)%3] : 
        playerAnim.umbrella[0];
    ctx.fillStyle = gameState.isRaining ? '#0ff' : '#f0f';
    ctx.fillRect(
        gameState.playerX + frame[0], 
        canvas.height - 100 + frame[1],
        frame[2], 
        frame[3]
    );

    // 数码雨特效
    if(gameState.isRaining) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
        rainParticles.forEach(p => {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x+3, p.y+15);
            ctx.stroke();
            p.y += p.speed;
            if(p.y > canvas.height) p.y = -10;
        });
    }

    // 彩虹晴空
    if(gameState.weatherTimer > 300) {
        const gradient = ctx.createLinearGradient(0,0,canvas.width,0);
        gradient.addColorStop(0, 'rgba(255,0,0,0.5)');
        gradient.addColorStop(0.5, 'rgba(0,255,0,0.5)');
        gradient.addColorStop(1, 'rgba(0,0,255,0.5)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, 100);
    }
}

// 游戏逻辑更新
function update() {
    // 横向地图滚动
    gameState.bgOffset += gameState.moveDir * 3;
    gameState.playerX = Math.max(50, Math.min(canvas.width-50, 
        gameState.playerX + gameState.moveDir * 5));

    // 天气系统逻辑
    if(gameState.moveDir === 0) {
        gameState.weatherTimer++;
        if(gameState.weatherTimer > 60 && !gameState.isRaining) {
            gameState.isRaining = true;
            createRain();
        }
    } else {
        gameState.weatherTimer = 0;
        if(gameState.playerX > canvas.width/2) {
            gameState.isRaining = false;
        }
    }

    // 动画帧更新
    if(gameState.moveDir !== 0) {
        playerAnim.currentFrame += 0.2;
    }
}

// 控制绑定
document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft') gameState.moveDir = -1;
    if(e.key === 'ArrowRight') gameState.moveDir = 1;
});
document.addEventListener('keyup', () => gameState.moveDir = 0);

// 触屏支持
let touchStartX = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});
canvas.addEventListener('touchmove', (e) => {
    const delta = e.touches[0].clientX - touchStartX;
    gameState.moveDir = delta > 0 ? 1 : -1;
});
canvas.addEventListener('touchend', () => gameState.moveDir = 0);

// 启动游戏循环
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
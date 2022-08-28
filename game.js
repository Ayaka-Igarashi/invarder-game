class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.used = false;
  }
}

class EnemyBullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Enemy {
  constructor(x, y, idx) {
    this.x = x;
    this.y = y;
    this.idx = idx;
    this.alive = true;
  }
}

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// game
let isGameOver = false
let isGameClear = false

// player
let player_x = canvas.width / 2;
const player_y = canvas.height - 30;
const player_dx = 2;
const player_minx = 50;
const player_maxx = canvas.width - 50;
const player_sizex = 25;
const player_sizey = 15;
let isPlayerNon = false

// enemy
const enemy_count = 36;
let enemies = []
const enemy_sizex = 20;
const enemy_sizey = 10;
let enemy_grid = {}
const grid_x = 25
const grid_y = 23
const grid_xcount = 12
const grid_ycount = 15
const grid_count = grid_xcount * grid_ycount
let enemyMoveLeft = true;
const enemy_move_x = 9
const enemy_move_y = 15
const enemy_movecount_max = 15
let enemy_movecount = 0
const enemy_downcount_max = 8
let enemy_downcount = 0

// bullet
let bullets = [];
const bullet_dy = -2;
let enemy_bullets = []
const enemy_bullet_dy = 1.5

// util
let rightPressed = false
let leftPressed = false
let fireAlready = false

function initState() {
  isGameOver = false
  isGameClear = false
  enemy_grid = {}
  enemyMoveLeft = true;
  enemies = []
  bullets = []
  fireAlready = false
  enemy_bullets = []
  isPlayerNon = false
  enemy_movecount = 0
  enemy_downcount = 0
  makeEnemyGrid()
  initEnemies()
}

function makeEnemyGrid() {
  for (let i = 0; i < grid_count; i++) {
    let gx = canvas.width - (canvas.width - grid_xcount * grid_x)/2 - (i % grid_xcount) * grid_x
    // if ((i/grid_xcount | 0) % 2 === 1) gx = canvas.width - (canvas.width - grid_xcount * grid_x)/2 - (grid_xcount - (i % grid_xcount) - 1) * grid_x
    let gy = 80 + (i/grid_xcount | 0) * grid_y
    enemy_grid[i] = {x:gx, y:gy}
  }
}

function initEnemies() {
  for (let i = 0; i < enemy_count; i++) {
    const pos = enemy_grid[i]
    const enemy = new Enemy(pos.x - enemy_sizex/2 + enemy_movecount_max*enemy_move_x/2, pos.y - enemy_sizey/2, i)
    enemies.push(enemy)
  }
}

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawEnemyBullets()
  drawEnemies();
  drawBullets();
  drawPlayer();
  drawStatus();
}

function drawStatus() {
  if(isGameClear) {
    ctx.font = "64px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`GAME CLEAR`, 30, 80);
  }
  else if (isGameOver) {
    ctx.font = "64px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`GAME OVER`, 40, 80);
  } 
}

function drawEnemies() {
  updateEnemies()
  for (const enemy of enemies) {
    ctx.beginPath();
    ctx.rect(enemy.x - enemy_sizex/2, enemy.y-enemy_sizey/2, enemy_sizex, enemy_sizey);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }
}

function updateEnemies() {
  enemies = enemies.filter(enemy => !isCollision(enemy))
  if (enemies.length === 0) isGameClear = true
}

function isCollision(enemy) {
  for (const bullet of bullets) {
    if (enemy.x - enemy_sizex/2 <= bullet.x+1 && bullet.x-1 <= enemy.x + enemy_sizex/2) {
      if (enemy.y - enemy_sizey/2 <= bullet.y+5 && bullet.y-5 <= enemy.y + enemy_sizey/2) {
        if (!bullet.used) {
          bullet.used = true
          return true
        }
      }
    }
  }
  return false
}

function StepEnemies() {
  if (isGameOver) return
  const moveDown = enemy_movecount>=enemy_movecount_max
  if (moveDown) {
    enemyMoveLeft = !enemyMoveLeft
    enemy_movecount = 0
    enemy_downcount++
    if (enemy_downcount >= enemy_downcount_max) {
      isGameOver = true
    }
  }
  const moveLeft = enemyMoveLeft
  for (const enemy of enemies) {
    if (moveLeft) {
      if (moveDown) {
        enemy.y += enemy_move_y
      }
      else enemy.x -= enemy_move_x
    } else {
      if (moveDown) {
        enemy.y += enemy_move_y
      }
      else enemy.x += enemy_move_x
    }
  }
  enemy_movecount++
}

function drawPlayer() {
  updatePlayerPos();
  isCollisionPlayer();
  if (isPlayerNon) return
  ctx.beginPath();
  ctx.rect(player_x - player_sizex/2, player_y-player_sizey/2, player_sizex, player_sizey);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function isCollisionPlayer() {
  for (const bullet of enemy_bullets) {
    if (player_x - player_sizex/2 <= bullet.x+1 && bullet.x-1 <= player_x + player_sizex/2) {
      if (player_y - player_sizey/2 <= bullet.y+5 && bullet.y-5 <= player_y + player_sizey/2) {
        isGameOver = true
        isPlayerNon = true
      }
    }
  }
}

function fire() {
  if (isGameClear || isGameOver) return
  const bullet = new Bullet(player_x, player_y-player_sizey/2);
  bullets.push(bullet);
}

function updatePlayerPos() {
  if (rightPressed) {
    player_x += player_dx
    if (player_x > player_maxx) player_x = player_maxx;
  }
  if (leftPressed) {
    player_x -= player_dx
    if (player_x < player_minx) player_x = player_minx;
  }
}

function drawBullets() {
  removeBullets();
  for (const bullet of bullets) {
    ctx.beginPath();
    ctx.rect(bullet.x - 2/2, bullet.y-10/2, 2, 10);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    bullet.y += bullet_dy;
    ctx.closePath();
  }
}

function drawEnemyBullets() {
  removeEnemyBullets()
  for (const bullet of enemy_bullets) {
    ctx.beginPath();
    ctx.rect(bullet.x - 2/2, bullet.y-10/2, 2, 10);
    ctx.fillStyle = "red";
    ctx.fill();
    bullet.y += enemy_bullet_dy;
    ctx.closePath();
  }
}

function removeBullets() {
  bullets = bullets.filter(bullet => (bullet.y > 0) && !bullet.used)
}

function removeEnemyBullets() {
  enemy_bullets = enemy_bullets.filter(bullet => (bullet.y <= canvas.height + 10))
}

function enemyFire() {
  if (isGameOver || isGameClear) return
  const r = getRandomInt(enemies.length)
  const enemy = enemies[r]
  const bullet = new EnemyBullet(enemy.x, enemy.y + enemy_sizey);
  enemy_bullets.push(bullet);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  }
  if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
  if (e.key === "Space" || e.key === " ") {
    if (!fireAlready) {
      fire();
      fireAlready = true
    }
  }
  if ((isGameOver || isGameClear) && e.key === "Enter") {
    initState()
  }
}
function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  }
  if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
  if ((e.key === "Space" || e.key === " ")) {
    fireAlready = false
  }
}

initState()
setInterval(drawCanvas, 10);
setInterval(StepEnemies, 1000);
setInterval(enemyFire, 750)

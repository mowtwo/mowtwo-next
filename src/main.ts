import './style.css';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d')!;

function updateCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

updateCanvasSize();

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

function updateMousePosition(x: number, y: number) {
  mouseX = x;
  mouseY = y;
}

canvas.addEventListener('mousemove', (e) => {
  updateMousePosition(e.clientX, e.clientY);
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  updateMousePosition(touch.clientX, touch.clientY);
});

window.addEventListener('resize', () => {
  updateCanvasSize();
  mouseX = canvas.width / 2;
  mouseY = canvas.height / 2;
});

let hue1 = Math.random() * 360;
let hue2 = Math.random() * 360;
let offset1 = Math.random() * canvas.width;
let offset2 = Math.random() * canvas.width;

const skills = [
  { label: 'JavaScript', value: 99 },
  { label: 'TypeScript', value: 99 },
  { label: 'NodeJS', value: 70 },
  { label: 'ReactJS', value: 80 },
  { label: 'Vue', value: 80 },
  { label: 'Express', value: 80 },
  { label: 'Golang', value: 60 },
  { label: 'MySQL', value: 60 },
  { label: 'CSS', value: 80 },
  { label: 'SCSS', value: 70 },
] as const

class Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  color: string

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    const angle = Math.random() * Math.PI * 2
    const speed = 5 + Math.random() * 5
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
    this.size = 8 + Math.random() * 8
    this.alpha = 1
    this.color = Math.random() > 0.5 ? '#000' : '#fff'
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.alpha -= 0.01
    this.size *= 0.98
  }

  draw() {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.strokeStyle = this.color === '#000' ? '#fff' : '#000'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()
  }
}

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

class SkillBall {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  label: string
  bounceCount: number
  maxBounces: number
  active: boolean

  constructor(x: number, y: number, skill: typeof skills[number]) {
    this.x = x
    this.y = y
    const angle = Math.random() * Math.PI * 2
    const speed = 8 + Math.random() * 5
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
    const baseSize = isMobile ? window.innerWidth / 8 : window.innerWidth / 30
    this.size = Math.min(100, baseSize) * (skill.value / 100)
    this.label = skill.label
    this.bounceCount = 0
    this.maxBounces = Math.floor(Math.random() * 3) + 8
    this.active = true
  }

  update() {
    if (!this.active) return

    this.x += this.vx
    this.y += this.vy

    // 边界碰撞检测
    if (this.x - this.size < 0) {
      this.x = this.size
      this.vx = -this.vx
      this.bounce()
    } else if (this.x + this.size > canvas.width) {
      this.x = canvas.width - this.size
      this.vx = -this.vx
      this.bounce()
    }

    if (this.y - this.size < 0) {
      this.y = this.size
      this.vy = -this.vy
      this.bounce()
    } else if (this.y + this.size > canvas.height) {
      this.y = canvas.height - this.size
      this.vy = -this.vy
      this.bounce()
    }
  }

  bounce() {
    this.bounceCount++
    if (this.bounceCount >= this.maxBounces) {
      this.active = false
    }
  }

  draw() {
    if (!this.active) return

    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = '#000'
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.font = `${this.size / 2}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.label, this.x, this.y)
  }
}

const balls: SkillBall[] = []
const particles: Particle[] = []

function createBall(x: number, y: number) {
  if (balls.length >= 100) {
    balls.shift() // 移除最早创建的小球
  }
  const skill = skills[Math.floor(Math.random() * skills.length)]
  const ball = new SkillBall(x, y, skill)
  balls.push(ball)
}

canvas.addEventListener('click', (e) => {
  createBall(e.clientX, e.clientY)
})

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  createBall(touch.clientX, touch.clientY)
})

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    if (balls.length >= 100) {
      balls.shift() // 移除最早创建的小球
    }
    const skill = skills[Math.floor(Math.random() * skills.length)]
    const ball = new SkillBall(canvas.width / 2, canvas.height / 2, skill)
    balls.push(ball)
  }
})

function createParticles(x: number, y: number) {
  for (let i = 0; i < 60; i++) {
    particles.push(new Particle(x, y))
  }
}

function animate() {
  hue1 = (hue1 + Math.random() * 0.5) % 360;
  hue2 = (hue2 + Math.random() * 0.3) % 360;
  offset1 = (offset1 + Math.random() * 2) % canvas.width;
  offset2 = (offset2 + Math.random() * 2) % canvas.width;

  // Update balls and create particles for inactive balls
  for (let i = balls.length - 1; i >= 0; i--) {
    const ball = balls[i]
    ball.update()
    if (!ball.active) {
      createParticles(ball.x, ball.y)
      balls.splice(i, 1)
    }
  }

  // Update and remove inactive particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i]
    particle.update()
    if (particle.alpha <= 0) {
      particles.splice(i, 1)
    }
  }

  const gradient1 = ctx.createLinearGradient(offset1, 0, offset1 + canvas.width, canvas.height);
  gradient1.addColorStop(0, `hsl(${hue1}, 100%, 50%)`);
  gradient1.addColorStop(1, `hsl(${hue1 + 60}, 100%, 50%)`);

  const gradient2 = ctx.createLinearGradient(offset2, canvas.height, canvas.width, offset2);
  gradient2.addColorStop(0, `hsl(${hue2}, 100%, 50%)`);
  gradient2.addColorStop(1, `hsl(${hue2 + 60}, 100%, 50%)`);

  ctx.fillStyle = gradient1;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = gradient2;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';

  // Draw all active balls
  for (const ball of balls) {
    ball.draw()
  }

  // Draw all particles
  for (const particle of particles) {
    particle.draw()
  }
  ctx.font = `bold ${Math.min(200, window.innerWidth / 4)}px Arial`;
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';

  ctx.fillStyle = '#000';
  const offsetX = (mouseX - canvas.width / 2) / 50;
  const offsetY = (mouseY - canvas.height / 2) / 50;
  const shadowOffsetX = -offsetX * 1.5;
  const shadowOffsetY = -offsetY * 1.5;

  // Draw shadow text
  ctx.save();
  ctx.filter = 'blur(10px)';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillText('M2', canvas.width / 2 + shadowOffsetX + 5, canvas.height / 2 + shadowOffsetY + 5);
  ctx.restore();

  // Draw main text
  ctx.fillStyle = '#fff';
  ctx.fillText('M2', canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);

  // Draw instruction text
  ctx.font = `${Math.min(isMobile ? 32 : 20, isMobile ? window.innerWidth / 20 : window.innerWidth / 40)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textOffsetX = (mouseX - canvas.width / 2) / 100;
  const textOffsetY = (mouseY - canvas.height / 2) / 100;
  const instructionText = isMobile ? '点击屏幕' : '点击屏幕 或 按下空格';
  const textWidth = ctx.measureText(instructionText).width;
  const padding = Math.min(isMobile ? 24 : 10, isMobile ? window.innerWidth / 40 : window.innerWidth / 80);
  const radius = Math.min(isMobile ? 48 : 20, isMobile ? window.innerWidth / 20 : window.innerWidth / 40);
  ctx.beginPath();
  ctx.roundRect(canvas.width / 2 + textOffsetX - textWidth / 2 - padding, canvas.height - 40 + textOffsetY, textWidth + padding * 2, 30, radius);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText(instructionText, canvas.width / 2 + textOffsetX, canvas.height - 25 + textOffsetY);


  requestAnimationFrame(animate);
}

animate();


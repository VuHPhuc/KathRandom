// Celebratory confetti particle engine
export class ConfettiCannon {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(count = 160) {
    this.resize();
    const colors = [
      '#f43f5e', '#ec4899', '#d946ef', '#a855f7',
      '#6366f1', '#3b82f6', '#0ea5e9', '#10b981',
      '#f59e0b', '#fbbf24', '#ffffff'
    ];

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 8 + Math.random() * 20;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
        vy: (Math.sin(angle) * speed - 6) * (0.8 + Math.random() * 0.4),
        size: 7 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 16,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.05 + Math.random() * 0.1,
        life: 1.0,
        decay: 0.005 + Math.random() * 0.008,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.loop();
    }
  }

  loop() {
    if (!this.animating) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38; // gravity
      p.vx *= 0.985; // drag
      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;
      p.life -= p.decay;

      if (p.life <= 0 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillStyle = p.color;

      const scaleX = Math.cos(p.wobble);

      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.size / 2 * scaleX, -p.size / 2, p.size * scaleX, p.size * 0.6);
      } else {
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size / 2 * Math.abs(scaleX), p.size / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Carley Interactive Moving Particle Grid & Letter "C" Animation + Background Rotator

document.addEventListener('DOMContentLoaded', () => {
  initMovingParticleCanvas();
  initBackgroundRotator();
  updateFooterYear();
});

function updateFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// 10-Second Alternating Background Image Rotator for Web/Apps section
function initBackgroundRotator() {
  const slide1 = document.querySelector('.bg-slide-1');
  const slide2 = document.querySelector('.bg-slide-2');
  if (!slide1 || !slide2) return;

  let currentSlide = 1;
  slide1.classList.add('active');

  setInterval(() => {
    if (currentSlide === 1) {
      slide1.classList.remove('active');
      slide2.classList.add('active');
      currentSlide = 2;
    } else {
      slide2.classList.remove('active');
      slide1.classList.add('active');
      currentSlide = 1;
    }
  }, 10000); // 10 seconds
}

// Dynamic Moving Particle Canvas forming Letter "C"
function initMovingParticleCanvas() {
  const canvas = document.getElementById('dotsCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  const spacing = 28;
  const baseRadius = 2.4;
  let mouse = { x: -1000, y: -1000, radius: 170 };

  function resize() {
    const parent = canvas.parentElement;
    width = canvas.width = parent.clientWidth;
    height = canvas.height = parent.clientHeight;
    createParticles();
  }

  // Check if target normalized coordinates (normX, normY) form letter "C"
  function isLetterC(normX, normY) {
    const cx = 0.5;
    const cy = 0.5;
    const dx = normX - cx;
    const dy = normY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Ring bounds for C
    const ringMatch = dist >= 0.17 && dist <= 0.32;
    // Angle gap on right (-40 to +40 degrees)
    const angle = Math.atan2(dy, dx);
    const notGap = (angle < -Math.PI / 4.2) || (angle > Math.PI / 4.2);

    return ringMatch && notGap;
  }

  function createParticles() {
    particles = [];
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const gridX = i * spacing;
        const gridY = j * spacing;

        const normX = gridX / width;
        const normY = gridY / height;

        const isC = isLetterC(normX, normY);

        // Random initial position offset for dynamic movement into target
        const randomOffsetX = (Math.random() - 0.5) * 60;
        const randomOffsetY = (Math.random() - 0.5) * 60;

        particles.push({
          targetX: gridX,
          targetY: gridY,
          x: gridX + randomOffsetX,
          y: gridY + randomOffsetY,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          isLetter: isC,
          phase: Math.random() * Math.PI * 2,
          speed: 0.02 + Math.random() * 0.02,
          glowIntensity: isC ? 0.8 : 0.15
        });
      }
    }
  }

  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  let time = 0;

  function animate() {
    ctx.clearRect(0, 0, width, height);
    time += 0.02;

    // Background radial subtle glow centered
    const bgGlow = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, Math.max(width, height) / 1.1);
    bgGlow.addColorStop(0, 'rgba(223, 183, 108, 0.05)');
    bgGlow.addColorStop(1, 'rgba(7, 7, 9, 0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);

    particles.forEach((p) => {
      // Dynamic moving oscillation towards target + wave float
      p.phase += p.speed;
      const waveX = Math.cos(p.phase + time) * (p.isLetter ? 4 : 2);
      const waveY = Math.sin(p.phase + time) * (p.isLetter ? 4 : 2);

      const targetX = p.targetX + waveX;
      const targetY = p.targetY + waveY;

      // Ease current position towards dynamic target
      p.x += (targetX - p.x) * 0.05;
      p.y += (targetY - p.y) * 0.05;

      // Mouse interactive repelling effect
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let renderX = p.x;
      let renderY = p.y;
      let scale = p.isLetter ? 1.45 : 0.95;
      let alpha = p.glowIntensity;

      if (dist < mouse.radius) {
        const force = (1 - dist / mouse.radius);
        const angle = Math.atan2(dy, dx);
        renderX -= Math.cos(angle) * force * 24;
        renderY -= Math.sin(angle) * force * 24;
        scale *= (1 + force * 1.4);
        alpha = Math.min(1, alpha + force * 0.65);
      }

      const pulse = Math.sin(p.phase) * 0.25;
      alpha += pulse * 0.15;

      ctx.beginPath();
      ctx.arc(renderX, renderY, baseRadius * scale, 0, Math.PI * 2);

      if (p.isLetter || dist < mouse.radius) {
        ctx.fillStyle = `rgba(245, 228, 181, ${Math.min(1, alpha)})`;
        ctx.shadowColor = 'rgba(223, 183, 108, 0.9)';
        ctx.shadowBlur = p.isLetter ? 12 : 16;
      } else {
        ctx.fillStyle = `rgba(223, 183, 108, ${Math.max(0.08, alpha)})`;
        ctx.shadowColor = 'rgba(223, 183, 108, 0.2)';
        ctx.shadowBlur = 3;
      }

      ctx.fill();
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(animate);
  }

  resize();
  requestAnimationFrame(animate);
}

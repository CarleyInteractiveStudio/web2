// Carley Interactive Moving Particle Grid & Background Rotator

document.addEventListener('DOMContentLoaded', () => {
  initGentleParticleCanvas();
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

// Gentle, smooth drifting background particle canvas ("poquito a poquito")
function initGentleParticleCanvas() {
  const canvas = document.getElementById('dotsCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  const spacing = 32;
  const baseRadius = 2.2;
  let mouse = { x: -1000, y: -1000, radius: 170 };

  function resize() {
    const parent = canvas.parentElement;
    width = canvas.width = parent.clientWidth;
    height = canvas.height = parent.clientHeight;
    createParticles();
  }

  function createParticles() {
    particles = [];
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const gridX = i * spacing;
        const gridY = j * spacing;

        particles.push({
          baseX: gridX,
          baseY: gridY,
          x: gridX,
          y: gridY,
          phase: Math.random() * Math.PI * 2,
          driftSpeed: 0.008 + Math.random() * 0.012, // gentle slow drift
          driftRadius: 6 + Math.random() * 8
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
    time += 0.015;

    // Background radial subtle glow
    const bgGlow = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, Math.max(width, height) / 1.1);
    bgGlow.addColorStop(0, 'rgba(223, 183, 108, 0.04)');
    bgGlow.addColorStop(1, 'rgba(7, 7, 9, 0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);

    particles.forEach((p) => {
      // Gentle smooth drifting oscillation ("poquito a poquito")
      p.phase += p.driftSpeed;
      const driftX = Math.sin(p.phase + time) * p.driftRadius;
      const driftY = Math.cos(p.phase * 0.8 + time) * p.driftRadius;

      const targetX = p.baseX + driftX;
      const targetY = p.baseY + driftY;

      p.x += (targetX - p.x) * 0.05;
      p.y += (targetY - p.y) * 0.05;

      // Mouse interactive repelling effect
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let renderX = p.x;
      let renderY = p.y;
      let scale = 1.0;
      let alpha = 0.18 + Math.sin(p.phase) * 0.08;

      if (dist < mouse.radius) {
        const force = (1 - dist / mouse.radius);
        const angle = Math.atan2(dy, dx);
        renderX -= Math.cos(angle) * force * 22;
        renderY -= Math.sin(angle) * force * 22;
        scale = 1 + force * 1.5;
        alpha = Math.min(1, alpha + force * 0.7);
      }

      ctx.beginPath();
      ctx.arc(renderX, renderY, baseRadius * scale, 0, Math.PI * 2);

      if (dist < mouse.radius) {
        ctx.fillStyle = `rgba(245, 228, 181, ${alpha})`;
        ctx.shadowColor = 'rgba(223, 183, 108, 0.9)';
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = `rgba(223, 183, 108, ${alpha})`;
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

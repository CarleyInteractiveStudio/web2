// Carley Interactive Dot Grid Canvas Animation & Interactivity

document.addEventListener('DOMContentLoaded', () => {
  initGridCanvas();
  updateFooterYear();
});

function updateFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function initGridCanvas() {
  const canvas = document.getElementById('dotsCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let dots = [];

  // Grid parameters: aligned in square grid
  const spacing = 35;
  const baseRadius = 2.4;
  let mouse = { x: -1000, y: -1000, radius: 180 };

  function resize() {
    const parent = canvas.parentElement;
    width = canvas.width = parent.clientWidth;
    height = canvas.height = parent.clientHeight;
    createDots();
  }

  function createDots() {
    dots = [];
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * spacing;
        const y = j * spacing;
        dots.push({
          baseX: x,
          baseY: y,
          x: x,
          y: y,
          pulseAngle: (i + j) * 0.4,
          glowIntensity: 0.15 + Math.random() * 0.15
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

  function animate(time) {
    ctx.clearRect(0, 0, width, height);

    // Draw background subtle radial glow
    const bgGlow = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height) / 1.2);
    bgGlow.addColorStop(0, 'rgba(212, 175, 55, 0.05)');
    bgGlow.addColorStop(1, 'rgba(7, 7, 9, 0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);

    dots.forEach((dot) => {
      const dx = mouse.x - dot.baseX;
      const dy = mouse.y - dot.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let offsetX = 0;
      let offsetY = 0;
      let scale = 1;
      let alpha = dot.glowIntensity;

      dot.pulseAngle += 0.03;
      const pulse = Math.sin(dot.pulseAngle) * 0.5 + 0.5;
      alpha += pulse * 0.15;

      if (dist < mouse.radius) {
        const force = (1 - dist / mouse.radius);
        const angle = Math.atan2(dy, dx);
        offsetX = -Math.cos(angle) * force * 25;
        offsetY = -Math.sin(angle) * force * 25;
        scale = 1 + force * 1.5;
        alpha = 0.5 + force * 0.5;
      }

      dot.x = dot.baseX + offsetX;
      dot.y = dot.baseY + offsetY;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, baseRadius * scale, 0, Math.PI * 2);

      if (dist < mouse.radius) {
        ctx.fillStyle = `rgba(247, 231, 160, ${alpha})`;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.3)';
        ctx.shadowBlur = 4;
      }

      ctx.fill();
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(animate);
  }

  resize();
  requestAnimationFrame(animate);
}

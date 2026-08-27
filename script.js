// Carley Interactive Dot Grid & Letter "C" Animation

document.addEventListener('DOMContentLoaded', () => {
  initGridCanvas();
  updateFooterYear();
  setupNavChips();
});

function updateFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function setupNavChips() {
  const chips = document.querySelectorAll('.nav-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const targetId = chip.getAttribute('data-target');
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

function initGridCanvas() {
  const canvas = document.getElementById('dotsCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let dots = [];

  const spacing = 32;
  const baseRadius = 2.2;
  let mouse = { x: -1000, y: -1000, radius: 160 };

  function resize() {
    const parent = canvas.parentElement;
    width = canvas.width = parent.clientWidth;
    height = canvas.height = parent.clientHeight;
    createDots();
  }

  // Check if a point (x, y) forms part of a large letter "C" outline
  function isLetterC(normX, normY) {
    // Canvas normalized coordinates relative to center (0 to 1)
    // Center of "C" is around (0.5, 0.5), radius ~0.25 to 0.35
    const cx = 0.5;
    const cy = 0.5;
    const dx = normX - cx;
    const dy = normY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Inner radius 0.20, outer radius 0.32
    const ringMatch = dist >= 0.18 && dist <= 0.32;
    // Open gap on the right side (angle between -35 deg and +35 deg)
    const angle = Math.atan2(dy, dx);
    const notGap = (angle < -Math.PI / 4) || (angle > Math.PI / 4);

    return ringMatch && notGap;
  }

  function createDots() {
    dots = [];
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * spacing;
        const y = j * spacing;

        const normX = x / width;
        const normY = y / height;

        const isC = isLetterC(normX, normY);

        dots.push({
          baseX: x,
          baseY: y,
          x: x,
          y: y,
          isLetter: isC,
          pulseAngle: (i + j) * 0.3,
          glowIntensity: isC ? 0.75 : 0.12
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

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Subtle background vignette
    const bgGlow = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, Math.max(width, height) / 1.1);
    bgGlow.addColorStop(0, 'rgba(223, 183, 108, 0.04)');
    bgGlow.addColorStop(1, 'rgba(7, 7, 9, 0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);

    dots.forEach((dot) => {
      const dx = mouse.x - dot.baseX;
      const dy = mouse.y - dot.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let offsetX = 0;
      let offsetY = 0;
      let scale = dot.isLetter ? 1.4 : 1.0;
      let alpha = dot.glowIntensity;

      dot.pulseAngle += 0.025;
      const pulse = Math.sin(dot.pulseAngle) * 0.5 + 0.5;

      if (dot.isLetter) {
        alpha += pulse * 0.25;
      } else {
        alpha += pulse * 0.08;
      }

      if (dist < mouse.radius) {
        const force = (1 - dist / mouse.radius);
        const angle = Math.atan2(dy, dx);
        offsetX = -Math.cos(angle) * force * 20;
        offsetY = -Math.sin(angle) * force * 20;
        scale = scale * (1 + force * 1.3);
        alpha = Math.min(1, alpha + force * 0.6);
      }

      dot.x = dot.baseX + offsetX;
      dot.y = dot.baseY + offsetY;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, baseRadius * scale, 0, Math.PI * 2);

      if (dot.isLetter || dist < mouse.radius) {
        ctx.fillStyle = `rgba(245, 228, 181, ${alpha})`;
        ctx.shadowColor = 'rgba(223, 183, 108, 0.9)';
        ctx.shadowBlur = dot.isLetter ? 10 : 14;
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

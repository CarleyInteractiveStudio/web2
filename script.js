// Carley Interactive Moving Particle Grid & Background Rotator

document.addEventListener('DOMContentLoaded', () => {
  initGentleParticleCanvas();
  initBackgroundRotator();
  initPaperAirplane3DScene();
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

  // Shooting stars array (falling from upper-right to lower-left with glowing tail)
  let shootingStars = [];

  function spawnShootingStar() {
    if (shootingStars.length < 5 && Math.random() < 0.04) {
      shootingStars.push({
        x: Math.random() * width * 1.2,
        y: Math.random() * (height * 0.4) - 50,
        length: 80 + Math.random() * 100,
        speed: 12 + Math.random() * 10,
        angle: Math.PI * 0.75 + (Math.random() - 0.5) * 0.1, // falling from right to left
        alpha: 1,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        radius: 2 + Math.random() * 1.5
      });
    }
  }

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

    // Update and draw shooting stars (estrellas fugaces)
    spawnShootingStar();
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const star = shootingStars[i];
      star.life++;
      star.x += Math.cos(star.angle) * star.speed;
      star.y += Math.sin(star.angle) * star.speed;
      star.alpha = Math.max(0, 1 - (star.life / star.maxLife));

      const tailX = star.x - Math.cos(star.angle) * star.length;
      const tailY = star.y - Math.sin(star.angle) * star.length;

      const grad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 235, 180, ${star.alpha})`);
      grad.addColorStop(0.3, `rgba(223, 183, 108, ${star.alpha * 0.6})`);
      grad.addColorStop(1, `rgba(223, 183, 108, 0)`);

      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = star.radius;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glowing head spark
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.shadowColor = '#dfb76c';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (star.life >= star.maxLife || star.x < -100 || star.y > height + 100) {
        shootingStars.splice(i, 1);
      }
    }

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


// 3D Paper Airplane + 4D Room Day/Night Cycle Scene with Three.js
function initPaperAirplane3DScene() {
  const container = document.getElementById('paperAirplane3dContainer');
  if (!container || typeof THREE === 'undefined') return;

  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070709);

  // Camera setup
  const width = container.clientWidth;
  const height = container.clientHeight || 480;
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 8, 22);
  camera.lookAt(0, 0, 0);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Ambient Light (subtle)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambientLight);

  // Sun/Moon Light (Day/Night cycle light)
  const sunLight = new THREE.DirectionalLight(0xffdf9e, 1.8);
  sunLight.position.set(10, 20, 10);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  scene.add(sunLight);

  // Window Light Glow helper
  const windowLightGlow = new THREE.PointLight(0xdfb76c, 1.2, 30);
  windowLightGlow.position.set(-14, 4, -8);
  scene.add(windowLightGlow);

  // Build Room Scene with Window
  const roomGroup = new THREE.Group();

  // Floor
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x16161f, roughness: 0.6, metalness: 0.2 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(32, 0.4, 24), floorMat);
  floor.position.y = -6;
  floor.receiveShadow = true;
  roomGroup.add(floor);

  // Back Wall with Window opening effect
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x0e0e15, roughness: 0.8 });
  const backWallLeft = new THREE.Mesh(new THREE.BoxGeometry(12, 16, 0.4), wallMat);
  backWallLeft.position.set(-10, 2, -12);
  backWallLeft.receiveShadow = true;
  roomGroup.add(backWallLeft);

  const backWallRight = new THREE.Mesh(new THREE.BoxGeometry(12, 16, 0.4), wallMat);
  backWallRight.position.set(10, 2, -12);
  backWallRight.receiveShadow = true;
  roomGroup.add(backWallRight);

  const backWallTop = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 0.4), wallMat);
  backWallTop.position.set(0, 7.5, -12);
  roomGroup.add(backWallTop);

  const backWallBottom = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.4), wallMat);
  backWallBottom.position.set(0, -4, -12);
  roomGroup.add(backWallBottom);

  // Window Frame (Golden frame around back window)
  const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0xdfb76c, metalness: 0.8, roughness: 0.3 });
  const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(7.6, 7.2, 0.6), windowFrameMat);
  windowFrame.position.set(0, 1.6, -11.9);
  roomGroup.add(windowFrame);

  // Window Glass
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    transmission: 0.9
  });
  const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 6.8), glassMat);
  windowGlass.position.set(0, 1.6, -11.5);
  roomGroup.add(windowGlass);

  // Side Wall Left
  const sideWallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 16, 24), wallMat);
  sideWallLeft.position.set(-16, 2, 0);
  sideWallLeft.receiveShadow = true;
  roomGroup.add(sideWallLeft);

  scene.add(roomGroup);

  // Paper Airplane Model Setup
  let paperAirplane = null;
  const airplaneGroup = new THREE.Group();
  scene.add(airplaneGroup);

  // Load OBJ Paper Airplane Model
  if (typeof THREE.OBJLoader !== 'undefined') {
    const loader = new THREE.OBJLoader();
    loader.load('assets/paper_airplane.obj', (obj) => {
      const goldAirplaneMat = new THREE.MeshStandardMaterial({
        color: 0xffe89e,
        metalness: 0.7,
        roughness: 0.2,
        emissive: 0x44300e,
        side: THREE.DoubleSide
      });

      obj.traverse((child) => {
        if (child.isMesh) {
          child.material = goldAirplaneMat;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Center and scale model
      obj.scale.set(60, 60, 60);
      obj.rotation.y = Math.PI;
      paperAirplane = obj;
      airplaneGroup.add(paperAirplane);
    }, undefined, (err) => {
      console.warn('Could not load OBJ paper airplane, creating fallback geometry', err);
      createFallbackAirplane();
    });
  } else {
    createFallbackAirplane();
  }

  function createFallbackAirplane() {
    const shape = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0, 2,   -1.5, 0, -2,   0, 0.5, -1.5,
      0, 0, 2,   0, 0.5, -1.5,   1.5, 0, -2,
      0, 0, 2,   0, -0.6, -1.5,  -1.5, 0, -2,
      0, 0, 2,   1.5, 0, -2,     0, -0.6, -1.5
    ]);
    shape.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    shape.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({ color: 0xdfb76c, metalness: 0.8, roughness: 0.2, side: THREE.DoubleSide });
    paperAirplane = new THREE.Mesh(shape, mat);
    paperAirplane.scale.set(1.5, 1.5, 1.5);
    airplaneGroup.add(paperAirplane);
  }

  // Airplane Motion variables
  let angle = 0;
  const orbitRadius = 6.5;
  let customTarget = null;
  let isSeekingCustom = false;
  let seekProgress = 0;
  let startPos = new THREE.Vector3();
  let targetPos = new THREE.Vector3();

  // Handle Raycasting click to steer airplane
  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();

  container.addEventListener('click', (e) => {
    const rect = container.getBoundingClientRect();
    mouseVec.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouseVec.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouseVec, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const clickPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, clickPoint);

    if (clickPoint) {
      // Clamp target within scene view
      clickPoint.x = Math.max(-10, Math.min(10, clickPoint.x));
      clickPoint.y = Math.max(-2, Math.min(6, clickPoint.y));
      clickPoint.z = Math.max(-4, Math.min(6, clickPoint.z));

      startPos.copy(airplaneGroup.position);
      targetPos.copy(clickPoint);
      isSeekingCustom = true;
      seekProgress = 0;
    }
  });

  // Animation Loop for 4D Day/Night Cycle & Airplane Orbit
  let dayTime = 0;

  function animate3D() {
    requestAnimationFrame(animate3D);

    // 4D Day/Night lighting cycle
    dayTime += 0.006;
    const sunX = Math.cos(dayTime) * 18;
    const sunY = Math.sin(dayTime) * 16 + 4;
    const sunZ = Math.sin(dayTime * 0.7) * 12;

    sunLight.position.set(sunX, sunY, sunZ);

    // Dynamic sky/light color tinting
    const isDay = sunY > 0;
    const lightIntensity = Math.max(0.15, Math.sin(dayTime) * 1.8);
    sunLight.intensity = lightIntensity;

    if (isDay) {
      sunLight.color.setHSL(0.1, 0.8, 0.6); // Warm golden daytime
      windowLightGlow.color.setHSL(0.1, 0.9, 0.6);
      scene.background.setHex(0x0a0b10);
    } else {
      sunLight.color.setHSL(0.65, 0.6, 0.3); // Deep night blue
      windowLightGlow.color.setHSL(0.12, 0.9, 0.4);
      scene.background.setHex(0x040407);
    }

    // Airplane trajectory update
    if (isSeekingCustom) {
      seekProgress += 0.02;
      airplaneGroup.position.lerpVectors(startPos, targetPos, seekProgress);

      // Point towards target direction
      const dir = new THREE.Vector3().subVectors(targetPos, startPos).normalize();
      if (dir.length() > 0.001) {
        const targetRotY = Math.atan2(dir.x, dir.z);
        airplaneGroup.rotation.y += (targetRotY - airplaneGroup.rotation.y) * 0.1;
        airplaneGroup.rotation.z = -dir.x * 0.4;
        airplaneGroup.rotation.x = dir.y * 0.4;
      }

      if (seekProgress >= 1) {
        isSeekingCustom = false;
        // Resume circle angle from current position
        angle = Math.atan2(airplaneGroup.position.z, airplaneGroup.position.x);
      }
    } else {
      // Smooth orbital flight pattern
      angle += 0.018;
      const nextX = Math.cos(angle) * orbitRadius;
      const nextZ = Math.sin(angle) * orbitRadius;
      const nextY = Math.sin(angle * 2) * 1.2 + 1.5;

      const currentPos = airplaneGroup.position.clone();
      const nextPos = new THREE.Vector3(nextX, nextY, nextZ);

      airplaneGroup.position.copy(nextPos);

      // Calculate smooth banking / heading rotation
      const moveDir = new THREE.Vector3().subVectors(nextPos, currentPos).normalize();
      const targetHeading = Math.atan2(moveDir.x, moveDir.z);

      airplaneGroup.rotation.y += (targetHeading - airplaneGroup.rotation.y) * 0.15;
      airplaneGroup.rotation.z = -Math.sin(angle) * 0.35; // Bank wings into turns
      airplaneGroup.rotation.x = Math.cos(angle * 2) * 0.15;
    }

    // Gentle airplane self-propeller / floating roll oscillation
    if (paperAirplane) {
      paperAirplane.rotation.z = Math.sin(angle * 3) * 0.08;
    }

    renderer.render(scene, camera);
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight || 480;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });

  animate3D();
}

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
  scene.background = new THREE.Color(0x050508);

  // Camera setup
  let width = container.clientWidth;
  let height = container.clientHeight || 520;
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 3.5, 20);
  camera.lookAt(0, 1.5, 0);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Fixed warm golden directional lighting (Static architectural lighting)
  const sunLight = new THREE.DirectionalLight(0xffdf9e, 1.8);
  sunLight.position.set(12, 18, 10);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  scene.add(sunLight);

  // Additional fill light for wall logo & room elegance
  const fillLight = new THREE.DirectionalLight(0xdfb76c, 1.2);
  fillLight.position.set(-10, 10, 12);
  scene.add(fillLight);

  // Window Glow Light
  const windowLightGlow = new THREE.PointLight(0xdfb76c, 1.5, 35);
  windowLightGlow.position.set(0, 2, -11);
  scene.add(windowLightGlow);

  // Sky Backdrop Plane (Static golden sky visible through window)
  const skyMat = new THREE.MeshBasicMaterial({ color: 0xdfb76c, side: THREE.DoubleSide });
  const skyPlane = new THREE.Mesh(new THREE.PlaneGeometry(24, 16), skyMat);
  skyPlane.position.set(0, 3, -13.5);
  scene.add(skyPlane);

  // Room Architecture
  const roomGroup = new THREE.Group();

  // Floor
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x12121a, roughness: 0.5, metalness: 0.3 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(36, 0.4, 28), floorMat);
  floor.position.y = -6;
  floor.receiveShadow = true;
  roomGroup.add(floor);

  // Back Wall with Architectural Window Opening
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x09090e, roughness: 0.8 });
  const backWallLeft = new THREE.Mesh(new THREE.BoxGeometry(13, 16, 0.4), wallMat);
  backWallLeft.position.set(-11.5, 2, -12);
  backWallLeft.receiveShadow = true;
  roomGroup.add(backWallLeft);

  const backWallRight = new THREE.Mesh(new THREE.BoxGeometry(13, 16, 0.4), wallMat);
  backWallRight.position.set(11.5, 2, -12);
  backWallRight.receiveShadow = true;
  roomGroup.add(backWallRight);

  const backWallTop = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.4), wallMat);
  backWallTop.position.set(0, 7.5, -12);
  roomGroup.add(backWallTop);

  const backWallBottom = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 0.4), wallMat);
  backWallBottom.position.set(0, -4, -12);
  roomGroup.add(backWallBottom);

  // Golden Architectural Window Frame with Mullions / Crossbars
  const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0xdfb76c, metalness: 0.85, roughness: 0.2 });
  const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(10.2, 7.2, 0.5), windowFrameMat);
  outerFrame.position.set(0, 1.75, -11.9);
  roomGroup.add(outerFrame);

  // Center Vertical Mullion
  const vMullion = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6.8, 0.3), windowFrameMat);
  vMullion.position.set(0, 1.75, -11.7);
  roomGroup.add(vMullion);

  // Center Horizontal Mullion
  const hMullion = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.3, 0.3), windowFrameMat);
  hMullion.position.set(0, 1.75, -11.7);
  roomGroup.add(hMullion);

  // High-Quality Translucent Physical Glass
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xaad8ff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.9,
    reflectivity: 0.8
  });
  const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 6.8), glassMat);
  windowGlass.position.set(0, 1.75, -11.6);
  roomGroup.add(windowGlass);

  // Load Carley GLB Logo on the wall
  if (typeof THREE.GLTFLoader !== 'undefined') {
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('assets/carley.glb', (gltf) => {
      const logoModel = gltf.scene;

      // Calculate bounding box to center and scale appropriately
      const bbox = new THREE.Box3().setFromObject(logoModel);
      const size = bbox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = 6.2 / (maxDim || 1);

      logoModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Mount logo on top right back wall away from window
      logoModel.position.set(9.6, 3.5, -11.6);

      logoModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      roomGroup.add(logoModel);
    }, undefined, (err) => {
      console.warn('Could not load assets/carley.glb:', err);
    });
  }

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
        metalness: 0.8,
        roughness: 0.15,
        emissive: 0x3d2b09,
        side: THREE.DoubleSide
      });

      obj.traverse((child) => {
        if (child.isMesh) {
          child.material = goldAirplaneMat;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Scale model
      obj.scale.set(65, 65, 65);
      obj.rotation.y = Math.PI;
      paperAirplane = obj;
      airplaneGroup.add(paperAirplane);
    }, undefined, (err) => {
      console.warn('Could not load OBJ paper airplane, using fallback geometry', err);
      createFallbackAirplane();
    });
  } else {
    createFallbackAirplane();
  }

  function createFallbackAirplane() {
    const shape = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0, 2.2,   -1.6, 0, -2,   0, 0.6, -1.5,
      0, 0, 2.2,   0, 0.6, -1.5,   1.6, 0, -2,
      0, 0, 2.2,   0, -0.6, -1.5,  -1.6, 0, -2,
      0, 0, 2.2,   1.6, 0, -2,     0, -0.6, -1.5
    ]);
    shape.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    shape.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({ color: 0xdfb76c, metalness: 0.85, roughness: 0.15, side: THREE.DoubleSide });
    paperAirplane = new THREE.Mesh(shape, mat);
    paperAirplane.scale.set(1.6, 1.6, 1.6);
    airplaneGroup.add(paperAirplane);
  }

  // Wingtip Airflow / Vortex Trails (Flujos de aire en ambas puntas de las alas)
  const maxTrailPoints = 35;
  const leftTrailHistory = [];
  const rightTrailHistory = [];

  // Glowing golden airflow line materials for left and right wingtips
  const trailMatLeft = new THREE.LineBasicMaterial({
    color: 0xffea9f,
    transparent: true,
    opacity: 0.85
  });
  const trailMatRight = new THREE.LineBasicMaterial({
    color: 0xffea9f,
    transparent: true,
    opacity: 0.85
  });

  const leftTrailGeo = new THREE.BufferGeometry();
  const leftPositionsArray = new Float32Array(maxTrailPoints * 3);
  leftTrailGeo.setAttribute('position', new THREE.BufferAttribute(leftPositionsArray, 3));
  const leftTrailLine = new THREE.Line(leftTrailGeo, trailMatLeft);
  scene.add(leftTrailLine);

  const rightTrailGeo = new THREE.BufferGeometry();
  const rightPositionsArray = new Float32Array(maxTrailPoints * 3);
  rightTrailGeo.setAttribute('position', new THREE.BufferAttribute(rightPositionsArray, 3));
  const rightTrailLine = new THREE.Line(rightTrailGeo, trailMatRight);
  scene.add(rightTrailLine);

  // Airflow Particles for aerodynamic vortex effect
  const airflowParticlesGroup = new THREE.Group();
  scene.add(airflowParticlesGroup);

  const airflowParticles = [];
  const particleMat = new THREE.MeshBasicMaterial({
    color: 0xdfb76c,
    transparent: true,
    opacity: 0.7
  });
  const particleGeo = new THREE.SphereGeometry(0.06, 6, 6);

  function spawnAirflowParticle(pos) {
    if (airflowParticles.length > 50) return;
    const mesh = new THREE.Mesh(particleGeo, particleMat.clone());
    mesh.position.copy(pos);
    mesh.position.x += (Math.random() - 0.5) * 0.1;
    mesh.position.y += (Math.random() - 0.5) * 0.1;
    mesh.position.z += (Math.random() - 0.5) * 0.1;
    mesh.userData = { life: 0, maxLife: 30 + Math.random() * 20 };
    airflowParticlesGroup.add(mesh);
    airflowParticles.push(mesh);
  }

  // Real Aerodynamic Flight Physics Variables
  let flightTime = 0;

  // Function to evaluate smooth continuous circular 3D trajectory path ("girar en redondo con inclinación")
  function getAirplanePath(t) {
    const angle = t * 0.75;
    const radiusX = 10.5;
    const radiusZ = 6.8;

    // Continuous circular orbit around room center
    const x = Math.cos(angle) * radiusX;
    const z = Math.sin(angle) * radiusZ;
    const y = Math.sin(angle * 2.0) * 0.9 + 2.0; // gentle elevation wave
    return new THREE.Vector3(x, y, z);
  }

  // Animation Loop & Realistic Circular Flight Curves
  let currentQuat = new THREE.Quaternion();

  function animate3D() {
    requestAnimationFrame(animate3D);

    // Aerodynamic Flight Physics Update
    flightTime += 0.012;

    const pos = getAirplanePath(flightTime);
    const futurePos = getAirplanePath(flightTime + 0.04);

    // Update 3D position
    airplaneGroup.position.copy(pos);

    // Velocity vector points forward along trajectory
    const vel = new THREE.Vector3().subVectors(futurePos, pos);

    const speed = vel.length();
    if (speed > 0.0001) {
      const dir = vel.clone().normalize();

      // Yaw (heading direction angle around Y axis)
      const yaw = Math.atan2(dir.x, dir.z);

      // Pitch (climb/dive angle)
      const pitch = Math.atan2(dir.y, Math.sqrt(dir.x * dir.x + dir.z * dir.z));

      // Continuous inward banking tilt for circular flight curve ("se inclina al girar en redondo")
      const bankRoll = 0.45;

      // Construct aerodynamic target rotation Euler (YXZ order)
      const targetEuler = new THREE.Euler(pitch, yaw, bankRoll, 'YXZ');
      const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler);

      // Smooth quaternion interpolation to avoid snap
      currentQuat.slerp(targetQuat, 0.1);
      airplaneGroup.quaternion.copy(currentQuat);
    }

    // Wingtip Airflow / Vortex Trail Updates
    const leftTipLocal = new THREE.Vector3(-1.35, 0.05, -0.3);
    const rightTipLocal = new THREE.Vector3(1.35, 0.05, -0.3);

    const leftTipWorld = leftTipLocal.applyMatrix4(airplaneGroup.matrixWorld);
    const rightTipWorld = rightTipLocal.applyMatrix4(airplaneGroup.matrixWorld);

    // Update trail history
    leftTrailHistory.unshift(leftTipWorld.clone());
    rightTrailHistory.unshift(rightTipWorld.clone());

    if (leftTrailHistory.length > maxTrailPoints) leftTrailHistory.pop();
    if (rightTrailHistory.length > maxTrailPoints) rightTrailHistory.pop();

    // Update left wingtip trail line geometry
    const leftPositions = leftTrailGeo.attributes.position.array;
    for (let i = 0; i < maxTrailPoints; i++) {
      const pt = leftTrailHistory[i] || leftTipWorld;
      leftPositions[i * 3] = pt.x;
      leftPositions[i * 3 + 1] = pt.y;
      leftPositions[i * 3 + 2] = pt.z;
    }
    leftTrailGeo.attributes.position.needsUpdate = true;
    leftTrailGeo.setDrawRange(0, leftTrailHistory.length);

    // Update right wingtip trail line geometry
    const rightPositions = rightTrailGeo.attributes.position.array;
    for (let i = 0; i < maxTrailPoints; i++) {
      const pt = rightTrailHistory[i] || rightTipWorld;
      rightPositions[i * 3] = pt.x;
      rightPositions[i * 3 + 1] = pt.y;
      rightPositions[i * 3 + 2] = pt.z;
    }
    rightTrailGeo.attributes.position.needsUpdate = true;
    rightTrailGeo.setDrawRange(0, rightTrailHistory.length);

    // Spawn & update airflow vortex particles
    if (Math.random() < 0.6) {
      spawnAirflowParticle(leftTipWorld);
      spawnAirflowParticle(rightTipWorld);
    }

    for (let i = airflowParticles.length - 1; i >= 0; i--) {
      const p = airflowParticles[i];
      p.userData.life++;
      const lifeRatio = p.userData.life / p.userData.maxLife;

      p.material.opacity = (1 - lifeRatio) * 0.75;
      p.scale.setScalar((1 - lifeRatio * 0.5) * 1.0);

      if (p.userData.life >= p.userData.maxLife) {
        airflowParticlesGroup.remove(p);
        p.geometry.dispose();
        p.material.dispose();
        airflowParticles.splice(i, 1);
      }
    }

    renderer.render(scene, camera);
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    width = container.clientWidth;
    height = container.clientHeight || 520;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  animate3D();
}

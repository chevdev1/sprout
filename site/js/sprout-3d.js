import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

(function initHeroSprout3D() {
  var container = document.getElementById('heroSprout');
  var canvas = document.getElementById('heroSproutCanvas');
  var loaderEl = document.getElementById('heroSproutLoader');
  if (!container || !canvas) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobileView = window.matchMedia('(max-width: 860px), (hover: none)').matches;
  var heroVisible = true;
  var modelReady = false;
  var modelMesh = null;
  var basePositions = null;
  var vertexWeights = null;
  var bounds = null;
  var pivots = null;
  var normalFrame = 0;
  var time = 0;

  var drag = {
    active: false,
    pointerId: null,
    zone: 'stem',
    startX: 0,
    startY: 0,
    startSpinY: 0
  };

  var bend = {
    stem:  { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0 },
    left:  { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0 },
    right: { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0 }
  };

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: !isMobileView,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileView ? 1.25 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.52;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(34, 1, 0.05, 50);

  scene.add(new THREE.HemisphereLight(0xf6ffd8, 0x3a4828, 0.68));
  scene.add(new THREE.AmbientLight(0xffffff, 0.94));
  var keyLight = new THREE.DirectionalLight(0xfff9ee, 0.92);
  keyLight.position.set(1.6, 3.4, 3.2);
  scene.add(keyLight);
  var fillLight = new THREE.DirectionalLight(0xf0ffd0, 0.82);
  fillLight.position.set(-2.4, 1.2, 2.8);
  scene.add(fillLight);
  var frontLight = new THREE.DirectionalLight(0xffffff, 0.48);
  frontLight.position.set(0, 0.6, 4.2);
  scene.add(frontLight);

  var plantRoot = new THREE.Group();
  var plantSpin = new THREE.Group();
  var plantTilt = new THREE.Group();
  plantTilt.add(plantSpin);
  plantRoot.add(plantTilt);
  scene.add(plantRoot);

  var spinY = 0;
  var spinTargetY = 0;

  // Whole-element parallax: a few degrees of tilt toward the cursor,
  // independent of the constant idle rotation and of the drag-to-bend
  // interaction (those live on plantSpin/the deform weights — this only
  // ever touches plantTilt, so nothing fights for the same property).
  var tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  var pointerInsideHero = false;

  function onHeroPointerMove(event) {
    var rect = container.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var nx = clamp((event.clientX - cx) / (rect.width * 0.5), -1, 1);
    var ny = clamp((event.clientY - cy) / (rect.height * 0.5), -1, 1);
    var MAX_TILT = isMobileView ? 0.14 : 0.18;
    tilt.ty = nx * MAX_TILT;
    tilt.tx = ny * -MAX_TILT;
    pointerInsideHero = true;
  }
  function resetHeroTilt() {
    pointerInsideHero = false;
    tilt.tx = 0;
    tilt.ty = 0;
  }
  var heroSection = container.closest('.hero');
  if (heroSection) {
    heroSection.addEventListener('pointermove', onHeroPointerMove);
    heroSection.addEventListener('pointerleave', resetHeroTilt);
  }
  container.addEventListener('pointermove', onHeroPointerMove);
  container.addEventListener('pointerleave', resetHeroTilt);

  var raycaster = new THREE.Raycaster();
  var pointer = new THREE.Vector2();
  var tmpVec = new THREE.Vector3();
  var tmpEuler = new THREE.Euler();
  var tmpMat = new THREE.Matrix4();
  var hitLocal = new THREE.Vector3();
  var fitBox = new THREE.Box3();
  var fitSize = new THREE.Vector3();
  var fitCenter = new THREE.Vector3();

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function smoothstep(edge0, edge1, x) {
    var t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function setPointer(event) {
    var rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function zoneForPoint(x, y) {
    var yNorm = (y - bounds.minY) / bounds.sizeY;
    if (yNorm < 0.36) return 'stem';
    if (x < bounds.minX + bounds.sizeX * 0.47) return 'left';
    if (x > bounds.minX + bounds.sizeX * 0.53) return 'right';
    return yNorm < 0.52 ? 'stem' : (x < bounds.midX ? 'left' : 'right');
  }

  function computeVertexWeights(geometry) {
    geometry.computeBoundingBox();
    var bb = geometry.boundingBox;
    bounds = {
      minX: bb.min.x, minY: bb.min.y,
      sizeX: bb.max.x - bb.min.x,
      sizeY: bb.max.y - bb.min.y,
      midX: (bb.min.x + bb.max.x) * 0.5,
      midZ: (bb.min.z + bb.max.z) * 0.5
    };

    pivots = {
      stem: new THREE.Vector3(bounds.midX, bounds.minY, bounds.midZ),
      left: new THREE.Vector3(bounds.minX + bounds.sizeX * 0.36, bounds.minY + bounds.sizeY * 0.34, bounds.midZ),
      right: new THREE.Vector3(bounds.minX + bounds.sizeX * 0.64, bounds.minY + bounds.sizeY * 0.34, bounds.midZ)
    };

    var pos = geometry.attributes.position;
    var count = pos.count;
    var weights = new Float32Array(count * 3);

    for (var i = 0; i < count; i++) {
      var x = pos.getX(i);
      var y = pos.getY(i);
      var yNorm = (y - bounds.minY) / bounds.sizeY;
      var xNorm = (x - bounds.minX) / bounds.sizeX;

      var stemW = smoothstep(0.5, 0.2, yNorm);
      var leftW = smoothstep(0.28, 0.4, yNorm) * smoothstep(0.56, 0.36, xNorm);
      var rightW = smoothstep(0.28, 0.4, yNorm) * smoothstep(0.44, 0.64, xNorm);

      var total = stemW + leftW + rightW;
      if (total > 0.0001) { stemW /= total; leftW /= total; rightW /= total; }
      else { stemW = 1; }

      weights[i * 3] = stemW;
      weights[i * 3 + 1] = leftW;
      weights[i * 3 + 2] = rightW;
    }
    return weights;
  }

  function rotateAround(px, py, pz, pivot, rot, amount) {
    if (amount < 0.0001) return { x: px, y: py, z: pz };
    tmpVec.set(px - pivot.x, py - pivot.y, pz - pivot.z);
    tmpEuler.set(rot.x * amount, rot.y * amount, rot.z * amount);
    tmpMat.makeRotationFromEuler(tmpEuler);
    tmpVec.applyMatrix4(tmpMat);
    return { x: pivot.x + tmpVec.x, y: pivot.y + tmpVec.y, z: pivot.z + tmpVec.z };
  }

  function applyDeformation() {
    if (!modelMesh || !basePositions || !vertexWeights) return;
    var pos = modelMesh.geometry.attributes.position;
    var count = pos.count;

    for (var i = 0; i < count; i++) {
      var bx = basePositions[i * 3];
      var by = basePositions[i * 3 + 1];
      var bz = basePositions[i * 3 + 2];
      var wStem = vertexWeights[i * 3];
      var wLeft = vertexWeights[i * 3 + 1];
      var wRight = vertexWeights[i * 3 + 2];

      var p = { x: bx, y: by, z: bz };

      if (wStem > 0.0001) {
        var ps = rotateAround(bx, by, bz, pivots.stem, bend.stem, 1);
        p.x = lerp(bx, ps.x, wStem);
        p.y = lerp(by, ps.y, wStem);
        p.z = lerp(bz, ps.z, wStem);
      }
      if (wLeft > 0.0001) {
        var pl = rotateAround(p.x, p.y, p.z, pivots.left, bend.left, wLeft);
        p.x = lerp(p.x, pl.x, wLeft);
        p.y = lerp(p.y, pl.y, wLeft);
        p.z = lerp(p.z, pl.z, wLeft);
      }
      if (wRight > 0.0001) {
        var pr = rotateAround(p.x, p.y, p.z, pivots.right, bend.right, wRight);
        p.x = lerp(p.x, pr.x, wRight);
        p.y = lerp(p.y, pr.y, wRight);
        p.z = lerp(p.z, pr.z, wRight);
      }
      pos.setXYZ(i, p.x, p.y, p.z);
    }
    pos.needsUpdate = true;
    normalFrame += 1;
  }

  function getHit(event) {
    if (!modelMesh) return null;
    setPointer(event);
    raycaster.setFromCamera(pointer, camera);
    var hits = raycaster.intersectObject(modelMesh, false);
    if (!hits.length) return null;
    var hit = hits[0];
    hitLocal.copy(hit.point);
    modelMesh.worldToLocal(hitLocal);
    return { hit: hit, zone: zoneForPoint(hitLocal.x, hitLocal.y) };
  }

  function setBendTargets(zone, dx, dy) {
    var dragScale = isMobileView ? 0.9 : 1;
    if (zone === 'stem') {
      spinTargetY = drag.startSpinY + dx * 0.012 * dragScale;
      bend.stem.tx = clamp(dy * -0.009, -0.24, 0.24);
      bend.stem.ty = clamp(dx * 0.004, -0.12, 0.12);
      return;
    }
    if (zone === 'left') {
      bend.left.tz = clamp(dx * 0.028 * dragScale, -0.62, 0.62);
      bend.left.tx = clamp(dy * -0.022, -0.45, 0.45);
      bend.left.ty = clamp(dx * 0.007, -0.18, 0.18);
      return;
    }
    bend.right.tz = clamp(dx * -0.028 * dragScale, -0.62, 0.62);
    bend.right.tx = clamp(dy * -0.022, -0.45, 0.45);
    bend.right.ty = clamp(dx * -0.007, -0.18, 0.18);
  }

  function setReachBendTowardPointer(result) {
    var reach = isMobileView ? 1.05 : 1.25;
    var pullX = bounds ? clamp(hitLocal.x / (bounds.sizeX * 0.48), -1, 1) : pointer.x;
    var pullY = bounds ? clamp((hitLocal.y - bounds.minY) / bounds.sizeY, 0, 1) : 0.5;

    if (result.zone === 'stem') {
      bend.stem.ty = pointer.x * 0.22 * reach;
      bend.stem.tx = pointer.y * -0.15 * reach;
      bend.stem.tz = pointer.x * 0.05 * reach;
      return;
    }
    if (result.zone === 'left') {
      bend.left.tz = (pointer.x * 0.26 + pullX * 0.28) * reach;
      bend.left.tx = pointer.y * -0.18 * reach;
      bend.left.ty = (pointer.x * 0.12 + pullY * 0.08) * reach;
      return;
    }
    bend.right.tz = (pointer.x * -0.26 + pullX * 0.28) * reach;
    bend.right.tx = pointer.y * -0.18 * reach;
    bend.right.ty = (pointer.x * -0.12 - pullY * 0.08) * reach;
  }

  function setAmbientReachTowardPointer() {
    var reach = isMobileView ? 0.75 : 1;
    bend.stem.ty = pointer.x * 0.12 * reach;
    bend.stem.tx = pointer.y * -0.08 * reach;
    bend.stem.tz = 0;
    bend.left.tz = pointer.x * 0.1 * reach;
    bend.left.tx = 0;
    bend.left.ty = 0;
    bend.right.tz = pointer.x * -0.1 * reach;
    bend.right.tx = 0;
    bend.right.ty = 0;
  }

  function hasActiveTargets() {
    return Math.abs(bend.stem.tx) + Math.abs(bend.stem.ty) + Math.abs(bend.stem.tz) +
      Math.abs(bend.left.tx) + Math.abs(bend.left.ty) + Math.abs(bend.left.tz) +
      Math.abs(bend.right.tx) + Math.abs(bend.right.ty) + Math.abs(bend.right.tz) > 0.002;
  }

  function resetBendTargets() {
    bend.stem.tx = 0; bend.stem.ty = 0; bend.stem.tz = 0;
    bend.left.tx = 0; bend.left.ty = 0; bend.left.tz = 0;
    bend.right.tx = 0; bend.right.ty = 0; bend.right.tz = 0;
  }

  function resetGeometry() {
    if (!modelMesh || !basePositions) return;
    modelMesh.geometry.attributes.position.array.set(basePositions);
    modelMesh.geometry.attributes.position.needsUpdate = true;
    modelMesh.geometry.computeVertexNormals();
    bend.stem.x = bend.stem.y = bend.stem.z = 0;
    bend.left.x = bend.left.y = bend.left.z = 0;
    bend.right.x = bend.right.y = bend.right.z = 0;
  }

  function hasResidualBend() {
    return Math.abs(bend.stem.x) + Math.abs(bend.stem.y) + Math.abs(bend.stem.z) +
      Math.abs(bend.left.x) + Math.abs(bend.left.y) + Math.abs(bend.left.z) +
      Math.abs(bend.right.x) + Math.abs(bend.right.y) + Math.abs(bend.right.z) > 0.003;
  }

  function onPointerDown(event) {
    if (!modelReady || (event.pointerType === 'mouse' && event.button !== 0)) return;
    var result = getHit(event);
    if (!result) return;

    drag.active = true;
    drag.pointerId = event.pointerId;
    drag.zone = result.zone;
    drag.startX = event.clientX;
    drag.startY = event.clientY;
    drag.startSpinY = spinTargetY;

    container.classList.add('is-dragging');
    canvas.classList.add('is-grabbed');
    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!modelReady) return;

    onHeroPointerMove(event);

    if (drag.active && event.pointerId === drag.pointerId) {
      setBendTargets(drag.zone, event.clientX - drag.startX, event.clientY - drag.startY);
      return;
    }
    if (drag.active) return;

    setPointer(event);
    var result = getHit(event);
    if (!result) {
      container.classList.remove('is-hovering');
      if (!reducedMotion) setAmbientReachTowardPointer();
      return;
    }

    container.classList.add('is-hovering');
    if (!reducedMotion) setReachBendTowardPointer(result);
  }

  function onPointerUp(event) {
    if (!drag.active || event.pointerId !== drag.pointerId) return;
    drag.active = false;
    drag.pointerId = null;
    container.classList.remove('is-dragging');
    canvas.classList.remove('is-grabbed');
    resetBendTargets();
    if (modelMesh && !isMobileView) modelMesh.geometry.computeVertexNormals();
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('pointerleave', function (event) {
    container.classList.remove('is-hovering');
    if (drag.active) onPointerUp(event);
    else resetBendTargets();
  });

  function fitCamera() {
    fitBox.setFromObject(plantRoot);
    fitBox.getSize(fitSize);
    fitBox.getCenter(fitCenter);

    var aspect = camera.aspect || 1;
    var vFov = camera.fov * Math.PI / 180;
    var hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    var distV = (fitSize.y * 0.5) / Math.tan(vFov / 2);
    var distH = (fitSize.x * 0.5) / Math.tan(hFov / 2);
    var dist = Math.max(distV, distH) * 1.35;

    camera.position.set(fitCenter.x, fitCenter.y, fitCenter.z + dist);
    camera.lookAt(fitCenter);
  }

  function resize() {
    var w = container.clientWidth;
    var h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (modelReady) fitCamera();
  }

  function idleAnimation() {
    if (reducedMotion || drag.active) return;
    if (container.classList.contains('is-hovering') || pointerInsideHero) return;

    time += isMobileView ? 0.005 : 0.007;

    var windAmp = isMobileView ? 0.012 : 0.02;
    var wind = Math.sin(time * 0.32) * windAmp + Math.sin(time * 0.78) * (windAmp * 0.25);
    var windSide = Math.cos(time * 0.24) * (windAmp * 0.7);

    bend.stem.tx = wind;
    bend.stem.ty = windSide + Math.sin(time * 0.55) * (windAmp * 0.3);

    bend.left.tz = Math.sin(time * 0.38) * (windAmp * 1.1) + Math.sin(time * 0.7) * (windAmp * 0.45);
    bend.left.tx = Math.sin(time * 0.3) * (windAmp * 0.5);

    bend.right.tz = Math.sin(time * 0.34 + 1.8) * -(windAmp * 1.0) + Math.cos(time * 0.62) * -(windAmp * 0.4);
    bend.right.tx = Math.cos(time * 0.38 + 0.9) * (windAmp * 0.45);
  }

  // Noticeably spinning on both desktop and mobile — a teammate's perf
  // pass zeroed this out on mobile entirely (isMobileView ? 0 : ...),
  // which read as "the sprout doesn't move at all" on phones. Kept a
  // modest mobile discount for GPU budget, not a full stop.
  var IDLE_SPIN_SPEED = isMobileView ? 0.0045 : 0.006;

  function animate() {
    requestAnimationFrame(animate);
    if (!heroVisible) return;

    if (!drag.active && !container.classList.contains('is-hovering') && !pointerInsideHero && modelReady) {
      idleAnimation();
    }

    // Constant seamless rotation — a running accumulator, not a keyframe
    // loop, so there's no seam to land on and no "reset" to notice.
    if (!reducedMotion && !drag.active) {
      plantRoot.rotation.y += IDLE_SPIN_SPEED;
    }

    // Whole-model parallax toward the cursor, independent of the idle
    // spin and of the drag-bend interaction — smoothed with the same
    // lerp approach as everything else here rather than snapping to the
    // pointer, and it decays back to 0 once the pointer leaves the hero.
    if (!reducedMotion) {
      var tiltEase = pointerInsideHero ? (isMobileView ? 0.06 : 0.08) : 0.04;
      tilt.x = lerp(tilt.x, tilt.tx, tiltEase);
      tilt.y = lerp(tilt.y, tilt.ty, tiltEase);
      plantTilt.rotation.x = tilt.x;
      plantTilt.rotation.y = tilt.y;
    }

    spinY = lerp(spinY, spinTargetY, drag.active ? 0.1 : 0.03);
    plantSpin.rotation.y = spinY;

    var hovering = container.classList.contains('is-hovering') || pointerInsideHero;
    var ease = drag.active ? 0.14 : (hovering ? 0.1 : 0.045);
    bend.stem.x = lerp(bend.stem.x, bend.stem.tx, ease);
    bend.stem.y = lerp(bend.stem.y, bend.stem.ty, ease);
    bend.stem.z = lerp(bend.stem.z, bend.stem.tz, ease);
    bend.left.x = lerp(bend.left.x, bend.left.tx, ease);
    bend.left.y = lerp(bend.left.y, bend.left.ty, ease);
    bend.left.z = lerp(bend.left.z, bend.left.tz, ease);
    bend.right.x = lerp(bend.right.x, bend.right.tx, ease);
    bend.right.y = lerp(bend.right.y, bend.right.ty, ease);
    bend.right.z = lerp(bend.right.z, bend.right.tz, ease);

    if (modelReady) {
      var deformActive = drag.active || hovering || hasResidualBend() || hasActiveTargets();
      if (deformActive) {
        applyDeformation();
        var normalInterval = isMobileView ? 14 : (drag.active || hovering ? 5 : 10);
        if (normalFrame > 0 && normalFrame % normalInterval === 0) {
          modelMesh.geometry.computeVertexNormals();
          normalFrame = 0;
        }
      }
    }

    renderer.render(scene, camera);
  }

  var textureLoader = new THREE.TextureLoader();
  var modelPath = 'assets/sprout-model/';

  function loadModel() {
    return Promise.all([
      textureLoader.loadAsync(modelPath + 'texture_diffuse.png'),
      textureLoader.loadAsync(modelPath + 'texture_normal.png'),
      textureLoader.loadAsync(modelPath + 'texture_roughness.png'),
      textureLoader.loadAsync(modelPath + 'texture_metallic.png')
    ]).then(function (maps) {
    maps[0].colorSpace = THREE.SRGBColorSpace;
    var maxAniso = renderer.capabilities.getMaxAnisotropy();
    maps.forEach(function (map, i) {
      map.anisotropy = isMobileView ? Math.min(2, maxAniso) : maxAniso;
    });

    var material = new THREE.MeshStandardMaterial({
      map: maps[0],
      normalMap: maps[1],
      roughnessMap: maps[2],
      metalnessMap: maps[3],
      color: new THREE.Color(0xf4fae8),
      metalness: 0.05,
      roughness: 0.9,
      envMapIntensity: 0.12
    });

    var objLoader = new OBJLoader();
    return new Promise(function (resolve, reject) {
      objLoader.load(modelPath + 'base.obj', resolve, undefined, reject);
    }).then(function (object) {
      var sourceMesh = null;
      object.traverse(function (child) {
        if (child.isMesh && !sourceMesh) sourceMesh = child;
      });
      if (!sourceMesh) throw new Error('Sprout mesh not found');

      var geometry = sourceMesh.geometry.clone();
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();

      var bb = geometry.boundingBox;
      var cx = (bb.min.x + bb.max.x) * 0.5;
      var cz = (bb.min.z + bb.max.z) * 0.5;
      geometry.translate(-cx, -bb.min.y, -cz);

      modelMesh = new THREE.Mesh(geometry, material);
      plantSpin.add(modelMesh);

      var box = new THREE.Box3().setFromObject(modelMesh);
      var size = box.getSize(new THREE.Vector3());
      var maxDim = Math.max(size.x, size.y, size.z);
      modelMesh.scale.setScalar(0.92 / maxDim);

      basePositions = new Float32Array(geometry.attributes.position.array);
      vertexWeights = computeVertexWeights(geometry);

      fitCamera();
      modelReady = true;
      container.classList.add('is-ready');
      // Fade the skeleton out rather than yanking it — it and the canvas
      // cross-fade over the same .5s window (see .hero-sprout-loader.is-done
      // in css/style.css), then it's removed once fully transparent.
      if (loaderEl) {
        loaderEl.classList.add('is-done');
        window.setTimeout(function () {
          if (loaderEl.parentNode) loaderEl.parentNode.removeChild(loaderEl);
        }, 520);
      }
    });
    }).catch(function (err) {
      console.error('Sprout 3D model failed to load', err);
      if (loaderEl) loaderEl.remove();
    });
  }

  resize();
  window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) {
    var heroObserver = new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    heroObserver.observe(container);
  }
  animate();

  // The model is ~15MB of textures + geometry — deliberately deferred a
  // tick past first paint so it never competes with fonts/critical CSS
  // for bandwidth on the initial request wave. requestIdleCallback (with
  // a short timeout so it can't be starved indefinitely) is a better fit
  // here than a fixed setTimeout guess.
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadModel, { timeout: 1200 });
  } else {
    window.setTimeout(loadModel, 200);
  }
})();

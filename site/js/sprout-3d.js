import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

(function initHeroSprout3D() {
  var container = document.getElementById('heroSprout');
  var canvas = document.getElementById('heroSproutCanvas');
  var loaderEl = document.getElementById('heroSproutLoader');
  if (!container || !canvas) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
    var nx = clamp((event.clientX - cx) / (window.innerWidth * 0.5), -1, 1);
    var ny = clamp((event.clientY - cy) / (window.innerHeight * 0.5), -1, 1);
    var MAX_TILT = 0.085; // radians — kept small, this is a "notice it, don't be distracted by it" effect
    tilt.ty = nx * MAX_TILT;
    tilt.tx = ny * -MAX_TILT;
    pointerInsideHero = true;
  }
  function resetHeroTilt() {
    pointerInsideHero = false;
    tilt.tx = 0;
    tilt.ty = 0;
  }
  var heroSection = container.closest('.hero') || document;
  heroSection.addEventListener('pointermove', onHeroPointerMove);
  heroSection.addEventListener('pointerleave', resetHeroTilt);

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
    if (zone === 'stem') {
      spinTargetY = drag.startSpinY + dx * 0.012;
      bend.stem.tx = clamp(dy * -0.008, -0.22, 0.22);
      return;
    }
    if (zone === 'left') {
      bend.left.tz = clamp(dx * 0.025, -0.55, 0.55);
      bend.left.tx = clamp(dy * -0.02, -0.42, 0.42);
      bend.left.ty = clamp(dx * 0.006, -0.15, 0.15);
      return;
    }
    bend.right.tz = clamp(dx * -0.025, -0.55, 0.55);
    bend.right.tx = clamp(dy * -0.02, -0.42, 0.42);
    bend.right.ty = clamp(dx * -0.006, -0.15, 0.15);
  }

  function resetBendTargets() {
    bend.stem.tx = 0; bend.stem.ty = 0; bend.stem.tz = 0;
    bend.left.tx = 0; bend.left.ty = 0; bend.left.tz = 0;
    bend.right.tx = 0; bend.right.ty = 0; bend.right.tz = 0;
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

    if (drag.active && event.pointerId === drag.pointerId) {
      setBendTargets(drag.zone, event.clientX - drag.startX, event.clientY - drag.startY);
      return;
    }
    if (drag.active) return;

    var result = getHit(event);
    if (!result) {
      container.classList.remove('is-hovering');
      return;
    }

    container.classList.add('is-hovering');
    setPointer(event);
    if (result.zone === 'stem') {
      bend.stem.ty = pointer.x * 0.12;
      bend.stem.tx = pointer.y * -0.08;
    } else if (result.zone === 'left') {
      bend.left.tz = pointer.x * 0.16;
      bend.left.tx = pointer.y * -0.1;
    } else {
      bend.right.tz = pointer.x * -0.16;
      bend.right.tx = pointer.y * -0.1;
    }
  }

  function onPointerUp(event) {
    if (!drag.active || event.pointerId !== drag.pointerId) return;
    drag.active = false;
    drag.pointerId = null;
    container.classList.remove('is-dragging');
    canvas.classList.remove('is-grabbed');
    resetBendTargets();
    modelMesh.geometry.computeVertexNormals();
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

    time += 0.01;

    var wind = Math.sin(time * 0.38) * 0.03 + Math.sin(time * 0.91) * 0.006;
    var windSide = Math.cos(time * 0.29) * 0.022;

    bend.stem.tx = wind;
    bend.stem.ty = windSide + Math.sin(time * 0.67) * 0.008;

    bend.left.tz = Math.sin(time * 0.43) * 0.035 + Math.sin(time * 0.82) * 0.015;
    bend.left.tx = Math.sin(time * 0.35) * 0.014;

    bend.right.tz = Math.sin(time * 0.37 + 1.8) * -0.032 + Math.cos(time * 0.74) * -0.012;
    bend.right.tx = Math.cos(time * 0.42 + 0.9) * 0.012;
  }

  var IDLE_SPIN_SPEED = 0.0018; // rad/frame — one full turn in roughly 70s at 60fps, deliberately slow/weightless

  function animate() {
    requestAnimationFrame(animate);

    if (!drag.active && !container.classList.contains('is-hovering') && modelReady) {
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
      var tiltEase = pointerInsideHero ? 0.06 : 0.045;
      tilt.x = lerp(tilt.x, tilt.tx, tiltEase);
      tilt.y = lerp(tilt.y, tilt.ty, tiltEase);
      plantTilt.rotation.x = tilt.x;
      plantTilt.rotation.y = tilt.y;
    }

    spinY = lerp(spinY, spinTargetY, drag.active ? 0.14 : 0.04);
    plantSpin.rotation.y = spinY;

    var ease = drag.active ? 0.18 : 0.045;
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
      applyDeformation();
      if (normalFrame > 0 && normalFrame % 8 === 0) {
        modelMesh.geometry.computeVertexNormals();
        normalFrame = 0;
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
    maps.forEach(function (map) {
      map.anisotropy = renderer.capabilities.getMaxAnisotropy();
    });

    var material = new THREE.MeshStandardMaterial({
      map: maps[0],
      normalMap: maps[1],
      roughnessMap: maps[2],
      metalnessMap: maps[3],
      color: new THREE.Color(0xf2f8e8),
      metalness: 0.12,
      roughness: 0.82,
      envMapIntensity: 0.2
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

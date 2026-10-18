// neurons: a 3D network of nerve cells; activity spreads from a central assembly in waves of travelling pulses.
// fire = waves grow bright at the cue; fade = every wave is weaker and the cells go grey (fatigue);
// recover = starts grey and dim, at the cue light floods back out from the centre.
// P: {mode: "fire"|"fade"|"recover", label: "KAŞIK", n: 46, period: 0.85, seed: 5, camera: {...}}
// cues: hit (fire: waves peak · fade: cells tire faster · recover: light comes back)
'use strict';

function neuronsMerge(geos) {
  let nv = 0, ni = 0;
  for (const g of geos) { nv += g.attributes.position.count; ni += g.index.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), idx = new Uint32Array(ni);
  let ov = 0, oi = 0;
  for (const g of geos) {
    pos.set(g.attributes.position.array, ov * 3); nor.set(g.attributes.normal.array, ov * 3);
    const ia = g.index.array; for (let i = 0; i < ia.length; i++) idx[oi + i] = ia[i] + ov;
    ov += g.attributes.position.count; oi += ia.length; g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

SHOTS.neurons = {
  kind: '3d',
  build(ctx) {
    const { P, pal, W, H, scene, camera, labels } = ctx;
    const portrait = H > W, mode = P.mode || 'fire';
    const r = rng(P.seed || 5);
    const N = P.n || 46, NC = 7;
    const SX = portrait ? 2.6 : 4.2, SY = portrait ? 4.0 : 2.4, SZ = 2.4;
    // ---- cells: a tight central assembly (the word) + a wider network
    const cells = [];
    for (let i = 0; i < N; i++) {
      let p;
      if (i < NC) { const a = i / NC * 6.283 + r() * 0.4; p = i === 0 ? V3(0, 0, 0) : V3(Math.cos(a) * 0.75, Math.sin(a) * 0.75, (r() - 0.5) * 0.7); }
      else {
        for (let tries = 0; tries < 30; tries++) {
          p = V3((r() * 2 - 1) * SX, (r() * 2 - 1) * SY, (r() * 2 - 1) * SZ);
          if (p.length() > 1.2 && cells.every(c => c.p.distanceTo(p) > 0.75)) break;
        }
      }
      cells.push({ p, d: p.length(), sz: i < NC ? 0.15 + r() * 0.04 : 0.09 + r() * 0.06, ph: r() * 6.28 });
    }
    // ---- connections: each cell to its 2-3 nearest neighbours
    const edges = [], has = new Set();
    cells.forEach((c, i) => {
      const near = cells.map((o, j) => [j, c.p.distanceTo(o.p)]).filter(x => x[0] !== i).sort((a, b) => a[1] - b[1]).slice(0, i < NC ? 3 : 2 + (r() < 0.4 ? 1 : 0));
      for (const [j] of near) {
        const key = Math.min(i, j) + '-' + Math.max(i, j); if (has.has(key)) continue; has.add(key);
        const [a, b] = c.d <= cells[j].d ? [i, j] : [j, i];                         // pulses travel outward
        const A = cells[a].p, B = cells[b].p;
        const mid = A.clone().add(B).multiplyScalar(0.5).add(V3((r() - 0.5) * 0.6, (r() - 0.5) * 0.6, (r() - 0.5) * 0.6));
        edges.push({ a, b, curve: new THREE.QuadraticBezierCurve3(A.clone(), mid, B.clone()) });
      }
    });
    const tubes = edges.map(e => new THREE.TubeGeometry(e.curve, 14, 0.016, 4, false));
    // short branching dendrites around every cell
    const dends = [];
    cells.forEach((c, i) => {
      const nb = i < NC ? 5 : 4;
      for (let k = 0; k < nb; k++) {
        const dir = V3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), L = 0.25 + r() * 0.35;
        const p1 = c.p.clone().addScaledVector(dir, L * 0.5).add(V3((r() - 0.5) * 0.1, (r() - 0.5) * 0.1, 0));
        const p2 = c.p.clone().addScaledVector(dir, L);
        dends.push(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(c.p.clone(), p1, p2), 6, 0.011, 3, false));
      }
    });
    const mAxon = new THREE.MeshBasicMaterial({ color: col(pal.accent2), transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false });
    const mDend = new THREE.MeshBasicMaterial({ color: col(pal.accent2), transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false });
    const net = new THREE.Group(); scene.add(net);
    net.add(new THREE.Mesh(neuronsMerge(tubes), mAxon), new THREE.Mesh(neuronsMerge(dends), mDend));
    const soma = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffffff }), N);
    net.add(soma);
    const m4 = new THREE.Matrix4(), cc = new THREE.Color();
    cells.forEach((c, i) => { m4.makeScale(c.sz, c.sz, c.sz); m4.setPosition(c.p); soma.setMatrixAt(i, m4); soma.setColorAt(i, cc.set('#888888')); });
    const glows = cells.map((c, i) => { const g = glowSprite(pal.accent, c.sz * 7, 0); g.position.copy(c.p); net.add(g); return g; });
    const pulses = edges.map(() => { const g = glowSprite('#ffffff', 0.32, 0); net.add(g); return g; });
    const core = glowSprite(pal.accent, 3.2, 0.3); net.add(core);
    const haze = glowSprite(pal.glow, 16, 0.22); haze.position.set(0, 0, -6); scene.add(haze);
    const dust = starfield(scene, 9 + (P.seed || 5), 700, 16);
    scene.fog = new THREE.Fog(col(pal.bg[0]), 7, 22);
    const lbl = P.label ? labels.add('counter') : null;
    const GREY = '#6b7280';

    const camDef = mode === 'fade' ? { dist: portrait ? 8.6 : 6.4, yaw: 24, pitch: 8, fov: 40, sy: portrait ? 0.14 : 0, drift: 2.4 }
      : mode === 'recover' ? { dist: portrait ? 11.5 : 9.0, yaw: -18, pitch: 12, fov: 40, sy: portrait ? 0.14 : 0, drift: 2.0 }
      : { dist: portrait ? 11.5 : 8.5, yaw: -8, pitch: 6, fov: 40, sy: portrait ? 0.14 : 0, drift: 2.6 };
    const camAt = (lt, dur, env) => shotCam(Object.assign({}, P, { camera: Object.assign({}, camDef, P.camera || {}) }), env, lt, dur);
    const per = P.period || 0.85, speed = 4.2;
    return {
      camAt,
      update(lt, dur, cues, env) {
        const t = env.t, hit = cue(cues, 'hit', Math.min(1.0, dur * 0.4));
        applyCam(camera, camAt(lt, dur, env), W, H);
        dust(t);
        net.rotation.y = 0.05 * Math.sin(t * 0.3); net.updateMatrixWorld(); camera.updateMatrixWorld();
        const wp = V3(0, 0, 0);
        // keep the top-left kicker zone clear of cells
        const kick = v => { const sp = toScreen(wp.copy(v).applyMatrix4(net.matrixWorld), camera, W, H); return clamp01((W * 0.62 - sp[0]) / (W * 0.1)) * clamp01((H * (portrait ? 0.2 : 0.24) - sp[1]) / (H * 0.05)); };
        // volley k starts at k*per (from the centre) and spreads outward at `speed`
        const strength = k => {
          const v = k * per;
          if (mode === 'fire') return v < hit - 0.1 ? 0.45 : 1;
          if (mode === 'fade') { const tired = k + 1.6 * Math.max(0, (v - hit + 0.2) / per); return Math.max(0.06, Math.pow(0.66, tired)); }
          return v < hit - 0.1 ? 0.12 : 1;
        };
        const fatigue = mode === 'fade' ? clamp01(lt / dur * 0.6 + 0.5 * prog(lt, hit, 1.2))
          : mode === 'recover' ? 1 - progIO(lt, hit - 0.1, 1.0) : 0;
        const grow = mode === 'recover' ? Math.max(0, lt - hit + 0.1) * speed : 1e9;   // recovery light front
        const hp = punch(lt, hit, 0.9);
        cells.forEach((c, i) => {
          const kNow = Math.floor((lt - c.d / speed) / per);
          let f = 0;
          if (kNow >= 0) { const at = kNow * per + c.d / speed; f = strength(kNow) * Math.exp(-(lt - at) * 4.5); }
          const lit = mode === 'recover' ? clamp01((grow - c.d) / 1.2) : 1;
          const fatC = clamp01(mode === 'recover' ? 1 - lit : fatigue);
          const base = mix(pal.accent, GREY, fatC);
          const bright = (i < NC ? 0.75 : 0.5) + 0.5 * f;
          soma.setColorAt(i, cc.set(mix('#1a1d24', mix(base, '#ffffff', 0.35 * f), clamp01(bright * (1 - 0.45 * fatC)))));
          const km = 1 - kick(c.p);
          const s = km * c.sz * (1 + 0.35 * f + (i < NC ? 0.25 * hp : 0) + 0.04 * Math.sin(t * 2 + c.ph));
          m4.makeScale(s, s, s); m4.setPosition(c.p); soma.setMatrixAt(i, m4);
          const gm = glows[i].material;
          gm.color.set(base); gm.opacity = Math.min(1, (0.12 + 0.85 * f) * (1 - 0.7 * fatC) + (i < NC ? 0.25 * hp : 0));
          gm.opacity *= km;
          glows[i].scale.setScalar(c.sz * (6 + 6 * f));
        });
        soma.instanceMatrix.needsUpdate = true; soma.instanceColor.needsUpdate = true;
        edges.forEach((e, j) => {
          const da = cells[e.a].d, db = cells[e.b].d, tr = Math.max(0.18, (db - da) / speed);
          const k = Math.floor((lt - da / speed) / per);
          const g = pulses[j];
          if (k < 0) { g.material.opacity = 0; return; }
          const u = (lt - da / speed - k * per) / tr;
          if (u > 1) { g.material.opacity = 0; return; }
          const lit = mode === 'recover' ? clamp01((grow - da) / 1.2) : 1;
          const st = mode === 'recover' ? lerp(0.12, 1, lit) : strength(k);
          g.position.copy(e.curve.getPoint(clamp01(u)));
          g.material.color.set(mix('#ffffff', GREY, mode === 'recover' ? 1 - lit : fatigue));
          g.material.opacity = Math.min(1, 1.1 * st * Math.sin(Math.PI * clamp01(u))) * (1 - kick(g.position));
          g.scale.setScalar(0.18 + 0.28 * st);
        });
        const ax = mode === 'recover' ? 1 - fatigue : 1 - 0.7 * fatigue;
        mAxon.color.set(mix(pal.accent2, GREY, 1 - ax)); mAxon.opacity = 0.14 + 0.32 * ax;
        mDend.color.set(mix(pal.accent2, GREY, 1 - ax)); mDend.opacity = 0.1 + 0.2 * ax;
        core.material.color.set(mix(pal.accent, GREY, fatigue));
        core.material.opacity = (0.25 + 0.35 * (mode === 'fire' ? prog(lt, hit - 0.2, 0.6) : 1 - fatigue)) * (0.85 + 0.15 * Math.sin(t * 4)) + 0.4 * hp;
        core.scale.setScalar(3.0 + 1.2 * hp + 0.2 * Math.sin(t * 2));
        haze.material.opacity = 0.16 + 0.1 * (1 - fatigue);
        if (lbl) {
          const sp = toScreen(V3(0, 1.25, 0).applyMatrix4(net.matrixWorld), camera, W, H);
          const a = clamp01(lin(lt, 0.25, 0.4)) * (mode === 'fade' ? 1 - 0.75 * fatigue : mode === 'recover' ? lerp(0.3, 1, 1 - fatigue) : 1);
          const c = mix(pal.accent, GREY, fatigue);
          const ls = mode === 'fade' ? (0.02 + 0.3 * fatigue).toFixed(2) : mode === 'recover' ? (0.02 + 0.3 * fatigue).toFixed(2) : '0.02';
          const fs = Math.round(110 * (1 + 0.08 * hp));
          lbl.set(`<b style="font-size:${fs}px;color:${c};letter-spacing:${ls}em">${P.label}</b>`, Math.max(W * 0.2, Math.min(W * 0.8, sp[0])), Math.max(H * 0.19, Math.min(H * 0.55, sp[1] - (portrait ? 40 : 20))), a);
        }
      },
    };
  },
};

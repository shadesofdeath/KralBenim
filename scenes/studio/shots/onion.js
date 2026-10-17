// onion: a red onion sliced on a cutting board (gas bursts out of the cut), or the microscopic world inside it:
// a carpet of onion cells a blade bursts, two separated substances meeting, the irritant gas rising.
// P: {mode: "cut"|"cells"|"sharp"|"mix"|"gas", variety: "red"|"yellow",
//     labels: [{at: "blade"|"enzyme"|"sulfur"|"gas", text, sub, dx, dy, cue}]  (mix/gas/sharp have sensible defaults),
//     enzyme: "#hex", sulfur: "#hex", gas: "#hex", camera: {...}}
// cues: hit (cut: knife lands + gas burst; cells/sharp: cells burst; mix: substances meet; gas: gas rises)
// cells -> mix -> gas are one world: put them in consecutive scenes for a continuous camera dive.
'use strict';

function onionTex(w, h, paint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4;
  return t;
}
function onionProfile() {
  const pts = [[0, -1.0], [0.45, -0.95], [0.85, -0.74], [1.1, -0.4], [1.17, 0], [1.08, 0.38], [0.8, 0.74],
    [0.42, 1.04], [0.17, 1.3], [0.07, 1.52], [0, 1.6]];
  return new THREE.SplineCurve(pts.map(p => new THREE.Vector2(p[0], p[1]))).getPoints(64)
    .map((p, i, a) => new THREE.Vector2(i === 0 || i === a.length - 1 ? 0 : Math.max(0.001, p.x), p.y));
}
// ballistic flight that lands on a floor and stays there: returns [x, y, z, airborne 0/1]
function onionFlight(p0, v, a, floor) {
  const g = 4.9, h = p0[1] - floor;
  const tl = (v[1] + Math.sqrt(v[1] * v[1] + 4 * g * Math.max(0, h))) / (2 * g);
  const s = Math.min(a, tl);
  return [p0[0] + v[0] * s, Math.max(floor, p0[1] + v[1] * s - g * s * s), p0[2] + v[2] * s, a < tl ? 1 : 0];
}

// one irritant gas molecule (C, C, S, O) as a small group; atoms in CPK colours
function onionMolecule() {
  const g = new THREE.Group(), geo = new THREE.SphereGeometry(1, 16, 12);
  const M = (c, e, ei) => new THREE.MeshStandardMaterial({ color: col(c), emissive: col(e || '#000000'), emissiveIntensity: ei || 0, roughness: 0.3 });
  for (const [c, e, ei, x, y, z, rad] of [['#ffd23f', '#ffb000', 0.35, 0, 0, 0, 0.075], ['#ff4b3a', '#ff2a10', 0.2, 0.12, 0.07, 0, 0.06],
    ['#d8d8dc', 0, 0, -0.13, 0.03, 0.03, 0.065], ['#d8d8dc', 0, 0, -0.22, -0.09, -0.02, 0.065]]) {
    const m = new THREE.Mesh(geo, M(c, e, ei)); m.position.set(x, y, z); m.scale.setScalar(rad); g.add(m);
  }
  return g;
}

// chef's knife: blade in the XY plane, edge along y=0 from x=-2.15 (tip) to 1.5 (heel), handle on +x
function onionKnife(pal, edgeCol) {
  const g = new THREE.Group();
  const bs = new THREE.Shape();
  bs.moveTo(1.5, 0); bs.lineTo(-1.25, 0); bs.quadraticCurveTo(-1.95, 0.06, -2.15, 0.78); bs.lineTo(1.5, 0.9); bs.lineTo(1.5, 0);
  const bgeo = new THREE.ExtrudeGeometry(bs, { depth: 0.035, bevelEnabled: false }); bgeo.translate(0, 0, -0.0175);
  const mBlade = new THREE.MeshStandardMaterial({ color: col('#d7dde4'), metalness: 0.55, roughness: 0.2, emissive: col(pal.accent2), emissiveIntensity: 0.08, side: THREE.DoubleSide });
  g.add(new THREE.Mesh(bgeo, mBlade));
  const edge = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.05, 0.045), new THREE.MeshBasicMaterial({ color: col(edgeCol || '#ffffff'), transparent: true, opacity: 0.8 }));
  edge.position.set(0.12, 0.03, 0); g.add(edge);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.44, 0.22), new THREE.MeshStandardMaterial({ color: col('#2a1a12'), roughness: 0.55 }));
  handle.position.set(2.25, 0.62, 0); g.add(handle);
  for (const hx of [1.85, 2.3, 2.75]) {
    const rv = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.24, 16), new THREE.MeshStandardMaterial({ color: col('#e8e8ea'), metalness: 0.6, roughness: 0.3 }));
    rv.rotation.x = Math.PI / 2; rv.position.set(hx, 0.62, 0); g.add(rv);
  }
  return { g, edge };
}

SHOTS.onion = {
  kind: '3d',
  build(ctx) {
    const { P, scene, camera, pal, W, H, labels } = ctx;
    const portrait = H > W, mode = P.mode || 'cut', r = rng(41);
    const red = (P.variety || 'red') === 'red';
    const gasCol = P.gas || pal.accent;
    scene.add(new THREE.HemisphereLight(0xfff3e6, 0x1a0c14, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 2.3); key.position.set(-4, 6, 6); scene.add(key);
    const rim = new THREE.PointLight(col(pal.accent2), 45, 22); rim.position.set(3.5, 2.5, -3.5); scene.add(rim);
    const back = glowSprite(pal.glow, portrait ? 16 : 20, 0.35); back.position.set(0, 0.6, -5); scene.add(back);
    // drifting dust motes (foreground depth)
    const dustN = 220, dpos = new Float32Array(dustN * 3);
    for (let i = 0; i < dustN; i++) dpos.set([(r() - 0.5) * 12, r() * 6 - 1, (r() - 0.5) * 10], i * 3);
    const dgeo = new THREE.BufferGeometry(); dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
    const dust = new THREE.Points(dgeo, new THREE.PointsMaterial({ color: col(pal.accent2), size: 0.035, transparent: true, opacity: 0.55, depthWrite: false }));
    scene.add(dust);
    const lblDefs = P.labels || ({
      mix: [{ at: 'enzyme', text: 'ENZİM', color: P.enzyme || pal.accent2, slot: [0.26, 0.3] },
            { at: 'sulfur', text: 'KÜKÜRTLÜ<br>MADDE', color: P.sulfur || pal.accent, slot: [0.72, 0.3], size: 76 }],
      gas: [{ at: 'gas', text: 'GAZ', dx: -230, dy: 60 }],
      sharp: [{ at: 'ghost', text: 'KÖR BIÇAK', sub: 'geniş hasar', color: RED, slot: [0.3, 0.27], win: w => [0.15, w[0] - 0.1] },
              { at: 'blade', text: 'KESKİN BIÇAK', sub: 'tek ince hat', slot: [0.3, 0.27], win: w => [w[0] + 0.15] }],
    }[mode] || []);
    const lbls = lblDefs.map(d => ({ d, l: labels.add('layer') }));
    const tmp = V3(0, 0, 0);
    const placeLabels = (lt, dur, cues, anchors, show) => {
      lbls.forEach(({ d, l }, k) => {
        const a = anchors[d.at]; if (!a) { l.set('', 0, 0, 0); return; }
        const s = toScreen(tmp.copy(a), camera, W, H);
        const win = d.win ? d.win(show) : show;
        const at = cue(cues, d.cue || '__none', win[0] + (d.win ? 0 : k * 0.25));
        const alpha = clamp01(spring(lt, at, 0.5) * 1.4) * (win[1] != null ? 1 - prog(lt, win[1], 0.35) : 1);
        const c = d.color || pal.accent;
        const html = `<b style="font-size:${d.size || (portrait ? 92 : 76)}px;line-height:1.02;color:${c}">${d.text}</b>` + (d.sub ? `<small style="font-size:44px">${d.sub}</small>` : '');
        let x = Math.max(250, Math.min(W - 250, s[0] + (d.dx || 0))), y = Math.max(330, Math.min(H * 0.6, s[1] + (d.dy || 0)));
        if (d.slot) { x = d.slot[0] * W; y = d.slot[1] * H; }
        const inFrame = s[0] > 20 && s[0] < W - 20 && s[1] > 20 && s[1] < H - 20 && s[2] < 1;
        l.set(html, x, y, alpha, inFrame ? [s[0], s[1]] : null, prog(lt, at + 0.1, 0.4));
      });
    };

    // ======================================================== mode cut: whole onion, knife, gas burst
    if (mode === 'cut') {
      const prof = onionProfile();
      const skin = onionTex(512, 512, (g, w, h) => {
        const gr = g.createLinearGradient(0, h, 0, 0);
        if (red) { gr.addColorStop(0, '#4a1233'); gr.addColorStop(0.5, '#8c2a60'); gr.addColorStop(0.85, '#7a2f4f'); gr.addColorStop(1, '#7a5238'); }
        else { gr.addColorStop(0, '#6b3a17'); gr.addColorStop(0.5, '#b8742f'); gr.addColorStop(0.85, '#a9682c'); gr.addColorStop(1, '#7a5234'); }
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
        const rr = rng(5);
        for (let i = 0; i < 170; i++) {
          const x = rr() * w; g.strokeStyle = rr() < 0.6 ? 'rgba(255,200,230,.22)' : 'rgba(40,0,20,.3)'; g.lineWidth = 1 + rr() * 3;
          g.beginPath(); g.moveTo(x, h); g.bezierCurveTo(x + (rr() - 0.5) * 30, h * 0.6, x + (rr() - 0.5) * 30, h * 0.3, x + (rr() - 0.5) * 10, 0); g.stroke();
        }
      });
      const mSkin = new THREE.MeshStandardMaterial({ map: skin, roughness: 0.42, metalness: 0.05, side: THREE.DoubleSide });
      // cut face: concentric layers following the bulb outline
      const X0 = -1.25, Y0 = -1.1, SW = 2.5, SH = 2.75;
      const face = onionTex(512, 564, (g, w, h) => {
        const toC = (x, y) => [(x - X0) / SW * w, (1 - (y - Y0) / SH) * h];
        const ring = (s) => {
          g.beginPath();
          const pts = prof.map(p => [p.x * s, lerp(-0.72, p.y, 0.22 + 0.78 * s)]);
          pts.forEach((p, i) => { const c = toC(p[0], p[1]); i ? g.lineTo(...c) : g.moveTo(...c); });
          for (let i = pts.length - 1; i >= 0; i--) g.lineTo(...toC(-pts[i][0], pts[i][1]));
          g.closePath();
        };
        g.fillStyle = red ? '#5a1838' : '#8a5a2a'; g.fillRect(0, 0, w, h);
        for (let k = 0; k < 11; k++) {
          const s = 1 - k * 0.085;
          ring(s); g.fillStyle = k % 2 ? (red ? '#f7e8f1' : '#f6f0d8') : (red ? '#efd2e3' : '#ece2bb'); g.fill();
          g.lineWidth = k === 0 ? 10 : 5; g.strokeStyle = red ? '#a83a78' : '#cbb25a'; g.stroke();
        }
        ring(0.08); g.fillStyle = red ? '#d77fb0' : '#d8cf86'; g.fill();
      });
      const shape = new THREE.Shape();
      prof.forEach((p, i) => i ? shape.lineTo(p.x, p.y) : shape.moveTo(p.x, p.y));
      for (let i = prof.length - 1; i >= 0; i--) shape.lineTo(-prof[i].x, prof[i].y);
      const fgeo = new THREE.ShapeGeometry(shape, 24);
      const fp = fgeo.attributes.position, fuv = fgeo.attributes.uv;
      for (let i = 0; i < fp.count; i++) fuv.setXY(i, (fp.getX(i) - X0) / SW, (fp.getY(i) - Y0) / SH);
      const mFace = new THREE.MeshStandardMaterial({ map: face, roughness: 0.28, metalness: 0, emissive: col(gasCol), emissiveIntensity: 0, side: THREE.DoubleSide });
      // back half (stays) + front half (falls toward the camera after the cut)
      const half = (start) => {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 64, start, Math.PI), mSkin));
        const f = new THREE.Mesh(fgeo, mFace); if (start < 0) f.rotation.y = Math.PI; g.add(f);
        return g;
      };
      const B = half(Math.PI / 2); scene.add(B);
      const pivot = new THREE.Group(); pivot.position.set(0, -1.0, 1.17); scene.add(pivot);
      const A = half(-Math.PI / 2); A.position.set(0, 1.0, -1.17); pivot.add(A);
      // cutting board
      const wood = onionTex(512, 256, (g, w, h) => {
        g.fillStyle = '#7a5233'; g.fillRect(0, 0, w, h);
        const rr = rng(9);
        for (let i = 0; i < 60; i++) {
          const y = rr() * h; g.strokeStyle = rr() < 0.5 ? 'rgba(60,35,18,.45)' : 'rgba(200,150,100,.18)'; g.lineWidth = 1 + rr() * 3;
          g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 4); g.stroke();
        }
      });
      const board = new THREE.Mesh(new THREE.BoxGeometry(7, 0.28, 5.2), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.75 }));
      board.position.set(0, -1.14, 0.9); scene.add(board);
      const { g: kn } = onionKnife(pal);
      kn.position.z = 0.03; scene.add(kn);
      // gas: soft glowing puffs leaving the cut face
      const puffs = Array.from({ length: 70 }, () => {
        const s = glowSprite(gasCol, 1, 0); scene.add(s);
        return { s, x: (r() - 0.5) * 1.7, y: -0.6 + r() * 1.8, vx: (r() - 0.5) * 1.1, vy: 0.7 + r() * 1.3, vz: 0.4 + r() * 1.0, off: r() * 2.4, sz: 0.35 + r() * 0.7, ph: r() * 6.28 };
      });
      const cmols = Array.from({ length: 16 }, (_, i) => {
        const g = onionMolecule(); scene.add(g);
        const halo = glowSprite(gasCol, 1, 0); scene.add(halo);
        return { g, halo, x: (r() - 0.5) * 1.5, y: -0.2 + r() * 1.2, vx: (r() - 0.5) * 1.4, vy: 1.3 + r() * 1.3, vz: 0.2 + r() * 0.8, off: i * 0.09 + r() * 0.1, ph: r() * 6.28, sp: [r() * 4, r() * 4, r() * 4], sz: 1.4 + r() * 0.5 };
      });
      const flash = glowSprite(gasCol, 1, 0); flash.position.set(0, 0.3, 0.3); scene.add(flash);
      const camAt = (lt, dur, env) => shotCam(Object.assign({}, P, { camera: Object.assign({ dist: portrait ? 12.5 : 8, yaw: 20, pitch: 15, ty: 0.9, tz: 0.6, fov: 34, sy: portrait ? -0.02 : 0, drift: 1.6 }, P.camera || {}) }), env, lt, dur);
      return {
        camAt,
        update(lt, dur, cues, env) {
          const t = env.t, hit = cue(cues, 'hit', Math.min(1.1, dur * 0.4));
          applyCam(camera, camAt(lt, dur, env), W, H);
          // knife falls through the onion (accelerating), then lifts away
          const kd = clamp01((lt - 0.05) / Math.max(0.2, hit - 0.05));
          const lift = progIO(lt, hit + 0.25, 0.9);
          kn.position.y = lerp(2.1, -1.0, kd * kd) + 3.4 * lift + 0.04 * punch(lt, hit, 0.4);
          kn.position.x = 0.25 + 1.6 * lift;
          kn.rotation.z = -0.08 * Math.sin(kd * Math.PI) - 0.25 * lift;
          // front half falls open toward the camera
          const fall = lt < hit ? 0 : 1.38 * prog(lt, hit + 0.05, 0.55) + 0.07 * Math.exp(-(lt - hit - 0.6) * 4) * Math.sin(Math.max(0, lt - hit - 0.6) * 14);
          pivot.rotation.x = fall;
          B.position.y = 0.02 * Math.sin(t * 2);
          mFace.emissiveIntensity = 0.05 + 0.35 * punch(lt, hit, 0.9) + 0.08 * clamp01(lt - hit);
          flash.scale.setScalar(1 + 6 * prog(lt, hit, 0.6)); flash.material.opacity = 0.9 * punch(lt, hit, 1.0);
          puffs.forEach(p => {
            let a = lt - hit - 0.05 - p.off * 0.35;
            if (a < 0) { p.s.material.opacity = 0; return; }
            a = a % 2.6;
            p.s.position.set(p.x + p.vx * a + 0.15 * Math.sin(t * 1.3 + p.ph), p.y + p.vy * a, 0.15 + p.vz * a);
            p.s.scale.setScalar(p.sz * (0.4 + a * 0.9));
            p.s.material.opacity = 0.42 * clamp01(a * 4) * clamp01((2.6 - a) / 0.9);
          });
          cmols.forEach(m => {
            const a = lt - hit - 0.05 - m.off;
            if (a < 0) { m.g.visible = false; m.halo.material.opacity = 0; return; }
            const x = m.x + m.vx * a + 0.12 * Math.sin(t * 1.6 + m.ph), y = m.y + m.vy * a * (1 - 0.12 * a), z = 0.25 + m.vz * a;
            m.g.visible = true; m.g.position.set(x, y, z); m.g.scale.setScalar(m.sz * spring(lt, hit + 0.05 + m.off, 0.45));
            m.g.rotation.set(m.sp[0] * t, m.sp[1] * t, m.sp[2] * t);
            m.halo.position.set(x, y, z); m.halo.scale.setScalar(0.9 + 0.15 * Math.sin(t * 3 + m.ph)); m.halo.material.opacity = 0.55 * clamp01(a * 3);
          });
          dust.rotation.y = t * 0.03; dust.position.y = 0.1 * Math.sin(t * 0.4);
          back.material.opacity = 0.3 + 0.1 * Math.sin(t * 1.2) + 0.25 * punch(lt, hit, 1);
        },
      };
    }

    // ======================================================== cells world (cells / sharp / mix / gas)
    const CUT = 0.24, L = 0.96, WZ = 0.4, nC = 13, nR = 24;
    const sharp = mode === 'sharp';
    const burstW = sharp ? 0.3 : 0.9, squashW = sharp ? 0 : 1.9;
    const cells = [];
    for (let rI = 0; rI < nR; rI++) for (let cI = 0; cI < nC; cI++) {
      const x = (cI - (nC - 1) / 2) * L + (rI % 2 ? L / 2 : 0), z = (rI - (nR - 1) / 2) * WZ;
      cells.push({ x, z, d: Math.abs(x - CUT), burst: Math.abs(x - CUT) < burstW, jx: (r() - 0.5) * 0.3, jz: (r() - 0.5) * 0.08, ph: r() * 6.28 });
    }
    const cgeo = new THREE.CapsuleGeometry(0.16, L - 0.38, 4, 14); cgeo.rotateZ(Math.PI / 2); cgeo.scale(1, 0.62, 1.12);
    const mCell = new THREE.MeshStandardMaterial({ color: col(red ? '#ecd3ee' : '#f1ead0'), roughness: 0.32, metalness: 0, transparent: true, opacity: 0.62,
      emissive: col(pal.glow), emissiveIntensity: 0.12, depthWrite: false });
    const cellM = new THREE.InstancedMesh(cgeo, mCell, cells.length); scene.add(cellM);
    const nuc = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 16, 12), new THREE.MeshStandardMaterial({ color: col(red ? '#8a2f72' : '#8a6a2a'), roughness: 0.4 }), cells.length);
    scene.add(nuc);
    const eCol = P.enzyme || pal.accent2, sCol = P.sulfur || pal.accent;
    const dotGeo = new THREE.SphereGeometry(0.04, 12, 10);
    const mE = new THREE.MeshStandardMaterial({ color: col(eCol), emissive: col(eCol), emissiveIntensity: 0.6, roughness: 0.3 });
    const mS = new THREE.MeshStandardMaterial({ color: col(sCol), emissive: col(sCol), emissiveIntensity: 0.6, roughness: 0.3 });
    const dotsE = new THREE.InstancedMesh(dotGeo, mE, cells.length * 2), dotsS = new THREE.InstancedMesh(dotGeo, mS, cells.length * 2);
    scene.add(dotsE, dotsS);
    const dots = cells.flatMap((c, i) => [0, 1].map(k => ({
      c, e: { o: [(r() - 0.5) * 0.16, 0.05, (r() - 0.5) * 0.12], v: [(r() - 0.5) * 2.4, 0.8 + r() * 1.6, (r() - 0.5) * 1.6] },
      s: { o: [(k ? 1 : -1) * (0.26 + r() * 0.06), 0.04, (r() - 0.5) * 0.12], v: [(r() - 0.5) * 2.4, 0.8 + r() * 1.6, (r() - 0.5) * 1.6] } })));
    const shardGeo = new THREE.TetrahedronGeometry(0.1); shardGeo.scale(1.3, 0.35, 1);
    const burstCells = cells.filter(c => c.burst);
    const shards = burstCells.flatMap(c => Array.from({ length: 7 }, () => ({ c, o: [(r() - 0.5) * 0.7, 0.1, (r() - 0.5) * 0.25],
      v: [Math.sign(c.x - CUT || (r() - 0.5)) * (0.4 + r() * 1.4) + (r() - 0.5) * 0.6, 1.0 + r() * 1.9, (r() - 0.5) * 1.3], spin: [r() * 9, r() * 9, r() * 9] })));
    const shardM = new THREE.InstancedMesh(shardGeo, new THREE.MeshStandardMaterial({ color: col(red ? '#f3dcf3' : '#f4eed8'), roughness: 0.35, transparent: true, opacity: mode === 'mix' ? 0.35 : 0.8 }), Math.max(1, shards.length));
    scene.add(shardM);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: col(red ? '#4a1a40' : '#4a3a1a'), roughness: 0.85 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.03; scene.add(floor);
    scene.fog = new THREE.Fog(col(pal.bg[1]), 7, 19);
    // blade (cells / sharp)
    let blade = null, bladeEdge = null;
    if (mode === 'cells' || sharp) {
      const kk = onionKnife(pal, sharp ? pal.accent : '#ffffff');
      blade = new THREE.Group(); kk.g.scale.setScalar(0.8); kk.g.rotation.y = -Math.PI / 2; kk.g.position.z = 0.6; blade.add(kk.g);
      bladeEdge = kk.edge;
      blade.position.x = CUT; scene.add(blade);
    }
    let ghost = null, line = null;
    if (sharp) {
      ghost = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 9.6), new THREE.MeshBasicMaterial({ color: col(RED), transparent: true, opacity: 0, depthWrite: false }));
      ghost.rotation.x = -Math.PI / 2; ghost.position.set(CUT, 0.24, 0); scene.add(ghost);
      line = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 9.6), new THREE.MeshBasicMaterial({ color: col(pal.accent), transparent: true, opacity: 0, depthWrite: false }));
      line.rotation.x = -Math.PI / 2; line.position.set(CUT, 0.25, 0); scene.add(line);
    }
    // hero reaction (mix / gas): enzyme cloud + sulfur cloud above the burst line
    const HP = V3(CUT, 0.42, 0.0);
    const heroN = 16;
    const heroGeo = new THREE.SphereGeometry(0.06, 16, 12);
    const mHE = mE.clone(), mHS = mS.clone();
    const heroE = new THREE.InstancedMesh(heroGeo, mHE, heroN), heroS = new THREE.InstancedMesh(heroGeo, mHS, heroN);
    const hero = Array.from({ length: heroN }, () => ({ o: V3((r() - 0.5) * 0.3, (r() - 0.5) * 0.24, (r() - 0.5) * 0.3), ph: r() * 6.28, rad: 0.08 + r() * 0.2, sp: 1.5 + r() * 2 }));
    const membrane = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 24), new THREE.MeshStandardMaterial({ color: col(eCol), transparent: true, opacity: 0.22, roughness: 0.2, depthWrite: false }));
    const heroGlow = glowSprite(sCol, 1, 0);
    const E0 = HP.clone().add(V3(-0.5, 0.04, 0.08)), S0 = HP.clone().add(V3(0.5, 0, -0.06));
    if (mode === 'mix' || mode === 'gas') { scene.add(heroE, heroS, heroGlow); if (mode === 'mix') { membrane.position.copy(E0); scene.add(membrane); } }
    // gas molecules (C, C, S, O) rising
    const mols = [];
    let atomC = null, atomS = null, atomO = null;
    if (mode === 'gas') {
      const aG = new THREE.SphereGeometry(1, 16, 12);
      atomC = new THREE.InstancedMesh(aG, new THREE.MeshStandardMaterial({ color: col('#d8d8dc'), roughness: 0.35 }), 80);
      atomS = new THREE.InstancedMesh(aG, new THREE.MeshStandardMaterial({ color: col('#ffd23f'), emissive: col('#ffb000'), emissiveIntensity: 0.35, roughness: 0.3 }), 40);
      atomO = new THREE.InstancedMesh(aG, new THREE.MeshStandardMaterial({ color: col('#ff4b3a'), emissive: col('#ff2a10'), emissiveIntensity: 0.2, roughness: 0.3 }), 40);
      scene.add(atomC, atomS, atomO);
      for (let i = 0; i < 40; i++) {
        const lead = i < 6;
        const halo = glowSprite(gasCol, 0.7, 0); scene.add(halo);
        mols.push({ halo, x0: lead ? HP.x + (r() - 0.5) * 0.3 : CUT + (r() - 0.5) * 0.5, z0: lead ? HP.z + (r() - 0.5) * 0.3 : (r() - 0.5) * 6,
          y0: lead ? HP.y : 0.2, tb: lead ? 0.15 + i * 0.12 : 0.2 + r() * 2.2, vy: 0.75 + r() * 0.55, ph: r() * 6.28, sp: [r() * 3, r() * 3, r() * 3], sz: lead ? 1.25 : 0.9 + r() * 0.3 });
      }
    }
    const camDef = {
      cells: { dist: portrait ? 8.6 : 6.5, yaw: 62, pitch: 30, tx: CUT, ty: 0, tz: 0.5, fov: 34, sy: portrait ? 0.16 : 0, drift: 1.4 },
      sharp: { dist: portrait ? 7.4 : 6, yaw: -58, pitch: 34, tx: CUT, ty: 0, tz: 0.5, fov: 34, sy: portrait ? 0.16 : 0, drift: 1.4 },
      mix: { dist: portrait ? 4.8 : 3.4, yaw: 18, pitch: 18, tx: CUT, ty: HP.y, tz: 0, fov: 34, sy: portrait ? 0.14 : 0, drift: 1.6 },
      gas: { dist: portrait ? 5.6 : 4.4, yaw: 28, pitch: 4, tx: CUT, ty: 1.35, tz: 0, fov: 36, sy: portrait ? 0.08 : 0, drift: 1.8 },
    }[mode];
    const camAt = (lt, dur, env) => shotCam(Object.assign({}, P, { camera: Object.assign({}, camDef, P.camera || {}) }), env, lt, dur);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), eu = new THREE.Euler(), sc = V3(1, 1, 1), pos = V3(0, 0, 0);
    const ZERO = V3(0, 0, 0);
    const setI = (mesh, i, x, y, z, s, rx = 0, ry = 0, rz = 0) => {
      pos.set(x, y, z); eu.set(rx, ry, rz); q.setFromEuler(eu); if (typeof s === 'number') sc.setScalar(Math.max(0.0001, s)); else sc.copy(s);
      m4.compose(pos, q, sc); mesh.setMatrixAt(i, m4);
    };
    return {
      camAt,
      update(lt, dur, cues, env) {
        const t = env.t;
        const hit = cue(cues, 'hit', Math.min(1.2, dur * 0.4));
        applyCam(camera, camAt(lt, dur, env), W, H);
        const live = mode === 'cells' || sharp;
        const tb0 = live ? hit : -30;                         // burst moment (mix / gas: long ago)
        const sq = live ? progIO(lt, hit, 0.3) : 1;
        cells.forEach((c, i) => {
          const tb = tb0 + Math.abs(c.z) * 0.015;
          let s = 1, sy = 1, dx = 0;
          if (c.burst) s = lt < tb ? 1 + 0.1 * clamp01((lt - tb + 0.25) / 0.25) : lt < tb + 0.09 ? 1.25 + (lt - tb) * 3 : 0;
          else if (squashW && c.d < squashW) { const k = Math.exp(-(c.d - burstW) / 0.6); sy = 1 - 0.4 * sq * k; dx = Math.sign(c.x - CUT) * 0.12 * sq * k; }
          const wob = 1 + 0.025 * Math.sin(t * 2.2 + c.ph);
          sc.set(s * wob, s * sy * wob, s * wob);
          setI(cellM, i, c.x + dx, 0.1 * sy, c.z, sc);
          setI(nuc, i, c.x + dx + c.jx, 0.12 * sy, c.z + c.jz, s > 0 ? 1 : 0);
        });
        cellM.instanceMatrix.needsUpdate = true; nuc.instanceMatrix.needsUpdate = true;
        dots.forEach((d, j) => {
          const c = d.c, tb = tb0 + Math.abs(c.z) * 0.015;
          for (const [mesh, D] of [[dotsE, d.e], [dotsS, d.s]]) {
            const p0 = [c.x + D.o[0], 0.1 + D.o[1], c.z + D.o[2]];
            if (c.burst && lt >= tb) {
              const f = onionFlight(p0, D.v, lt - tb, 0.02);
              setI(mesh, j, f[0], f[1], f[2], mode === 'mix' ? 0 : 1.15);
            } else {
              const jig = 0.025 * Math.sin(t * 3 + c.ph + j);
              setI(mesh, j, p0[0] + jig, p0[1] + (c.burst ? 0 : 0) , p0[2] + jig * 0.5, c.burst || c.d >= squashW || !squashW ? 1 : 1 - 0.3 * sq);
            }
          }
        });
        dotsE.instanceMatrix.needsUpdate = true; dotsS.instanceMatrix.needsUpdate = true;
        const glowDots = 0.5 + 0.3 * Math.sin(t * 3) + (live ? 0.8 * punch(lt, hit, 1) : 0);
        mE.emissiveIntensity = glowDots; mS.emissiveIntensity = glowDots;
        shards.forEach((sh, k) => {
          const tb = tb0 + Math.abs(sh.c.z) * 0.015;
          if (lt < tb) { setI(shardM, k, 0, -5, 0, 0); return; }
          const a = lt - tb, f = onionFlight([sh.c.x + sh.o[0], sh.o[1], sh.c.z + sh.o[2]], sh.v, a, 0.03);
          const ra = Math.min(a, 1.2);
          setI(shardM, k, f[0], f[1], f[2], 1, sh.spin[0] * ra, sh.spin[1] * ra, f[3] ? sh.spin[2] * ra : 0);
        });
        shardM.instanceMatrix.needsUpdate = true;
        mCell.emissiveIntensity = 0.12 + (live ? 0.4 * punch(lt, hit, 0.8) : 0) - (mode === 'mix' ? 0.08 : 0);
        if (blade) {
          const kd = clamp01((lt - 0.05) / Math.max(0.2, hit - 0.05)), up = progIO(lt, hit + 0.7, 0.9);
          blade.position.y = lerp(2.6, 0.02, kd * kd) + 3.2 * up + 0.04 * punch(lt, hit, 0.4);
          bladeEdge.material.opacity = 0.6 + 0.4 * Math.sin(t * 6);
        }
        const anchors = { blade: blade ? V3(CUT, 0.25, 0.6) : null, ghost: ghost ? V3(CUT - 0.7, 0.25, 0.6) : null };
        if (ghost) {
          ghost.material.opacity = 0.32 * prog(lt, 0.1, 0.4) * (1 - 0.55 * prog(lt, hit, 0.5)) * (0.85 + 0.15 * Math.sin(t * 5));
          line.material.opacity = 0.95 * prog(lt, hit, 0.3) * (0.8 + 0.2 * Math.sin(t * 6));
        }
        if (mode === 'mix' || mode === 'gas') {
          const mx = mode === 'mix' ? progIO(lt, hit - 0.55, 0.6) : 1;
          const after = mode === 'mix' ? prog(lt, hit, 0.5) : 1;
          const fade = mode === 'gas' ? 1 - prog(lt, 0.4, 2.2) * 0.6 : 1;
          const cE = col(eCol), cS = col(sCol), cM = col('#fff6c8');
          mHE.color.copy(cE).lerp(cM, after * 0.35); mHE.emissive.copy(mHE.color); mHS.color.copy(cS).lerp(cM, after * 0.35); mHS.emissive.copy(mHS.color);
          mHE.emissiveIntensity = mHS.emissiveIntensity = 0.5 + 0.5 * (mode === 'mix' ? punch(lt, hit, 0.9) : 0) + 0.2 * Math.sin(t * 5);
          hero.forEach((h, i) => {
            const sw = t * h.sp + h.ph;
            const swirl = V3(Math.cos(sw) * h.rad, Math.sin(sw * 1.3) * h.rad * 0.6, Math.sin(sw) * h.rad);
            const jit = V3(Math.sin(t * 2.5 + h.ph) * 0.03, Math.cos(t * 2.1 + h.ph) * 0.03, 0);
            const pe = E0.clone().add(h.o).add(jit).lerp(HP.clone().add(swirl), mx);
            const ps = S0.clone().add(h.o).add(jit).lerp(HP.clone().add(swirl.clone().multiplyScalar(-1)), mx);
            setI(heroE, i, pe.x, pe.y, pe.z, fade); setI(heroS, i, ps.x, ps.y, ps.z, fade);
          });
          heroE.instanceMatrix.needsUpdate = true; heroS.instanceMatrix.needsUpdate = true;
          membrane.scale.setScalar(1 + 0.04 * Math.sin(t * 3)); membrane.material.opacity = 0.22 * (1 - prog(lt, hit - 0.75, 0.25));
          membrane.visible = membrane.material.opacity > 0.01;
          heroGlow.position.copy(HP); heroGlow.material.color.copy(cS).lerp(cM, after);
          heroGlow.scale.setScalar(0.6 + 1.2 * after + 0.4 * (mode === 'mix' ? punch(lt, hit, 0.8) : 0));
          heroGlow.material.opacity = Math.min(0.45, (mode === 'mix' ? 0.2 + 0.25 * after : 0.4 * fade) * (0.85 + 0.15 * Math.sin(t * 4)));
          anchors.enzyme = E0.clone().lerp(HP, mx).add(V3(0, 0.12, 0)); anchors.sulfur = S0.clone().lerp(HP, mx).add(V3(0, 0.12, 0));
        }
        if (mode === 'gas') {
          const rise = prog(lt, hit - 0.3, 0.8);
          let lead = null;
          mols.forEach((m, i) => {
            const a = lt - m.tb;
            if (a < 0) {
              for (const k of [0, 1]) setI(atomC, i * 2 + k, 0, -9, 0, 0);
              setI(atomS, i, 0, -9, 0, 0); setI(atomO, i, 0, -9, 0, 0); m.halo.material.opacity = 0; return;
            }
            const sp = 1 + 0.6 * rise;
            const y = m.y0 + m.vy * a * sp + 0.12 * a * a;
            const x = m.x0 + 0.25 * Math.sin(a * 1.4 + m.ph), z = m.z0 + 0.2 * Math.cos(a * 1.1 + m.ph);
            const s = m.sz * spring(lt, m.tb, 0.5);
            eu.set(m.sp[0] * t, m.sp[1] * t, m.sp[2] * t); q.setFromEuler(eu);
            const atom = (mesh, idx, ox, oy, oz, rad) => { const v = V3(ox, oy, oz).multiplyScalar(s).applyQuaternion(q); sc.setScalar(Math.max(0.0001, rad * s)); m4.compose(pos.set(x + v.x, y + v.y, z + v.z), q, sc); mesh.setMatrixAt(idx, m4); };
            atom(atomS, i, 0, 0, 0, 0.075); atom(atomO, i, 0.12, 0.07, 0, 0.06);
            atom(atomC, i * 2, -0.13, 0.03, 0.03, 0.065); atom(atomC, i * 2 + 1, -0.22, -0.09, -0.02, 0.065);
            m.halo.position.set(x, y, z); m.halo.scale.setScalar(0.55 * s + 0.1 * Math.sin(t * 3 + m.ph));
            m.halo.material.opacity = 0.5 * clamp01(a * 3);
          });
          for (const mesh of [atomC, atomS, atomO]) mesh.instanceMatrix.needsUpdate = true;
          anchors.gas = V3(HP.x + 0.05, 1.05, HP.z);   // a fixed point inside the rising stream: molecules keep passing through it
        }
        if (mode === 'mix') placeLabels(lt, dur, cues, anchors, [0.15, hit + 0.35]);
        else if (mode === 'gas') placeLabels(lt, dur, cues, anchors, [hit + 0.2]);
        else if (sharp) placeLabels(lt, dur, cues, anchors, [hit + 0.2]);
        else placeLabels(lt, dur, cues, anchors, [hit]);
        dust.rotation.y = t * 0.03; dust.position.y = 0.1 * Math.sin(t * 0.4);
        back.material.opacity = 0.3 + 0.1 * Math.sin(t * 1.2);
      },
    };
  },
};

// clockface: a big 3D analogue clock (brass bezel, cream dial, hands). A soft gnomon-like "ghost shadow" wedge
// travels around the dial with the minute hand, and a direction arc sweeps over the top from 9 to 3 (clockwise).
// With reverse: true the numerals run the other way, the hands turn counter-clockwise and the arc is red.
// P: {mode: "clock"|"pair" (pair: a top-down sundial above the clock, shadow and hour hand turn together),
//     reverse: false, shadow: true, arc: true, turns: 1.2 (minute-hand turns over the scene),
//     label: "SAAT YÖNÜ" | "" , sub, camera: {...}}
// cues: hit (arc lands + label punches)
'use strict';

function cfTex(w, h, paint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

SHOTS.clockface = {
  kind: '3d',
  build(ctx) {
    const { P, scene, camera, pal, W, H, labels } = ctx;
    const portrait = H > W, rev = !!P.reverse, dirS = rev ? -1 : 1, r = rng(31);
    const R = 2.0;
    const accent = rev ? RED : pal.accent;
    scene.add(new THREE.HemisphereLight(0xfff3e6, col(shade(pal.bg[1], -0.3)), 1.0));
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-4, 5, 7); scene.add(key);
    const rimL = new THREE.PointLight(col(pal.accent2), 40, 20); rimL.position.set(3.5, 3, -2); scene.add(rimL);
    const back = glowSprite(pal.glow, portrait ? 13 : 16, 0.42); back.position.set(0, 0, -3); scene.add(back);
    const back2 = glowSprite(accent, 6, 0.0); back2.position.set(0, 0, -1.5); scene.add(back2);
    // floating dust (depth)
    const dustN = 200, dpos = new Float32Array(dustN * 3);
    for (let i = 0; i < dustN; i++) dpos.set([(r() - 0.5) * 12, (r() - 0.5) * 14, -4 + r() * 8], i * 3);
    const dgeo = new THREE.BufferGeometry(); dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
    const dust = new THREE.Points(dgeo, new THREE.PointsMaterial({ color: col(pal.accent2), size: 0.035, transparent: true, opacity: 0.5, depthWrite: false }));
    scene.add(dust);

    const group = new THREE.Group(); scene.add(group);
    // dial face
    const faceTex = cfTex(1024, 1024, (g, w, h) => {
      const gr = g.createRadialGradient(w * 0.42, h * 0.38, 40, w / 2, h / 2, w * 0.55);
      gr.addColorStop(0, '#fbf3df'); gr.addColorStop(0.75, '#efe0bd'); gr.addColorStop(1, '#cdb486');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      g.strokeStyle = '#3a2a16'; g.lineCap = 'round';
      for (let k = 0; k < 60; k++) {
        const a = k / 60 * Math.PI * 2, big = k % 5 === 0;
        g.lineWidth = big ? 12 : 4;
        const r0 = big ? 0.4 : 0.44, r1 = 0.475;
        g.beginPath(); g.moveTo(cx + Math.sin(a) * r0 * w, cy - Math.cos(a) * r0 * h); g.lineTo(cx + Math.sin(a) * r1 * w, cy - Math.cos(a) * r1 * h); g.stroke();
      }
      g.fillStyle = '#2a1d0e'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let n = 1; n <= 12; n++) {
        const a = dirS * n / 12 * Math.PI * 2, main = n % 3 === 0;
        g.font = `${main ? 900 : 800} ${main ? 118 : 74}px Inter`;
        g.fillText(String(n), cx + Math.sin(a) * 0.33 * w, cy - Math.cos(a) * 0.33 * h + 4);
      }
    });
    const mFace = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.55, emissive: col(pal.accent2), emissiveIntensity: 0.06 });
    const face = new THREE.Mesh(new THREE.CircleGeometry(R, 96), mFace); group.add(face);
    const mBrass = new THREE.MeshStandardMaterial({ color: col('#c79a4a'), roughness: 0.28, metalness: 0.8, emissive: col(pal.accent), emissiveIntensity: 0.06 });
    const bezel = new THREE.Mesh(new THREE.TorusGeometry(R + 0.08, 0.14, 20, 128), mBrass); bezel.position.z = 0.05; group.add(bezel);
    const backPlate = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.12, R + 0.12, 0.3, 96), new THREE.MeshStandardMaterial({ color: col('#4a2f18'), roughness: 0.6 }));
    backPlate.rotation.x = Math.PI / 2; backPlate.position.z = -0.16; group.add(backPlate);
    // ghost shadow: a long soft wedge from the centre (like a gnomon's shadow on a dial)
    const wedgeTex = cfTex(128, 512, (g, w, h) => {
      const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, 'rgba(0,0,0,.95)'); gr.addColorStop(1, 'rgba(0,0,0,.15)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(w * 0.5 - 22, h); g.lineTo(w * 0.5 - 5, 0); g.lineTo(w * 0.5 + 5, 0); g.lineTo(w * 0.5 + 22, h); g.closePath(); g.fill();
    });
    const wedgeGeo = new THREE.PlaneGeometry(0.5, R * 0.92); wedgeGeo.translate(0, R * 0.46, 0);
    const wedge = new THREE.Mesh(wedgeGeo, new THREE.MeshBasicMaterial({ map: wedgeTex, color: col('#3a2408'), transparent: true, opacity: 0, depthWrite: false }));
    wedge.position.z = 0.012; group.add(wedge);
    // direction arc over the top (from 9 to 3 o'clock, or the other way when reversed)
    const arcR = R + 0.42, arcN = 80, arcW = 0.11;
    const arcPos = new Float32Array((arcN - 1) * 6 * 3);
    const arcAng = i => (-Math.PI / 2 + Math.PI * i / (arcN - 1)) * dirS;   // clock angle from 12, clockwise positive
    const P2 = (a, rr) => [Math.sin(a) * rr, Math.cos(a) * rr];
    for (let i = 0; i < arcN - 1; i++) {
      const a0 = arcAng(i), a1 = arcAng(i + 1);
      const q = [P2(a0, arcR - arcW), P2(a0, arcR + arcW), P2(a1, arcR + arcW), P2(a1, arcR - arcW)];
      [q[0], q[1], q[2], q[0], q[2], q[3]].forEach((v, k) => arcPos.set([v[0], v[1], 0], (i * 6 + k) * 3));
    }
    const arcGeo = new THREE.BufferGeometry(); arcGeo.setAttribute('position', new THREE.BufferAttribute(arcPos, 3));
    const arc = new THREE.Mesh(arcGeo, new THREE.MeshBasicMaterial({ color: col(accent), side: THREE.DoubleSide, transparent: true, depthWrite: false }));
    arc.position.z = 0.2; group.add(arc);
    const headGeo = new THREE.BufferGeometry();
    headGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0.36, 0, -0.3, -0.12, 0, 0.3, -0.12, 0]), 3));
    const head = new THREE.Mesh(headGeo, new THREE.MeshBasicMaterial({ color: col(accent), side: THREE.DoubleSide, depthWrite: false })); head.position.z = 0.2; group.add(head);
    const headGlow = glowSprite(accent, 1.4, 0); group.add(headGlow);
    // hands
    const hand = (len, wid, th, color, z) => {
      const g = new THREE.Group();
      const sh = new THREE.Shape(); sh.moveTo(-wid / 2, -len * 0.18); sh.lineTo(wid / 2, -len * 0.18); sh.lineTo(wid * 0.22, len); sh.lineTo(-wid * 0.22, len); sh.closePath();
      const geo = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false });
      g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col(color), roughness: 0.35, metalness: 0.4 })));
      g.position.z = z; group.add(g); return g;
    };
    const hourH = hand(R * 0.52, 0.2, 0.05, '#1e140a', 0.06), minH = hand(R * 0.8, 0.13, 0.05, '#1e140a', 0.12);
    const secH = hand(R * 0.86, 0.045, 0.02, rev ? RED : pal.accent, 0.18);
    const capM = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 32), mBrass); capM.rotation.x = Math.PI / 2; capM.position.z = 0.22; group.add(capM);
    const glint = glowSprite('#ffffff', 2.2, 0.12); glint.position.set(-0.9, 1.0, 0.35); group.add(glint);

    const lbl = labels.add('layer');
    // ---------------------------------------------------------------- pair: top-down sundial (north up) above the clock
    const pair = P.mode === 'pair';
    let top = null, sdWedge = null, arc2 = null, head2 = null, glow2 = null, lblS = null, lblEq = null;
    const PK = 0.55, CLK = V3(-0.95, 0.13, 0), TOP = V3(-0.95, 3.28, 0);
    if (pair) {
      top = new THREE.Group(); top.position.copy(TOP); top.scale.setScalar(PK); scene.add(top);
      const sdT = cfTex(1024, 1024, (g, w, h) => {
        const cx = w / 2, cy = h / 2;
        const gr = g.createRadialGradient(w * 0.42, h * 0.38, 40, cx, cy, w * 0.55);
        gr.addColorStop(0, '#dcb46a'); gr.addColorStop(0.7, '#b98a43'); gr.addColorStop(1, '#7c5627');
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
        g.strokeStyle = 'rgba(55,30,8,.9)'; g.lineCap = 'round';
        for (let k = -6; k <= 6; k++) {          // hour lines VI..XII..VI over the north half
          const a = k / 6 * Math.PI / 2; g.lineWidth = k % 3 ? 6 : 12;
          g.beginPath(); g.moveTo(cx + Math.sin(a) * 0.08 * w, cy - Math.cos(a) * 0.08 * h); g.lineTo(cx + Math.sin(a) * 0.4 * w, cy - Math.cos(a) * 0.4 * h); g.stroke();
        }
        g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, 0.45 * w, 0, 7); g.stroke();
        g.fillStyle = 'rgba(55,30,8,.95)'; g.font = '900 96px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText('K', cx, cy - 0.33 * h + 40); g.fillText('B', cx - 0.33 * w + 10, cy + 70); g.fillText('D', cx + 0.33 * w - 10, cy + 70);
      });
      top.add(new THREE.Mesh(new THREE.CircleGeometry(R, 96), new THREE.MeshStandardMaterial({ map: sdT, roughness: 0.45, metalness: 0.4, emissive: col(pal.accent), emissiveIntensity: 0.05 })));
      const bz = new THREE.Mesh(new THREE.TorusGeometry(R + 0.08, 0.14, 20, 128), mBrass); bz.position.z = 0.05; top.add(bz);
      const gn = new THREE.Mesh(new THREE.BoxGeometry(0.09, R * 0.62, 0.4), mBrass); gn.position.set(0, R * 0.31, 0.2); top.add(gn);
      sdWedge = new THREE.Mesh(wedgeGeo, new THREE.MeshBasicMaterial({ map: wedgeTex, color: col('#1a0d03'), transparent: true, opacity: 0.85, depthWrite: false }));
      sdWedge.position.z = 0.015; top.add(sdWedge);
      arc2 = arc.clone(); head2 = head.clone(); glow2 = glowSprite(accent, 1.4, 0);
      top.add(arc2); top.add(head2); top.add(glow2);
      lblS = labels.add('layer'); lblEq = labels.add('layer');
    }
    const camAt = (lt, dur, env) => shotCam(Object.assign({}, P, { camera: Object.assign({ dist: portrait ? 21 : 11, yaw: rev ? -14 : 14, pitch: 6, ty: 0, sy: portrait ? 0.3 : 0, fov: 34, drift: rev ? -1.2 : 1.2 }, pair ? { dist: 21, yaw: 0, pitch: 0, ty: 0, sy: 0, drift: 0.6, move: 0.5 } : {}, P.camera || {}) }), null, lt, dur);
    return {
      camAt,
      update(lt, dur, cues, env) {
        const t = env.t, hit = cue(cues, 'hit', Math.min(1.4, dur * 0.45));
        applyCam(camera, camAt(lt, dur, env), W, H);
        const pk = punch(lt, hit, 0.8);
        group.scale.setScalar((pair ? PK : 1) * spring(lt, 0, 0.7) * (1 + 0.04 * pk)); if (pair) group.position.copy(CLK);
        group.rotation.y = 0.05 * Math.sin(t * 0.6);
        // hands: minute hand turns `turns` times over the scene, accelerating a little after the hit
        const turns = P.turns != null ? P.turns : 1.2;
        const m = turns * (lt / Math.max(1, dur)) + 0.12 * prog(lt, hit, 0.6);
        const ma = dirS * (m * Math.PI * 2 + 1.7), ha = dirS * ((m / 12) * Math.PI * 2 + 2.9), sa = dirS * lt * 2.4 * Math.PI;
        minH.rotation.z = -ma; hourH.rotation.z = -ha; secH.rotation.z = -sa;
        // ghost shadow trails the minute hand
        wedge.rotation.z = -(ma - dirS * 0.22); wedge.material.opacity = P.shadow === false ? 0 : (0.55 + 0.15 * pk) * prog(lt, 0.2, 0.6);
        // arc grows over the top, landing at the hit
        const f = P.arc === false ? 0 : progIO(lt, Math.max(0.1, hit - 0.9), 1.0);
        const n = Math.max(0, Math.round(f * (arcN - 1)));
        arcGeo.setDrawRange(0, n * 6); arc.material.opacity = clamp01(f * 6);
        const ea = arcAng(Math.max(1, n)), [hx, hy] = P2(ea, arcR);
        head.position.set(hx, hy, 0.2); head.rotation.z = -ea - dirS * Math.PI / 2; head.scale.setScalar(clamp01(f * 6) * (1 + 0.5 * pk));
        headGlow.position.set(hx, hy, 0.25); headGlow.material.opacity = clamp01(f * 6) * (0.5 + 0.5 * pk); headGlow.scale.setScalar(1.3 + 0.8 * pk);
        if (pair) {
          // one shared clock-angle: west (9) -> north (12) -> east (3) for the shadow AND the hour hand
          const u = progIO(lt, 0.1, Math.max(0.9, hit + 0.3)), A = -Math.PI / 2 + Math.PI * u;
          hourH.rotation.z = -A; minH.rotation.z = -(A * 12); wedge.material.opacity = 0;
          sdWedge.rotation.z = -A; sdWedge.material.opacity = 0.85 * prog(lt, 0.05, 0.4);
          top.scale.setScalar(PK * spring(lt, 0.1, 0.7) * (1 + 0.04 * pk));
          const n2 = Math.max(0, Math.round(u * (arcN - 1)));
          arcGeo.setDrawRange(0, n2 * 6); arc.material.opacity = clamp01(u * 6);
          const ea2 = arcAng(Math.max(1, n2)), [qx, qy] = P2(ea2, arcR);
          for (const hd of [head, head2]) { hd.position.set(qx, qy, 0.2); hd.rotation.z = -ea2 - Math.PI / 2; hd.scale.setScalar(clamp01(u * 6) * (1 + 0.5 * pk)); }
          for (const gl of [headGlow, glow2]) { gl.position.set(qx, qy, 0.25); gl.material.opacity = clamp01(u * 6) * (0.5 + 0.5 * pk); gl.scale.setScalar(1.3 + 0.8 * pk); }
          const big = portrait ? 100 : 84;
          const put = (l, text, wp, at, color) => {
            const a = clamp01(spring(lt, at, 0.5) * 1.4), sc = toScreen(wp, camera, W, H);
            l.set(`<b style="font-size:${big}px;line-height:1;color:${color};text-shadow:0 4px 24px rgba(0,0,0,.6)">${text}</b>`, Math.min(W - 170, sc[0]), sc[1] + 24 * (1 - a), a, null, 0);
          };
          put(lblS, P.top_label || 'GÖLGE', V3(TOP.x + 2.65, TOP.y, 0), 0.2, pal.ink);
          put(lbl, P.label || 'İBRE', V3(CLK.x + 2.65, CLK.y, 0), 0.5, pal.ink);
          put(lblEq, '= AYNI YÖN', V3(CLK.x + 2.65, (TOP.y + CLK.y) / 2, 0), hit, accent);
        }
        back2.material.opacity = 0.25 * prog(lt, hit, 0.5) + 0.25 * pk;
        back.material.opacity = 0.38 + 0.08 * Math.sin(t * 1.3);
        mFace.emissiveIntensity = 0.06 + 0.12 * pk;
        glint.position.x = -0.9 + 0.3 * Math.sin(t * 0.7);
        dust.rotation.z = t * 0.02; dust.position.y = 0.2 * Math.sin(t * 0.3);
        // label above the clock
        const text = P.label != null ? P.label : (rev ? 'TERS YÖN' : 'SAAT YÖNÜ');
        if (pair) { /* labels placed above */ } else if (text) {
          const a = clamp01(spring(lt, hit, 0.5) * 1.4), sz = 1 + 0.1 * pk;
          const html = `<b style="font-size:${portrait ? 104 : 84}px;line-height:1;color:${accent};transform:scale(${sz.toFixed(3)});text-shadow:0 4px 24px rgba(0,0,0,.6)">${text}</b>` + (P.sub ? `<small style="font-size:46px">${P.sub}</small>` : '');
          const sc = toScreen(V3(0, -(R + 0.62), 0), camera, W, H);
          lbl.set(html, W / 2, Math.min(portrait ? 1085 : H * 0.8, sc[1] + 50) + 30 * (1 - a), a, null, 0);
        } else lbl.set('', 0, 0, 0);
      },
    };
  },
};

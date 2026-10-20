import * as T from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { LabId } from "@/components/labs/labs-meta";

type Update = (time: number) => void;
const PALETTE: Record<LabId, [string, string, string]> = {
  sleep: ["#c9d9e8", "#667fc1", "#ffd995"],
  energy: ["#f5d7b8", "#ed9657", "#ffe6a0"],
  stress: ["#e9cbd8", "#bf709b", "#ffc3b2"],
  hydration: ["#c5e5e8", "#479fc0", "#b1eadf"],
  sound: ["#d5d2e9", "#8374bc", "#e8ddfa"],
  focus: ["#d2e5dc", "#518f7e", "#ffc3a6"],
  breath: ["#d0e8e3", "#67b5a7", "#e9f4e9"],
  caffeine: ["#efd8c7", "#cb815e", "#fff0d7"],
  vision: ["#dce3c6", "#7d9d76", "#f4b09a"],
};

/** Original, stylized models. These covers are illustration, not anatomy/data. */
function model(id: LabId) {
  const root = new T.Group();
  const updates: Update[] = [];
  const [, primary, accent] = PALETTE[id];
  const material = (color: string, roughness = 0.35) =>
    new T.MeshStandardMaterial({ color, roughness, metalness: 0.03 });
  const main = material(primary),
    light = material(accent),
    ivory = material("#fff5e5");
  const mesh = (
    geometry: T.BufferGeometry,
    mat: T.Material,
    parent: T.Object3D = root,
  ) => {
    const object = new T.Mesh(geometry, mat);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  };
  const box = (
    w: number,
    h: number,
    d: number,
    mat: T.Material,
    parent = root,
    radius = 0.12,
  ) => mesh(new RoundedBoxGeometry(w, h, d, 4, radius), mat, parent);
  const ball = (r: number, mat: T.Material, parent = root) =>
    mesh(new T.SphereGeometry(r, 40, 28), mat, parent);
  const ring = (r: number, tube: number, mat: T.Material, parent = root) =>
    mesh(new T.TorusGeometry(r, tube, 16, 72), mat, parent);
  const line = (
    points: number[][],
    radius: number,
    mat: T.Material,
    parent = root,
    closed = false,
  ) =>
    mesh(
      new T.TubeGeometry(
        new T.CatmullRomCurve3(
          points.map((p) => new T.Vector3(p[0], p[1], p[2])),
          closed,
        ),
        64,
        radius,
        12,
        closed,
      ),
      mat,
      parent,
    );
  const extrude = (
    points: number[][],
    depth: number,
    mat: T.Material,
    parent = root,
  ) => {
    const shape = new T.Shape(points.map((p) => new T.Vector2(p[0], p[1])));
    return mesh(
      new T.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelSize: 0.055,
        bevelThickness: 0.055,
        bevelSegments: 4,
        steps: 1,
      }),
      mat,
      parent,
    );
  };

  if (id === "sleep") {
    const pillow = box(2.25, 0.42, 1.45, ivory, root, 0.2);
    pillow.position.y = -0.85;
    pillow.rotation.y = -0.13;
    const seam = line(
      [
        [-1, -0.85, -0.58],
        [-1.1, -0.85, 0],
        [-0.95, -0.85, 0.6],
        [0, -0.85, 0.7],
        [0.96, -0.85, 0.6],
        [1.1, -0.85, 0],
        [0.96, -0.85, -0.6],
        [0, -0.85, -0.7],
      ],
      0.015,
      light,
      root,
      true,
    );
    seam.rotation.y = -0.13;
    const shape = new T.Shape();
    shape.moveTo(0.35, 0.95);
    shape.bezierCurveTo(-1.05, 1.12, -1.35, -0.75, -0.15, -0.93);
    shape.bezierCurveTo(0.33, -1.02, 0.76, -0.65, 0.84, -0.35);
    shape.bezierCurveTo(-0.17, -0.65, -0.55, 0.45, 0.35, 0.95);
    const moon = mesh(
      new T.ExtrudeGeometry(shape, {
        depth: 0.26,
        bevelEnabled: true,
        bevelSize: 0.08,
        bevelThickness: 0.08,
        bevelSegments: 5,
        curveSegments: 48,
      }),
      light,
    );
    moon.position.set(0.15, 0.45, 0);
    moon.scale.setScalar(0.8);
    moon.rotation.z = -0.15;
    const littleStar = new T.Group();
    root.add(littleStar);
    littleStar.position.set(1.05, 0.85, 0.1);
    const points = Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      const r = i % 2 ? 0.09 : 0.3;
      return [Math.cos(a) * r, Math.sin(a) * r];
    });
    extrude(points, 0.07, ivory, littleStar);
    updates.push((t) => {
      moon.rotation.y = 0.15 + Math.sin(t * 0.5) * 0.22;
      moon.position.y = 0.4 + Math.sin(t * 0.75) * 0.12;
      littleStar.rotation.y = t * 0.25;
      littleStar.position.y = 0.85 + Math.sin(t * 0.75 + 1) * 0.1;
    });
  } else if (id === "energy") {
    const battery = new T.Group();
    root.add(battery);
    battery.rotation.z = -0.16;
    box(1.35, 2.05, 0.62, main, battery, 0.22);
    const panel = box(1.08, 1.65, 0.12, light, battery, 0.16);
    panel.position.z = 0.35;
    const terminal = box(0.58, 0.24, 0.35, ivory, battery, 0.08);
    terminal.position.y = 1.12;
    const bolt = extrude(
      [
        [0.12, 0.68],
        [-0.4, -0.05],
        [-0.02, -0.05],
        [-0.18, -0.67],
        [0.43, 0.13],
        [0.06, 0.13],
      ],
      0.16,
      ivory,
      battery,
    );
    bolt.position.z = 0.43;
    const charges = Array.from({ length: 3 }, (_, i) => {
      const b = box(0.32, 0.12, 0.12, light);
      b.position.set(1.08, -0.45 + i * 0.38, 0);
      return b;
    });
    updates.push((t) => {
      battery.rotation.y = -0.12 + Math.sin(t * 0.55) * 0.3;
      battery.position.y = Math.sin(t * 0.85) * 0.1;
      charges.forEach((b, i) => {
        b.scale.setScalar(0.85 + 0.15 * Math.sin(t * 2 - i));
        b.position.x = 1.07 + 0.08 * Math.sin(t * 1.3 - i * 0.5);
      });
    });
  } else if (id === "stress") {
    // A single continuous silicone loop, with no intersecting central object.
    const silicone = material("#b86483", 0.3);
    const knot = mesh(
      new T.TorusKnotGeometry(0.69, 0.245, 240, 32, 2, 3),
      silicone,
    );
    knot.rotation.set(0.3, -0.2, -0.35);
    updates.push((t) => {
      const pressure = (1 - Math.cos(t * Math.PI / 3.5)) / 2;
      knot.scale.set(1 + pressure * 0.12, 1 - pressure * 0.2, 1 + pressure * 0.06);
      knot.rotation.y = -0.2 + Math.sin(t * 0.32) * 0.28;
      knot.rotation.z = -0.35 + Math.sin(t * 0.45) * 0.07;
      knot.position.y = 0.08 + Math.sin(t * 0.7) * 0.06;
    });
  } else if (id === "hydration") {
    const bottle = new T.Group();
    root.add(bottle);
    bottle.rotation.z = -0.12;
    const profile = [
      [0, -1],
      [0.46, -1],
      [0.57, -0.89],
      [0.58, 0.45],
      [0.5, 0.65],
      [0.29, 0.85],
      [0.27, 1.02],
    ].map((p) => new T.Vector2(p[0], p[1]));
    mesh(new T.LatheGeometry(profile, 64), main, bottle);
    const collar = mesh(
      new T.CylinderGeometry(0.29, 0.29, 0.16, 48),
      light,
      bottle,
    );
    collar.position.y = 0.94;
    const cap = mesh(
      new T.CylinderGeometry(0.32, 0.32, 0.22, 48),
      ivory,
      bottle,
    );
    cap.position.y = 1.1;
    for (let i = 0; i < 18; i++) {
      const rib = box(0.028, 0.15, 0.04, light, bottle, 0.012);
      const a = (i * Math.PI) / 9;
      rib.position.set(Math.cos(a) * 0.318, 1.1, Math.sin(a) * 0.318);
      rib.rotation.y = -a;
    }
    const band = mesh(
      new T.CylinderGeometry(0.585, 0.585, 0.5, 64),
      light,
      bottle,
    );
    band.position.y = -0.15;
    const drop = mesh(
      new T.LatheGeometry(
        [
          [0, -0.4],
          [0.25, -0.34],
          [0.34, -0.12],
          [0.25, 0.15],
          [0.06, 0.5],
          [0, 0.6],
        ].map((p) => new T.Vector2(p[0], p[1])),
        48,
      ),
      light,
    );
    drop.position.set(1, 0.25, 0.15);
    updates.push((t) => {
      bottle.rotation.y = Math.sin(t * 0.6) * 0.35;
      drop.position.y = 0.25 + Math.sin(t * 1.2) * 0.18;
      drop.scale.y = 1 + 0.08 * Math.sin(t * 1.2);
    });
  } else if (id === "sound") {
    const headset = new T.Group();
    root.add(headset);
    headset.rotation.z = -0.13;
    const shellMaterial = material("#aca4cd", 0.28);
    const cushionMaterial = material("#59546e", 0.82);
    const fabricMaterial = material("#393647", 0.95);
    const metal = new T.MeshStandardMaterial({
      color: "#c7c3da", roughness: 0.3, metalness: 0.65,
    });

    // A broad, curved band with a separate padded underside.
    const bandShape = new T.Shape();
    bandShape.absarc(0, 0.12, 1.02, 0, Math.PI, false);
    bandShape.absarc(0, 0.12, 0.91, Math.PI, 0, true);
    bandShape.closePath();
    const band = mesh(new T.ExtrudeGeometry(bandShape, {
      depth: 0.25, bevelEnabled: true, bevelSize: 0.035,
      bevelThickness: 0.035, bevelSegments: 5, curveSegments: 64,
    }), shellMaterial, headset);
    band.position.z = -0.125;
    const padPoints = Array.from({length: 49}, (_, i) => {
      const angle = 0.28 + i / 48 * (Math.PI - 0.56);
      return [Math.cos(angle) * 0.88, 0.12 + Math.sin(angle) * 0.88, 0];
    });
    const padding = line(padPoints, 0.065, cushionMaterial, headset);
    padding.scale.z = 1.8;

    const cups = [-1, 1].map((side) => {
      const g = new T.Group();
      g.position.set(side * 0.94, -0.39, 0);
      g.rotation.y = -side * 1.05;
      g.rotation.z = side * 0.08;
      headset.add(g);
      const shell = ball(1, shellMaterial, g);
      shell.scale.set(0.39, 0.55, 0.22);
      shell.position.z = -0.055;
      const seam = ring(0.337, 0.018, metal, g);
      seam.scale.y = 1.42;
      seam.position.z = 0.055;
      const cushion = ring(0.275, 0.09, cushionMaterial, g);
      cushion.scale.set(1, 1.46, 0.86);
      cushion.position.z = 0.16;
      const cavity = ball(1, fabricMaterial, g);
      cavity.scale.set(0.235, 0.35, 0.035);
      cavity.position.z = 0.15;
      // Fine recessed grille marks give the inner pad a tactile surface.
      for (let row = -4; row <= 4; row++) {
        const y = row * 0.057;
        const halfWidth = 0.19 * Math.sqrt(1 - (y / 0.31) ** 2);
        const rib = box(halfWidth * 2, 0.009, 0.008, cushionMaterial, g, 0.003);
        rib.position.set(0, y, 0.187);
      }
      const hinge = box(0.11, 0.37, 0.12, metal, g, 0.045);
      hinge.position.set(0, 0.52, -0.06);
      const dial = mesh(new T.CylinderGeometry(0.06, 0.06, 0.045, 32), metal, g);
      dial.rotation.x = Math.PI / 2;
      dial.position.set(0.16, -0.29, -0.23);
      return g;
    });
    updates.push((t) => {
      headset.rotation.y = -0.18 + Math.sin(t * 0.45) * 0.3;
      headset.position.y = 0.08 + Math.sin(t * 0.65) * 0.07;
      cups.forEach((cup, i) => {
        const side = i === 0 ? -1 : 1;
        cup.rotation.y = -side * (1.05 + Math.sin(t * 0.65) * 0.06);
      });
    });
  } else if (id === "focus") {
    const timer = new T.Group();
    root.add(timer);
    timer.rotation.z = -0.1;
    const body = mesh(
      new T.CylinderGeometry(0.95, 0.95, 0.44, 72),
      main,
      timer,
    );
    body.rotation.x = Math.PI / 2;
    const dial = mesh(
      new T.CylinderGeometry(0.82, 0.82, 0.035, 72),
      ivory,
      timer,
    );
    dial.rotation.x = Math.PI / 2;
    dial.position.z = 0.24;
    const rim = ring(0.85, 0.055, light, timer);
    rim.position.z = 0.27;
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      const tick = box(
        0.045,
        i % 3 === 0 ? 0.16 : 0.09,
        0.025,
        main,
        timer,
        0.015,
      );
      tick.position.set(Math.sin(a) * 0.69, Math.cos(a) * 0.69, 0.275);
      tick.rotation.z = -a;
    }
    const hand = new T.Group();
    timer.add(hand);
    hand.position.z = 0.31;
    const needle = box(0.07, 0.59, 0.05, main, hand, 0.03);
    needle.position.y = 0.25;
    ball(0.09, light, hand);
    const crown = box(0.36, 0.2, 0.25, light, timer, 0.07);
    crown.position.y = 1.04;
    updates.push((t) => {
      hand.rotation.z = -t * 0.45;
      timer.rotation.y = -0.12 + Math.sin(t * 0.5) * 0.25;
      timer.position.y = Math.sin(t * 0.8) * 0.08;
    });
  } else if (id === "breath") {
    const lungs = new T.Group();
    root.add(lungs);
    const tissue = material("#70aaa1", 0.48);
    const airway = material("#f5eee1", 0.5);

    // Rounded custom silhouettes, with a narrower apex and a broad curved base.
    // This is a sculptural cover illustration, not an anatomical reference.
    for (const side of [-1, 1]) {
      const outline = new T.Shape();
      outline.moveTo(0.24, 0.52);
      outline.bezierCurveTo(0.22, 0.91, 0.38, 1.02, 0.54, 0.85);
      outline.bezierCurveTo(0.83, 0.58, 1.05, -0.11, 1.05, -0.65);
      outline.bezierCurveTo(1.05, -0.96, 0.75, -0.99, 0.37, -0.84);
      outline.bezierCurveTo(0.18, -0.77, 0.15, -0.56, 0.18, -0.33);
      if (side === 1) {
        outline.bezierCurveTo(0.33, -0.28, 0.39, -0.09, 0.26, 0.1);
      } else {
        outline.bezierCurveTo(0.15, -0.14, 0.19, 0.02, 0.21, 0.1);
      }
      outline.bezierCurveTo(0.2, 0.27, 0.24, 0.4, 0.24, 0.52);
      const contour = outline.getSpacedPoints(96);
      const positions: number[] = [], indices: number[] = [];
      const around = 96, rows = 40;
      for (let row = 0; row <= rows; row++) {
        const theta = Math.PI * row / rows;
        const radial = Math.sin(theta);
        for (let col = 0; col <= around; col++) {
          const point = contour[col % around];
          positions.push(
            side * (0.59 + (point.x - 0.59) * radial),
            -0.06 + (point.y + 0.06) * radial,
            Math.cos(theta) * 0.37,
          );
        }
      }
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < around; col++) {
          const a = row * (around + 1) + col, b = a + around + 1;
          if (side === 1) indices.push(a, a + 1, b, b, a + 1, b + 1);
          else indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
      const geometry = new T.BufferGeometry();
      geometry.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      const surface = mesh(geometry, tissue, lungs);
      surface.receiveShadow = false;

      // Joined bronchial branches follow the rounded front of each lung.
      const surfaceDepth = (x: number, y: number, fallback: number) => {
        if (x < 0.28) return fallback;
        const dx = x - 0.59, dy = y + 0.06;
        let edge = Infinity;
        for (let i = 0; i < 96; i++) {
          const a = contour[i], b = contour[(i + 1) % 96];
          const ex = b.x - a.x, ey = b.y - a.y;
          const rx = a.x - 0.59, ry = a.y + 0.06;
          const cross = dx * ey - dy * ex;
          if (Math.abs(cross) < 1e-8) continue;
          const t = (rx * ey - ry * ex) / cross;
          const u = (rx * dy - ry * dx) / cross;
          if (t > 0 && u >= 0 && u <= 1) edge = Math.min(edge, t);
        }
        return 0.37 * Math.sqrt(Math.max(0, 1 - 1 / (edge * edge))) + 0.026;
      };
      const branch = (points: number[][], radius: number) => line(
        points.map(([x, y, z]) => [side * x, y, surfaceDepth(x, y, z)]),
        radius, airway, lungs,
      );
      branch([[0, 0.48, 0.38], [0.22, 0.32, 0.43], [0.43, 0.05, 0.43], [0.61, -0.3, 0.42], [0.65, -0.65, 0.32]], 0.055);
      branch([[0.31, 0.21, 0.43], [0.42, 0.39, 0.35], [0.46, 0.65, 0.23]], 0.034);
      branch([[0.43, 0.05, 0.43], [0.65, 0.09, 0.41], [0.8, -0.06, 0.29]], 0.032);
      branch([[0.55, -0.19, 0.43], [0.4, -0.37, 0.39], [0.36, -0.57, 0.27]], 0.028);
      branch([[0.61, -0.35, 0.42], [0.79, -0.43, 0.36], [0.87, -0.65, 0.22]], 0.027);
      branch([[0.42, 0.4, 0.35], [0.57, 0.48, 0.29]], 0.021);
      branch([[0.65, 0.09, 0.41], [0.72, 0.26, 0.27]], 0.02);

    }
    line([[0, 1.3, 0.33], [0, 0.92, 0.33], [0, 0.48, 0.38]], 0.09, airway, lungs);
    for (let i = 0; i < 8; i++) {
      const cartilage = ring(0.092, 0.012, ivory, lungs);
      cartilage.rotation.x = Math.PI / 2;
      cartilage.position.set(0, 0.6 + i * 0.088, 0.34);
    }
    updates.push((t) => {
      const inhale = (1 - Math.cos(t * Math.PI / 3)) / 2;
      lungs.scale.set(1 + inhale * 0.09, 1 + inhale * 0.045, 1 + inhale * 0.1);
      lungs.position.y = 0.02 + inhale * 0.025;
      lungs.rotation.y = -0.12 + Math.sin(t * 0.35) * 0.12;
    });
  } else if (id === "caffeine") {
    const cup = new T.Group();
    root.add(cup);
    cup.position.y = -0.25;
    const profile = [
      [0, -0.6],
      [0.49, -0.6],
      [0.62, -0.48],
      [0.71, 0.62],
      [0.66, 0.67],
      [0.6, 0.59],
      [0.53, -0.4],
      [0, -0.4],
    ].map((p) => new T.Vector2(p[0], p[1]));
    mesh(new T.LatheGeometry(profile, 64), main, cup);
    const lip = ring(0.68, 0.04, ivory, cup);
    lip.rotation.x = Math.PI / 2;
    lip.position.y = 0.63;
    const handle = ring(0.37, 0.105, main, cup);
    handle.position.set(0.78, 0.06, 0);
    const coffee = mesh(
      new T.CircleGeometry(0.62, 64),
      material("#704333"),
      cup,
    );
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.y = 0.55;
    const foam = line(
      Array.from({ length: 70 }, (_, i) => {
        const a = (i / 69) * Math.PI * 4;
        const r = 0.04 + (i / 69) * 0.35;
        return [Math.cos(a) * r, 0.558, Math.sin(a) * r];
      }),
      0.015,
      ivory,
      cup,
    );
    const saucer = mesh(new T.CylinderGeometry(0.94, 0.86, 0.1, 64), light);
    saucer.position.y = -0.92;
    const steam = [-0.25, 0.05, 0.3].map((x, i) => {
      const mat = material("#fff4e4");
      mat.transparent = true;
      mat.opacity = 0.45;
      const s = line(
        [
          [x, 0.45, 0],
          [x + 0.08, 0.7, 0],
          [x - 0.04, 0.95, 0],
          [x + 0.05, 1.2, 0],
        ],
        0.026,
        mat,
      );
      return { s, mat, i };
    });
    updates.push((t) => {
      cup.rotation.y = Math.sin(t * 0.5) * 0.18;
      foam.rotation.y = t * 0.12;
      steam.forEach(({ s, mat, i }) => {
        s.position.y = Math.sin(t * 0.9 + i) * 0.09;
        s.rotation.y = Math.sin(t * 0.6 + i) * 0.3;
        mat.opacity = 0.22 + 0.18 * (0.5 + 0.5 * Math.sin(t * 0.9 + i));
      });
    });
  } else {
    const glasses = new T.Group();
    root.add(glasses);
    glasses.rotation.z = -0.12;
    for (const side of [-1, 1]) {
      const cx = side * 0.59;
      line(
        [
          [cx - 0.43, 0.4, 0],
          [cx, 0.48, 0],
          [cx + 0.43, 0.4, 0],
          [cx + 0.45, -0.15, 0],
          [cx + 0.3, -0.43, 0],
          [cx - 0.25, -0.43, 0],
          [cx - 0.45, -0.2, 0],
        ],
        0.075,
        main,
        glasses,
        true,
      );
      const lensOutline = new T.CatmullRomCurve3(
        [[-0.43, 0.4], [0, 0.48], [0.43, 0.4], [0.45, -0.15],
          [0.3, -0.43], [-0.25, -0.43], [-0.45, -0.2]].map(
          ([x, y]) => new T.Vector3(x * 0.97, y * 0.97, 0),
        ),
        true,
      );
      const lens = mesh(
        new T.ShapeGeometry(new T.Shape(lensOutline.getPoints(96).map(
          (p) => new T.Vector2(p.x, p.y),
        ))),
        new T.MeshPhysicalMaterial({
          color: "#c3e4db",
          roughness: 0.1,
          transparent: true,
          opacity: 0.38,
          metalness: 0.1,
          side: T.DoubleSide,
        }),
        glasses,
      );
      lens.position.set(cx, 0, 0.005);
      lens.castShadow = false;
      line(
        [
          [side * 1.04, 0.28, 0],
          [side * 1.12, 0.25, -0.45],
          [side * 1.01, 0.1, -1.05],
        ],
        0.06,
        light,
        glasses,
      );
      const glint = box(0.035, 0.36, 0.025, ivory, glasses, 0.015);
      glint.position.set(cx - 0.2, 0.1, 0.05);
      glint.rotation.z = -0.4;
    }
    line(
      [
        [-0.16, 0.2, 0],
        [0, 0.28, 0],
        [0.16, 0.2, 0],
      ],
      0.06,
      main,
      glasses,
    );
    updates.push((t) => {
      glasses.rotation.y = -0.12 + Math.sin(t * 0.55) * 0.4;
      glasses.position.y = 0.1 + Math.sin(t * 0.8) * 0.1;
    });
  }
  return {
    root,
    update: (t: number) => updates.forEach((update) => update(t)),
  };
}

export function createCGICover(
  canvas: HTMLCanvasElement,
  id: LabId,
  initiallyPaused: boolean,
) {
  let renderer: T.WebGLRenderer;
  try {
    renderer = new T.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "low-power",
    });
  } catch {
    return null;
  }
  const scene = new T.Scene();
  scene.background = new T.Color(PALETTE[id][0]);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;
  const camera = new T.OrthographicCamera(-3, 3, 2, -2, 0.1, 30);
  camera.position.set(3, 2.1, 7);
  camera.lookAt(0, 0.05, 0);
  scene.add(new T.HemisphereLight("#ffffff", PALETTE[id][1], 2.3));
  const key = new T.DirectionalLight("#fff4e4", 4);
  key.position.set(-3, 5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  key.shadow.normalBias = 0.035;
  key.shadow.bias = -0.0001;
  key.shadow.radius = 4;
  scene.add(key);
  const fill = new T.DirectionalLight("#e0edff", 1.6);
  fill.position.set(4, 2, -2);
  scene.add(fill);
  const ground = new T.Mesh(
    new T.PlaneGeometry(200, 200),
    new T.MeshStandardMaterial({ color: PALETTE[id][0], roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.25;
  ground.receiveShadow = true;
  scene.add(ground);
  const subject = model(id);
  scene.add(subject.root);
  let contextLost = false;
  let disposed = false,
    paused = initiallyPaused,
    frame = 0,
    last = 0,
    time = 0;
  const render = () => {
    if (contextLost || disposed) return;
    subject.update(time);
    renderer.render(scene, camera);
    canvas.style.opacity = "1";
  };
  const draw = (now: number) => {
    if (disposed || contextLost || paused || document.hidden) return;
    frame = requestAnimationFrame(draw);
    if (last && now - last < 1000 / 30) return;
    if (last) time += Math.min((now - last) / 1000, 0.1);
    last = now;
    render();
  };
  const sync = () => {
    cancelAnimationFrame(frame);
    last = 0;
    if (!disposed && !contextLost && !paused && !document.hidden)
      frame = requestAnimationFrame(draw);
  };
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height || disposed) return;
    const aspect = width / height;
    const h = Math.max(3.7, 3.4 / aspect);
    camera.left = (-h * aspect) / 2;
    camera.right = (h * aspect) / 2;
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5, 1200 / width));
    renderer.setSize(width, height, false);
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const lost = () => {
    contextLost = true;
    cancelAnimationFrame(frame);
    canvas.style.opacity = "0";
  };
  canvas.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", sync);
  resize();
  sync();
  return {
    setPaused(value: boolean) {
      paused = value;
      sync();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("webglcontextlost", lost);
      scene.traverse((object) => {
        if (object instanceof T.Mesh) {
          object.geometry.dispose();
          const mats = Array.isArray(object.material)
            ? object.material
            : [object.material];
          mats.forEach((m) => m.dispose());
        }
      });
      key.shadow.map?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

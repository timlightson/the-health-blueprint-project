import type { LabId } from "@/components/labs/labs-meta";

const MODES: Record<LabId, number> = {
  sleep: 0,
  energy: 1,
  stress: 2,
  hydration: 3,
  sound: 4,
  focus: 5,
  breath: 6,
  caffeine: 7,
  vision: 8,
};

const VERTEX = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = position * .5 + .5;
  gl_Position = vec4(position, 0., 1.);
}`;

// Flow fields deform the artwork itself. The image edges stay pinned, so crops
// remain stable. These are material studies, not scientific simulations.
const FRAGMENT = `
precision mediump float;
varying vec2 uv;
uniform sampler2D artwork;
uniform vec2 crop;
uniform float time;
uniform int mode;

mat2 rotate(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
void main() {
  vec2 p = (uv - .5) * crop + .5;
  vec2 q = p - .5;
  float t = time;
  float edge = smoothstep(0., .16, p.x) * smoothstep(0., .16, 1.-p.x)
             * smoothstep(0., .14, p.y) * smoothstep(0., .14, 1.-p.y);
  float body = exp(-dot(q * vec2(1.15, 1.8), q * vec2(1.15, 1.8)) * 3.);
  vec2 flow = vec2(0.);
  float light = 0.;

  if (mode == 0) {
    // A broad traveling wave, with a smaller countercurrent in the glass.
    flow.y = .048 * sin(p.x * 9.5 - t * .72) * body;
    flow.x = .012 * sin(p.y * 10. + t * .45) * body;
    light = .025 * sin(p.x * 9. - t * .72) * body;
  } else if (mode == 1) {
    // A continuous upward current through the amber crest.
    flow.x = .026 * sin(p.y * 11. - t * 1.15) * body;
    flow.y = .018 * sin(p.x * 8. + p.y * 5. - t * .8) * body;
    light = .065 * pow(.5 + .5 * sin(p.y * 8. - t * 1.15), 5.) * body;
  } else if (mode == 2) {
    // A soft knot tightening and releasing, anchored at its perimeter.
    float tension = sin(t * .85);
    flow = (rotate(.12 * tension * body) * q - q) * body;
    flow += q * vec2(.05, -.035) * tension * body;
  } else if (mode == 3) {
    // Intersecting capillary waves across the sheet of water.
    float r = length(q * vec2(1., 1.2));
    flow = normalize(q + .001) * sin(r * 35. - t * 2.) * .014 * body;
    flow.y += .025 * sin(p.x * 13. + t * .9) * body;
    light = .035 * sin(p.x * 24. + p.y * 12. - t * 1.4) * body;
  } else if (mode == 4) {
    // The pleats compress and expand as a wave passes through them.
    flow.x = .025 * sin(p.x * 23. - t * 2.2) * body;
    flow.y = .014 * sin(p.x * 13. - t * 1.1) * body;
    light = .04 * sin(p.x * 23. - t * 2.2) * body;
  } else if (mode == 5) {
    // Filaments draw toward the optical center and softly release.
    float lens = exp(-dot(q, q) * 9.);
    flow = q * .13 * sin(t * .7) * lens;
    flow.y += .008 * sin(p.x * 20. - t) * body;
    light = .025 * sin(t * .7) * lens;
  } else if (mode == 6) {
    // One unhurried six-second expansion, with a small fold flutter.
    float breath = sin(t * 1.0472);
    flow = -q * vec2(.065, .105) * breath * body;
    flow.x += .01 * sin(p.y * 13. - t * .7) * body;
  } else if (mode == 7) {
    // A localized vortex in the coffee; the vessel remains mostly still.
    vec2 c = p - vec2(.5, .53);
    float liquid = exp(-dot(c * vec2(1., 1.35), c * vec2(1., 1.35)) * 12.);
    flow = (rotate(.22 * sin(t * .6) * liquid) * c - c);
    flow += .01 * vec2(sin(p.y * 17. - t), cos(p.x * 17. - t)) * liquid;
  } else {
    // A traveling optical distortion, like light crossing a curved lens.
    float lens = exp(-dot(q * vec2(1.4, 1.), q * vec2(1.4, 1.)) * 5.);
    flow = vec2(.026 * sin(p.y * 8. + t * .8), .018 * sin(p.x * 9. - t * .6)) * lens;
    light = .045 * sin(p.x * 9. - t * .8) * lens;
  }

  vec2 sampleUV = clamp(p + flow * edge, .001, .999);
  vec3 color = texture2D(artwork, sampleUV).rgb;
  color *= 1. + light * edge;
  gl_FragColor = vec4(color, 1.);
}`;

/** Returns cleanup, or null when WebGL cannot be used. The still image stays visible. */
export function animateCover(
  canvas: HTMLCanvasElement,
  source: HTMLImageElement,
  id: LabId,
) {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const compile = (type: number, code: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Shader unavailable");
    shaders.push(shader);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error("Cover shader compilation failed");
    return shader;
  };
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let texture: WebGLTexture | null = null;
  let frame = 0;
  let observer: ResizeObserver | undefined;
  let disposed = false;
  let last = 0;
  let time = 0;

  const cleanup = () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    canvas.removeEventListener("webglcontextlost", lost);
    canvas.style.opacity = "0";
    if (texture) gl.deleteTexture(texture);
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
  const lost = () => {
    cancelAnimationFrame(frame);
    canvas.style.opacity = "0";
    disposed = true;
  };
  const visibility = () => {
    cancelAnimationFrame(frame);
    last = 0;
    if (!document.hidden && !disposed) frame = requestAnimationFrame(draw);
  };
  let timeLocation: WebGLUniformLocation | null = null;
  const draw = (now: number) => {
    if (disposed || document.hidden) return;
    frame = requestAnimationFrame(draw);
    // 30fps is sufficient for slow material motion. Avoid double-speed updates
    // on high-refresh phones and large canvas backing stores on retina screens.
    if (last && now - last < 1000 / 30) return;
    if (last) time += Math.min((now - last) / 1000, 0.1);
    last = now;
    gl.uniform1f(timeLocation, time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    canvas.style.opacity = "1";
  };

  try {
    program = gl.createProgram();
    if (!program) throw new Error("Program unavailable");
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error("Cover program link failed");
    gl.useProgram(program);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
    gl.uniform1i(gl.getUniformLocation(program, "artwork"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "mode"), MODES[id]);
    timeLocation = gl.getUniformLocation(program, "time");
    const cropLocation = gl.getUniformLocation(program, "crop");
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height || disposed) return;
      const ratio = Math.min(devicePixelRatio || 1, 1.5, 1200 / width);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const relativeAspect =
        width / height / (source.naturalWidth / source.naturalHeight);
      gl.uniform2f(
        cropLocation,
        Math.min(1, relativeAspect),
        Math.min(1, 1 / relativeAspect),
      );
    };
    resize();
    observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", visibility);
    if (!document.hidden) frame = requestAnimationFrame(draw);
    return cleanup;
  } catch {
    cleanup();
    return null;
  }
}

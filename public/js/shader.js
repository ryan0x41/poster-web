// shaders are by gpt
// - ryan
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");
if (!gl) {
    console.error("WebGL not supported in this browser");
}
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
const vertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;
const fragmentShaderSource = `
    precision mediump float;
    uniform vec2 iResolution;
    uniform float iTime;
    varying vec2 v_uv;

    float rand(vec2 co){
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = 0.6 * (fragCoord / iResolution);
        float slowTime = iTime * 0.2;
        float tx = sin(slowTime + uv.x * 2.28318);
        float ty = sin(slowTime + uv.y * 2.28318);
        float t = 0.5 + 0.5 * (tx + ty) / 2.0;
        vec2 center = vec2(0.2, 0.2);
        float r = length(uv - center);
        float orangeMix = 0.2 * (sin(slowTime + r * 12.56636) * 0.5 + 0.5);
        vec3 black = vec3(0.0);
        vec3 blue = vec3(47.0/255.0, 39.0/255.0, 206.0/255.0);
        vec3 orange = vec3(0.5, 0.25, 0.0);
        vec3 mixedColor = mix(orange, blue, t);
        vec3 finalColor = mix(mixedColor, orange, orangeMix);
        float n = fract(sin(dot(fragCoord, vec2(12.9898, 78.233))) * 43758.5453);
        finalColor += (n - 0.5) * 0.01;
        fragColor = vec4(finalColor, 1.0);
    }


    void main() {
        vec2 fragCoord = v_uv * iResolution;
        vec4 color;
        mainImage(color, fragCoord);
        gl_FragColor = color;
    }
`;
function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program failed to link:", gl.getProgramInfoLog(program));
    throw new Error("Program failed to link");
}
gl.useProgram(program);
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = new Float32Array([
    -1, -1,
    1, -1,
    -1,  1,
    -1,  1,
    1, -1,
    1,  1,
]);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
const aPositionLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(aPositionLocation);
gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);
const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
const iTimeLocation = gl.getUniformLocation(program, "iTime");
const startTime = Date.now();
function render() {
    resizeCanvas();
    const time = (Date.now() - startTime) / 1000.0;
    gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(iTimeLocation, time);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}
render();
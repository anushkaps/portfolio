// Set up WebGL and the canvas
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

// Set the canvas size to fill the entire window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Define the GLSL shaders
const vertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_position;

    void main() {
        v_position = a_position;
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    varying vec2 v_position;
    uniform float u_time;

    // Function to generate a moving circle (moon)
    float circle(vec2 uv, vec2 center, float radius) {
        return smoothstep(0.02, 0.04, radius - length(uv - center));
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / vec2(${canvas.width}.0, ${canvas.height}.0);
        uv -= 0.5;
        uv *= vec2(${canvas.width}.0 / ${canvas.height}.0, 1.0);

        float moonRadius = 0.2;
        vec2 moonCenter = vec2(sin(u_time * 0.2) * 0.5, cos(u_time * 0.2) * 0.5);

        // Set background color to dark blue (night sky)
        vec3 color = vec3(0.0, 0.0, 0.1);

        // Add the moon (circle) to the background
        float moon = circle(uv, moonCenter, moonRadius);
        color += moon * vec3(1.0, 1.0, 0.8); // Moonlight color (light yellow)

        gl_FragColor = vec4(color, 1.0);
    }
`;

// Function to compile and link shaders
function createShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling shader!', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Create shaders and program
const vertexShader = createShader(vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = createShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('ERROR linking program!', gl.getProgramInfoLog(program));
}

// Get attribute and uniform locations
const positionLocation = gl.getAttribLocation(program, "a_position");
const timeLocation = gl.getUniformLocation(program, "u_time");

// Create a buffer for the square (to cover the entire canvas)
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const vertices = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    1.0, 1.0
]);

gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Use the shader program
gl.useProgram(program);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLocation);

// Animation loop
function animate(time) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(timeLocation, time * 0.001); // Pass time to shader

    gl.drawArrays(gl.TRIANGLES, 0, 6); // Draw the square

    requestAnimationFrame(animate); // Continue animation
}

// Set the clear color (background)
gl.clearColor(0.0, 0.0, 0.1, 1.0); // Dark blue background

// Start the animation
animate(0);

/**
 * STVX Silk Background Effect - Vanilla Three.js Implementation
 * Based on the provided R3F Shader Code.
 */

// -------------------- 1. Utilites and Shaders --------------------
const hexToNormalizedRGB = (hex) => {
    hex = hex.replace('#', '');
    return [
        parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255,
        parseInt(hex.slice(4, 6), 16) / 255
    ];
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vPosition = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
    float G = e;
    vec2  r = (G * sin(G * texCoord));
    return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    mat2  rot = mat2(c, -s, s, c);
    return rot * uv;
}

void main() {
    float rnd        = noise(gl_FragCoord.xy);
    vec2  uv         = rotateUvs(vUv * uScale, uRotation);
    vec2  tex        = uv * uScale;
    float tOffset    = uSpeed * uTime;

    tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

    float pattern = 0.6 +
                    0.4 * sin(5.0 * (tex.x + tex.y +
                                     cos(3.0 * tex.x + 5.0 * tex.y) +
                                     0.02 * tOffset) +
                               sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

    vec4 finalColor = vec4(uColor, 1.0) * vec4(pattern);
    
    finalColor -= rnd / 15.0 * uNoiseIntensity;

    gl_FragColor = finalColor;
}
`;

// -------------------- 2. Three.js Setup --------------------
function initSilkEffect() {
    // 🛑 تأكد من أن THREE معرفة قبل محاولة استخدامها
    const canvas = document.getElementById('silkCanvas');
    if (!canvas || typeof THREE === 'undefined') {
        console.error("Canvas element or THREE.js library not found.");
        return; 
    }

    // Parameters 
    const speed = 5;
    const scale = 1.5; 
    const colorHex = '#ffc72c'; // اللون الذهبي
    const noiseIntensity = 1.0;
    const rotation = 0;

    let scene, camera, renderer, mesh;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene and Renderer Setup
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 2. Camera (Orthographic for 2D plane)
    camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    camera.position.z = 1;

    // 3. Uniforms Setup
    const uniforms = {
        uSpeed: { value: speed },
        uScale: { value: scale },
        uNoiseIntensity: { value: noiseIntensity },
        uColor: { value: new THREE.Color(...hexToNormalizedRGB(colorHex)) },
        uRotation: { value: rotation },
        uTime: { value: 0 }
    };

    // 4. Geometry and Material
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 5. Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);

        // Update uTime
        const delta = clock.getDelta();
        mesh.material.uniforms.uTime.value += 0.1 * delta;

        renderer.render(scene, camera);
    };

    // 6. Handle Resize
    function onWindowResize() {
        width = window.innerWidth;
        height = window.innerHeight;

        // Update camera
        camera.left = width / -2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = height / -2;
        camera.updateProjectionMatrix();

        // Update plane size
        mesh.geometry.dispose();
        mesh.geometry = new THREE.PlaneGeometry(width, height);
        
        renderer.setSize(width, height);
    }

    window.addEventListener('resize', onWindowResize, false);
    
    // Start Animation
    animate();
}

window.addEventListener('load', initSilkEffect);

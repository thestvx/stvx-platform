// liquid-ether.js
/**
 * هذا الكود هو تكييف للـ Liquid Ether effect الذي يعتمد على THREE.js.
 * تم تحديث الألوان لتناسب المظهر الأسود والذهبي.
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('liquid-ether-canvas');
    if (!container) return;

    let scene, camera, renderer, clock;
    let material, mesh, mouse;
    let isInitialized = false;

    // تهيئة الألوان الذهبية والداكنة
    const COLORS = [
        new THREE.Color(0x111111), // 1. أسود داكن جداً (Deep Black)
        new THREE.Color(0xFFD700), // 2. ذهبي (Gold)
        new THREE.Color(0xFFA500)  // 3. كهرماني داكن (Orange Gold)
    ];

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float time;
        uniform vec2 resolution;
        uniform vec2 mouse;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec2 vUv;

        // وظيفة الضوضاء (Simplex Noise) المبسطة
        vec3 hash( vec3 p ) {
            p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
                      dot(p,vec3(269.5,183.3,246.1)),
                      dot(p,vec3(113.5,271.9,124.6)) );
            return -1.0 + 2.0*fract(sin(p)*43758.5453123);
        }

        float noise( vec3 p ) {
            vec3 i = floor( p );
            vec3 f = fract( p );
            f = f*f*(3.0-2.0*f);
            vec3 u = hash( i );
            vec3 v = hash( i + vec3(1.0,0.0,0.0) );
            vec3 w = hash( i + vec3(0.0,1.0,0.0) );
            vec3 x = hash( i + vec3(1.0,1.0,0.0) );
            vec3 y = hash( i + vec3(0.0,0.0,1.0) );
            vec3 z = hash( i + vec3(1.0,0.0,1.0) );
            vec3 a = hash( i + vec3(0.0,1.0,1.0) );
            vec3 b = hash( i + vec3(1.0,1.0,1.0) );
            
            float res = mix(mix(mix( dot(u, f), dot(v, f - vec3(1,0,0)), f.x),
                                 mix( dot(w, f - vec3(0,1,0)), dot(x, f - vec3(1,1,0)), f.x), f.y),
                            mix(mix( dot(y, f - vec3(0,0,1)), dot(z, f - vec3(1,0,1)), f.x),
                                 mix( dot(a, f - vec3(0,1,1)), dot(b, f - vec3(1,1,1)), f.x), f.y), f.z);
            
            return res;
        }

        // دالة المجال السائل
        float fluidField(vec3 p) {
            float n = 0.0;
            n += 1.0 * noise(p * 0.5 + time * 0.1);
            n += 0.5 * noise(p * 1.0 + time * 0.2);
            n += 0.25 * noise(p * 2.0 + time * 0.4);
            return n / (1.0 + 0.5 + 0.25);
        }
        
        void main() {
            vec2 aspectUv = vUv - 0.5;
            aspectUv.x *= resolution.x / resolution.y;

            vec3 p = vec3(aspectUv * 5.0, 0.0);
            p.z += mouse.x * 2.0; 
            p.y += mouse.y * 2.0;

            float field = fluidField(p);

            // تدرج الألوان
            vec3 color;
            if (field < -0.3) {
                color = mix(color1, color2, (field + 0.5) * 2.0);
            } else if (field < 0.3) {
                color = mix(color2, color3, (field + 0.3) * 1.666);
            } else {
                color = mix(color3, color1, (field - 0.3) * 1.428);
            }

            // تطبيق تأثير توهج بسيط
            float glow = smoothstep(0.0, 0.5, field * field * field + 0.2);
            color = mix(color, vec3(1.0), glow * 0.2); 

            gl_FragColor = vec4(color, 1.0);
        }
    `;
    // ***************************************************************

    function init() {
        if (isInitialized) return;
        isInitialized = true;

        const width = container.clientWidth;
        const height = container.clientHeight;

        // 1. المشهد (Scene)
        scene = new THREE.Scene();

        // 2. الكاميرا (Camera)
        camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
        camera.position.z = 1;

        // 3. المُنَضِّد (Renderer)
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // 4. الساعة (Clock)
        clock = new THREE.Clock();

        // 5. الماوس (Mouse)
        mouse = new THREE.Vector2(0, 0);

        // 6. المادة (Material)
        material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                resolution: { value: new THREE.Vector2(width, height) },
                mouse: { value: mouse },
                color1: { value: COLORS[0] },
                color2: { value: COLORS[1] },
                color3: { value: COLORS[2] },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });

        // 7. الشبكة (Mesh)
        const geometry = new THREE.PlaneGeometry(width, height);
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // إضافة مستمعي الأحداث
        window.addEventListener('resize', onWindowResize, false);
        container.addEventListener('mousemove', onMouseMove, false);

        animate();
    }

    function onWindowResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;

        renderer.setSize(width, height);
        camera.left = width / -2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = height / -2;
        camera.updateProjectionMatrix();

        material.uniforms.resolution.value.set(width, height);
        
        scene.remove(mesh);
        const geometry = new THREE.PlaneGeometry(width, height);
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }
    
    function onMouseMove(event) {
        mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;
    }

    function animate() {
        requestAnimationFrame(animate);
        material.uniforms.time.value += clock.getDelta() * 0.5;
        renderer.render(scene, camera);
    }

    init();
});

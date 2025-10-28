// script.js (OGL Circular Gallery - Vanilla JS Adaptation)

// ----------------------------------------------------
// 0. تهيئة متطلبات OGL الأساسية (يجب توفر مكتبة OGL عبر CDN)
// ----------------------------------------------------
// لتقليل التعقيد في الكود النقي، سنفترض أن OGL موجودة في النطاق العام بعد استيرادها عبر CDN
const { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } = window.OGL || {};

// ----------------------------------------------------
// وظائف المساعدة العامة (Helper Functions)
// ----------------------------------------------------

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function lerp(p1, p2, t) {
    return p1 + (p2 - p1) * t;
}

function autoBind(instance) {
    const proto = Object.getPrototypeOf(instance);
    Object.getOwnPropertyNames(proto).forEach(key => {
        if (key !== 'constructor' && typeof instance[key] === 'function') {
            instance[key] = instance[key].bind(instance);
        }
    });
}

function createTextTexture(gl, text, font = 'bold 30px monospace', color = 'black') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    // نستخدم قياس مبدئي لحجم الخط
    const metrics = context.measureText(text);
    const textWidth = Math.ceil(metrics.width);
    const textHeight = Math.ceil(parseInt(font, 10) * 1.5); // زيادة الارتفاع قليلاً لتجنب القطع
    
    // يجب أن تكون أبعاد Canvas قوة للعدد 2 (مثل 256، 512، 1024) لبعض متصفحات WebGL القديمة، لكننا هنا نستخدم أحجام دقيقة
    canvas.width = textWidth + 40; // زيادة الهامش الأفقي
    canvas.height = textHeight + 20; // زيادة الهامش العمودي
    
    // إعادة تعيين الخط بعد تغيير أبعاد Canvas
    context.font = font; 
    context.fillStyle = color;
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 2); // إضافة إزاحة بسيطة للوسط
    
    const texture = new Texture(gl, { generateMipmaps: false });
    texture.image = canvas;
    return { texture, width: canvas.width, height: canvas.height };
}

// ----------------------------------------------------
// كلاس Title
// ----------------------------------------------------

class Title {
    constructor({ gl, plane, renderer, text, textColor = '#ffc72c', font = 'bold 30px Cairo' }) {
        autoBind(this);
        this.gl = gl;
        this.plane = plane;
        this.renderer = renderer;
        this.text = text;
        this.textColor = textColor;
        this.font = font;
        this.createMesh();
    }
    createMesh() {
        const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
        this.width = width;
        this.height = height;

        const geometry = new Plane(this.gl);
        const program = new Program(this.gl, {
            vertex: `
                attribute vec3 position;
                attribute vec2 uv;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragment: `
                precision highp float;
                uniform sampler2D tMap;
                varying vec2 vUv;
                void main() {
                    vec4 color = texture2D(tMap, vUv);
                    if (color.a < 0.1) discard;
                    gl_FragColor = color;
                }
            `,
            uniforms: { tMap: { value: texture } },
            transparent: true,
            depthTest: false,
            depthWrite: false, 
        });
        this.mesh = new Mesh(this.gl, { geometry, program });
        this.onResize();
        this.mesh.setParent(this.plane);
    }

    onResize() {
        if (!this.mesh) return;
        const aspect = this.width / this.height;
        // يتم تحديد ارتفاع النص بالنسبة لحجم البطاقة 
        const textHeight = this.plane.scale.y * 0.15;
        const textWidth = textHeight * aspect;
        this.mesh.scale.set(textWidth, textHeight, 1);
        // تم تعديل الموضع ليصبح أسفل البطاقة
        this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.05; 
    }
}

// ----------------------------------------------------
// كلاس Media
// ----------------------------------------------------

class Media {
    constructor({
        geometry, gl, image, index, length, renderer, scene, screen, text, viewport, bend, textColor, borderRadius = 0, font, 
    }) {
        autoBind(this);
        this.extra = 0;
        this.geometry = geometry;
        this.gl = gl;
        this.image = image;
        this.index = index;
        this.length = length;
        this.renderer = renderer;
        this.scene = scene;
        this.screen = screen;
        this.text = text;
        this.viewport = viewport;
        this.bend = bend;
        this.textColor = textColor;
        // تحويل قيمة BorderRadius من نسبة مئوية (0.05) إلى مقياس في WebGL
        this.borderRadius = borderRadius; 
        this.font = font;

        this.x = 0;
        this.width = 0;
        this.widthTotal = 0;
        
        this.createShader();
        this.createMesh();
        this.createTitle();
        this.onResize();
    }

    createShader() {
        const texture = new Texture(this.gl, {
            generateMipmaps: true
        });
        this.program = new Program(this.gl, {
            depthTest: false,
            depthWrite: false,
            vertex: `
                precision highp float;
                attribute vec3 position;
                attribute vec2 uv;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                uniform float uTime;
                uniform float uSpeed;
                uniform float uBend;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    vec3 p = position;
                    // تأثير التموج الخفيف (Wave effect)
                    // يتم تعديل قوة التموج بناءً على سرعة التمرير
                    p.z = (sin(p.x * 4.0 + uTime * 0.5) * 0.3 + cos(p.y * 2.0 + uTime * 0.5) * 0.3) * (0.1 + abs(uSpeed) * 1.5);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
                }
            `,
            fragment: `
                precision highp float;
                uniform vec2 uImageSizes;
                uniform vec2 uPlaneSizes;
                uniform sampler2D tMap;
                uniform float uBorderRadius;
                uniform float uAlpha;
                varying vec2 vUv;
                
                // دالة مسافة لحواف دائرية (Rounded Box SDF)
                float roundedBoxSDF(vec2 p, vec2 b, float r) {
                    vec2 d = abs(p) - b;
                    return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
                }
                
                void main() {
                    // حساب النسبة والتوسيط (Cover fit)
                    vec2 ratio = vec2(
                        min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
                        min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
                    );
                    vec2 uv = vec2(
                        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
                        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
                    );
                    vec4 color = texture2D(tMap, uv);
                    
                    // تطبيق الحواف الدائرية
                    vec2 centeredUv = vUv - 0.5;
                    // حساب نصف حجم البطاقة
                    vec2 halfSize = vec2(0.5, 0.5);
                    // تحديد حجم الحافة الدائرية بالنسبة لحجم البطاقة
                    // نستخدم uBorderRadius كنسبة من halfSize.y
                    float radius = uBorderRadius * halfSize.y; 
                    
                    float d = roundedBoxSDF(centeredUv, halfSize - radius, radius);
                    
                    // تنعيم الحواف (Antialiasing)
                    float edgeSmooth = 0.002;
                    float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
                    
                    gl_FragColor = vec4(color.rgb, color.a * alpha);
                }
            `,
            uniforms: {
                tMap: { value: texture },
                uPlaneSizes: { value: [0, 0] },
                uImageSizes: { value: [0, 0] },
                uSpeed: { value: 0 },
                uTime: { value: 100 * Math.random() },
                uBorderRadius: { value: this.borderRadius },
                uAlpha: { value: 1 }
            },
            transparent: true
        });

        // تحميل الصورة
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = this.image;
        img.onload = () => {
            texture.image = img;
            this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
        };
    }
    
    createMesh() {
        this.plane = new Mesh(this.gl, {
            geometry: this.geometry,
            program: this.program
        });
        this.plane.setParent(this.scene);
    }

    createTitle() {
        this.title = new Title({
            gl: this.gl,
            plane: this.plane,
            renderer: this.renderer,
            text: this.text,
            textColor: this.textColor,
            font: this.font
        });
    }

    update(scroll, direction) {
        // تحديث موضع البطاقة بناءً على التمرير
        this.plane.position.x = this.x - scroll.current - this.extra;

        const x = this.plane.position.x;
        const H = this.viewport.width / 2;

        // تطبيق انحناء الأفق (Horizontal Bend)
        if (this.bend === 0) {
            this.plane.position.y = 0;
            this.plane.rotation.z = 0;
        } else {
            const B_abs = Math.abs(this.bend);
            const R = (H * H + B_abs * B_abs) / (2 * B_abs);
            const effectiveX = Math.min(Math.abs(x), H);

            // التأكد من أن القيمة داخل الجذر التربيعي موجبة
            const sqrtArg = R * R - effectiveX * effectiveX;
            if (sqrtArg >= 0) {
                const arc = R - Math.sqrt(sqrtArg);
                if (this.bend > 0) {
                    this.plane.position.y = -arc;
                    this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
                } else {
                    this.plane.position.y = arc;
                    this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
                }
            } else {
                 // في حالة جذر سالب، نثبت الموضع والدوران لتجنب الأخطاء
                this.plane.position.y = 0;
                this.plane.rotation.z = 0;
            }
        }

        // تحديث متغيرات الشادر (Shaders)
        this.speed = scroll.current - scroll.last;
        this.program.uniforms.uTime.value += 0.04;
        this.program.uniforms.uSpeed.value = this.speed * 0.05; // تقليل تأثير السرعة

        // حلقة التكرار اللانهائي (Infinite Loop)
        const planeOffset = this.plane.scale.x / 2;
        const viewportOffset = this.viewport.width / 2;
        this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
        this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
        
        // استخدام عرض المجموعة الأصلية للحلقة اللانهائية
        const loopWidth = this.widthTotal; 
        
        if (direction === 'right' && this.isBefore) {
            this.extra -= loopWidth;
            this.isBefore = this.isAfter = false;
        }
        if (direction === 'left' && this.isAfter) {
            this.extra += loopWidth;
            this.isBefore = this.isAfter = false;
        }
    }

    onResize({ screen, viewport } = {}) {
        if (screen) this.screen = screen;
        if (viewport) {
            this.viewport = viewport;
        }
        
        // 🛠️ تعديل مقاييس البطاقة لتكون متناسبة مع شاشات الجوال بشكل أفضل
        let scaleFactor = 1;
        if (this.screen.width < 768) { // شاشات الجوال
            scaleFactor = 0.5;
        } else if (this.screen.width < 1024) { // شاشات التابلت
            scaleFactor = 0.7;
        }
        
        // تحديد حجم ثابت للبطاقة (بالبكسل مثلاً) ثم تحويله إلى وحدات WebGL
        const cardHeightPixels = 600 * scaleFactor;
        const cardWidthPixels = 450 * scaleFactor;
        
        // حساب مقاييس البطاقة باستخدام نسبة الشاشة
        this.plane.scale.y = (this.viewport.height * cardHeightPixels) / this.screen.height;
        this.plane.scale.x = (this.viewport.width * cardWidthPixels) / this.screen.width;
        
        this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
        
        // 🛠️ تقليل المسافة بين البطاقات
        this.padding = 1.0; 
        this.width = this.plane.scale.x + this.padding;
        
        // العرض الإجمالي لمجموعة البطاقات الأصلية (بدون التكرار)
        this.widthTotal = this.width * (this.length / 2); 
        
        // موضع البطاقة في المعرض اللانهائي
        this.x = this.width * this.index; 
        
        // إعادة حساب مقاييس النص بعد تغيير مقياس البطاقة
        if (this.title) {
            this.title.onResize();
        }
    }
}

// ----------------------------------------------------
// كلاس App (المهندس الرئيسي)
// ----------------------------------------------------

class CircularGalleryApp {
    constructor(
        containerId,
        {
            items,
            bend = 3,
            textColor = '#ffc72c',
            borderRadius = 0.05,
            font = 'bold 30px Expo Arabic, Cairo',
            scrollSpeed = 5,
            scrollEase = 0.1
        } = {}
    ) {
        autoBind(this); // لربط وظائف الكلاس بشكل تلقائي
        this.container = document.getElementById(containerId);
        if (!this.container || !window.OGL) {
             // إظهار رسالة إذا لم يتم العثور على الحاوية أو مكتبة OGL 
            console.error(`Circular Gallery failed: Container ID ${containerId} not found or OGL library is missing.`);
            return;
        }
        
        this.scrollSpeed = scrollSpeed;
        this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
        this.onCheckDebounce = debounce(this.onCheck, 200);
        
        this.createRenderer();
        this.createCamera();
        this.createScene();
        this.onResize(); // يجب استدعاؤها أولاً لتهيئة this.screen و this.viewport
        this.createGeometry();
        this.createMedias(items, bend, textColor, borderRadius, font);
        this.addEventListeners();
        this.update();
    }
    
    createRenderer() {
        this.renderer = new Renderer({
            alpha: true,
            antialias: true,
            dpr: Math.min(window.devicePixelRatio || 1, 2)
        });
        this.gl = this.renderer.gl;
        this.gl.clearColor(0, 0, 0, 0); // خلفية شفافة
        
        // إعداد Canvas ليملأ الحاوية
        this.gl.canvas.style.position = 'absolute';
        this.gl.canvas.style.top = '0';
        this.gl.canvas.style.left = '0';
        this.gl.canvas.style.width = '100%';
        this.gl.canvas.style.height = '100%';
        this.gl.canvas.style.pointerEvents = 'none'; // لتمكين النقر على المحتوى الأساسي
        
        this.container.appendChild(this.gl.canvas);
    }

    createCamera() {
        this.camera = new Camera(this.gl);
        this.camera.fov = 45;
        this.camera.position.z = 20;
    }

    createScene() {
        this.scene = new Transform();
    }

    createGeometry() {
        this.planeGeometry = new Plane(this.gl, {
            // زيادة عدد التقسيمات للحصول على تأثير انحناء وتموج سلس
            heightSegments: 50,
            widthSegments: 100
        });
    }

    createMedias(items, bend = 1, textColor, borderRadius, font) {
        // 🚨 تعديل المسارات الافتراضية هنا لتجنب أخطاء 404 إذا لم يتم تمرير عناصر
        const defaultItems = [
            { image: 'images/default-project-1.png', text: 'المشروع الافتراضي الأول' },
            { image: 'images/default-project-2.png', text: 'المشروع الافتراضي الثاني' },
            { image: 'images/default-project-3.png', text: 'المشروع الافتراضي الثالث' },
        ];
        const galleryItems = items && items.length ? items : defaultItems;
        
        // مضاعفة العناصر لتكوين حلقة تكرار لانهائية
        this.mediasImages = galleryItems.concat(galleryItems); 
        
        this.medias = this.mediasImages.map((data, index) => {
            return new Media({
                geometry: this.planeGeometry,
                gl: this.gl,
                image: data.image,
                index,
                length: this.mediasImages.length,
                renderer: this.renderer,
                scene: this.scene,
                screen: this.screen,
                text: data.text,
                viewport: this.viewport,
                bend,
                textColor,
                borderRadius,
                font
            });
        });
    }

    // ----------------------
    // إدارة التفاعلات
    // ----------------------
    onTouchDown(e) {
        this.isDown = true;
        this.scroll.position = this.scroll.current;
        this.start = e.touches ? e.touches[0].clientX : e.clientX;
        this.container.style.cursor = 'grabbing';
    }

    onTouchMove(e) {
        if (!this.isDown) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        // زيادة قيمة scrollSpeed للتحكم بسرعة التمرير
        const distance = (this.start - x) * (this.scrollSpeed * 0.05); 
        this.scroll.target = this.scroll.position + distance;
    }

    onTouchUp() {
        this.isDown = false;
        this.container.style.cursor = 'grab';
        // يمكنك تفعيل onCheck هنا لتفعيل خاصية التوقف (Snap) على أقرب بطاقة
        // this.onCheck(); 
    }

    onWheel(e) {
        // نستخدم deltaX للتمرير الأفقي أو deltaY إذا لم يكن هناك تمرير أفقي
        const delta = e.deltaX || e.deltaY || e.wheelDelta || e.detail;
        this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.5;
        e.preventDefault(); // منع التمرير الافتراضي للصفحة عند التمرير داخل المعرض
        // يمكنك تفعيل onCheckDebounce هنا لتفعيل خاصية التوقف (Snap) 
        // this.onCheckDebounce();
    }
    
    // وظيفة لاصق التوقف (Snap) - حالياً معطلة لتمكين التمرير الحر
    onCheck() {
        if (!this.medias || !this.medias[0]) return;
        const width = this.medias[0].width;
        
        // تحديد موقع التوقف بناءً على أقرب بطاقة
        const itemIndex = Math.round(this.scroll.target / width); 
        const snapTarget = width * itemIndex;
        
        this.scroll.target = snapTarget;
    }

    onResize() {
        this.screen = {
            width: this.container.clientWidth,
            height: this.container.clientHeight
        };
        this.renderer.setSize(this.screen.width, this.screen.height);
        this.camera.perspective({
            aspect: this.screen.width / this.screen.height
        });
        // حساب حجم Viewport (المساحة المرئية في WebGL)
        const fov = (this.camera.fov * Math.PI) / 180;
        const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
        const width = height * this.camera.aspect;
        this.viewport = { width, height };
        
        if (this.medias) {
            this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
        }
    }

    update() {
        this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
        
        const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
        
        if (this.medias) {
            this.medias.forEach(media => media.update(this.scroll, direction));
        }
        
        this.renderer.render({ scene: this.scene, camera: this.camera });
        this.scroll.last = this.scroll.current;
        this.raf = window.requestAnimationFrame(this.update);
    }
    
    addEventListeners() {
        window.addEventListener('resize', this.onResize);
        
        // استبدال المستمعين على window بالمستمعين على الحاوية (container) للتفاعلات
        this.container.addEventListener('wheel', this.onWheel, { passive: false });
        this.container.addEventListener('mousewheel', this.onWheel, { passive: false });
        
        this.container.addEventListener('mousedown', this.onTouchDown);
        this.container.addEventListener('mousemove', this.onTouchMove);
        this.container.addEventListener('mouseup', this.onTouchUp);
        
        this.container.addEventListener('touchstart', this.onTouchDown, { passive: true });
        this.container.addEventListener('touchmove', this.onTouchMove, { passive: true });
        this.container.addEventListener('touchend', this.onTouchUp);
        
        // إضافة مؤشر الفأرة
        this.container.style.cursor = 'grab';
    }
    
    destroy() {
        // ... (وظيفة التنظيف كما هي)
        window.cancelAnimationFrame(this.raf);
        window.removeEventListener('resize', this.onResize);
        
        // إزالة مستمعات التفاعل من الحاوية
        this.container.removeEventListener('wheel', this.onWheel);
        this.container.removeEventListener('mousewheel', this.onWheel);
        this.container.removeEventListener('mousedown', this.onTouchDown);
        this.container.removeEventListener('mousemove', this.onTouchMove);
        this.container.removeEventListener('mouseup', this.onTouchUp);
        this.container.removeEventListener('touchstart', this.onTouchDown);
        this.container.removeEventListener('touchmove', this.onTouchMove);
        this.container.removeEventListener('touchend', this.onTouchUp);
        
        if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
            this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
        }
    }
}

// ----------------------------------------------------
// 6. تهيئة النظام العام (Global Init)
// ----------------------------------------------------

/**
 * 6.1. تهيئة الشريط الجانبي (Sidebar Toggle)
 */
function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('sidebar-toggle');
    const mainContent = document.getElementById('mainContent');
    const backdrop = document.getElementById('sidebar-backdrop');
    
    if (!sidebar || !toggleButton || !mainContent || !backdrop) {
        // ليست كل الصفحات تحتوي على شريط جانبي (مثل auth.html)
        return; 
    }

    const openSidebar = () => {
        sidebar.classList.remove('-translate-x-full');
        mainContent.classList.add('filter');
        backdrop.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // منع تمرير الجسم أثناء فتح الشريط
    };

    const closeSidebar = () => {
        sidebar.classList.add('-translate-x-full');
        mainContent.classList.remove('filter');
        backdrop.classList.add('hidden');
        document.body.style.overflow = '';
    };

    toggleButton.addEventListener('click', openSidebar);
    backdrop.addEventListener('click', closeSidebar);

    // إضافة مستمع لإغلاق الشريط عند النقر على رابط بداخله (لتجنب بقاء الشريط مفتوحاً)
    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeSidebar);
    });
}

/**
 * 6.2. تهيئة تبديل علامات التبويب في صفحة المصادقة (Auth Tabs)
 */
function initAuthTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    if (tabButtons.length === 0 || tabPanels.length === 0) {
        return; // ليست صفحة المصادقة
    }

    const switchTab = (targetId) => {
        tabButtons.forEach(btn => {
            btn.classList.remove('active', 'text-primary', 'font-bold');
            btn.classList.add('text-gray-400', 'font-medium');
            if (btn.getAttribute('data-target') === targetId) {
                btn.classList.add('active', 'text-primary', 'font-bold');
                btn.classList.remove('text-gray-400', 'font-medium');
            }
        });

        tabPanels.forEach(panel => {
            panel.classList.add('hidden');
            if (panel.id === targetId) {
                panel.classList.remove('hidden');
                panel.classList.add('animate-slide-down'); // تطبيق الأنيميشن عند التبديل
            }
        });
    };

    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = button.getAttribute('data-target');
            switchTab(targetId);
        });
    });

    // تعيين علامة التبويب الافتراضية عند التحميل
    if (tabButtons.length > 0) {
        switchTab(tabButtons[0].getAttribute('data-target'));
    }
}


// ----------------------------------------------------
// 7. وظيفة التهيئة الشاملة (Window Global Function)
// ----------------------------------------------------

// تهيئة المعرض الدائري (يجب أن يتم استدعاؤه في نهاية ملف HTML بعد تحميل العناصر)
window.initCircularGallery = function(containerId, items) {
    if (!window.OGL) {
        console.error("OGL library is not loaded. Cannot initialize CircularGallery.");
        return;
    }
    // نقوم بإنشاء مثيل جديد للتطبيق وإتلاف أي مثيل سابق
    if (window.galleryApp && window.galleryApp.destroy) {
        window.galleryApp.destroy();
    }

    window.galleryApp = new CircularGalleryApp(containerId, {
        items: items,
        // يمكن تعديل هذه القيم لضبط شكل المعرض
        bend: 3, 
        textColor: '#ffc72c',
        borderRadius: 0.05,
        font: 'bold 30px Expo Arabic, Cairo',
        scrollSpeed: 5,
        scrollEase: 0.1
    });
}

// تشغيل وظائف التهيئة العامة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initAuthTabs();
});

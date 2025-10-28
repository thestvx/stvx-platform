// script.js

// ----------------------------------------------------
// 1. إدارة الشريط الجانبي (Sidebar Toggle)
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('sidebarToggle');
    const mainContent = document.getElementById('mainContent');

    if (sidebar && toggleButton && mainContent) {
        toggleButton.addEventListener('click', () => {
            // تبديل فئة 'open' على الشريط الجانبي لإظهاره/إخفائه
            sidebar.classList.toggle('open');
            
            // تبديل الأيقونة (لأننا نستخدم Remix Icon <i>)
            const icon = toggleButton.querySelector('i'); 
            if (icon) {
                // Toggle between ri-menu-2-line and ri-close-line
                if (sidebar.classList.contains('open')) {
                    icon.classList.remove('ri-menu-2-line');
                    icon.classList.add('ri-close-line');
                } else {
                    icon.classList.remove('ri-close-line');
                    icon.classList.add('ri-menu-2-line');
                }
            }

            // التحكم بفئة 'filter' فقط لتطبيق/إزالة تأثير التعتيم
            if (sidebar.classList.contains('open')) {
                // إضافة فئة تظليل عند فتح الـ sidebar 
                mainContent.classList.add('filter'); 
            } else {
                // إزالة فئة التظليل عند إغلاق الـ sidebar
                mainContent.classList.remove('filter');
            }
        });
        
        // إغلاق الـ Sidebar عند النقر على محتوى الصفحة الرئيسي (للشاشات الصغيرة)
        mainContent.addEventListener('click', (event) => {
            // تحقق من أن الشاشة صغيرة وأن الـ sidebar مفتوح
            // ونضمن أن النقر لم يكن على رابط أو زر أو حقل إدخال (لتجنب تعطيل التفاعل)
            const isSmallScreen = window.innerWidth < 1024;
            const isSidebarOpen = sidebar.classList.contains('open');
            const isInteractive = event.target.closest('a, button, input, textarea, select');

            if (isSmallScreen && isSidebarOpen && !isInteractive) {
                sidebar.classList.remove('open');
                mainContent.classList.remove('filter');
                
                // إعادة الأيقونة إلى حالتها الأصلية
                const icon = toggleButton.querySelector('i');
                if (icon) {
                    icon.classList.remove('ri-close-line');
                    icon.classList.add('ri-menu-2-line');
                }
            }
        });

        // تحسين: إغلاق الشريط الجانبي عند تغيير حجم الشاشة من صغير إلى كبير
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                mainContent.classList.remove('filter');
                const icon = toggleButton.querySelector('i');
                if (icon) {
                    icon.classList.remove('ri-close-line');
                    icon.classList.add('ri-menu-2-line');
                }
            }
        });
    }

    // تهيئة وظائف التبويبات (لصفحة Auth)
    setupAuthTabs();
    
    // تهيئة وظيفة تتبع حقول الإدخال (لإضافة تأثيرات التركيز)
    setupInputFocusEffect();
    
    // التعديل الرئيسي: تفعيل تأثير Glass Hover على جميع العناصر التي تحمل الفئة المحددة
    setupGlassHover();
    
    // إخفاء الـ Loader عند تحميل المحتوى بالكامل
    hideLoader();
});

// ----------------------------------------------------
// 2. وظيفة تبديل التبويبات (Auth Tabs) - لصفحة Auth.html
// ----------------------------------------------------

function setupAuthTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            
            // 1. إزالة حالة 'active' من جميع الأزرار وإضافتها للزر الحالي
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // 2. إخفاء جميع اللوحات وإظهار اللوحة المستهدفة
            tabPanels.forEach(panel => {
                panel.classList.add('hidden');
                panel.classList.remove('flex');
                panel.classList.remove('animate-fade-in'); 
            });

            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
                targetPanel.classList.add('flex', 'animate-fade-in'); 
            }
        });
    });

    // 3. التأكد من أن التبويب الأول هو النشط عند تحميل الصفحة
    // هذا يحل مشكلة أن تظل جميع الأقسام مخفية عند التحميل
    if (tabButtons.length > 0 && !document.querySelector('.tab-button.active')) {
        tabButtons[0].click(); 
    }
}

// ----------------------------------------------------
// 3. إدارة الـ Loader (للاستخدام المستقبلي)
// ----------------------------------------------------

// يُفترض وجود عنصر في HTML يحمل ID "app-loader"
const loader = document.getElementById('app-loader');

/**
 * وظيفة لإظهار الـ Loader.
 */
function showLoader() {
    if (loader) {
        loader.classList.remove('hidden');
        loader.classList.add('flex');
    }
}

/**
 * وظيفة لإخفاء الـ Loader.
 */
function hideLoader() {
    if (loader) {
        // تم زيادة المهلة إلى 500ms لضمان رؤية تأثير التحميل
        setTimeout(() => {
            // نستخدم فئة CSS لعمل تأثير انتقال (opacity) قبل إخفائه نهائياً بـ display: none (أو hidden في Tailwind)
            loader.style.opacity = '0'; 
            setTimeout(() => {
                loader.classList.add('hidden');
                loader.classList.remove('flex');
            }, 300); // 300ms مدة الانتقال
        }, 500); // 500ms مهلة بسيطة لعرض اللودر
    }
}

// ----------------------------------------------------
// 4. وظيفة تأثيرات Glassmorphism (Glass Hover Effect)
// ----------------------------------------------------

/**
 * تطبق تأثير إمالة (Tilt/Parallax) عند التمرير على العناصر التي تحمل فئة 'glass-hover-effect'.
 * 💡 يجب إضافة فئة 'glass-hover-effect' إلى البطاقة في HTML لتفعيل التأثير عليها.
 */
function setupGlassHover() {
    // استهداف جميع العناصر التي تحمل الفئة المخصصة للتأثير
    const hoverTargets = document.querySelectorAll('.glass-hover-effect'); 

    hoverTargets.forEach(card => {
        // إضافة انتقال (transition) لضمان سلاسة حركة العودة
        card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // حساب الإحداثيات بالنسبة لمركز العنصر
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top; 
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // حساب الزاوية (بين -10 و 10)
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            // تطبيق التدوير والتظليل
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            card.style.boxShadow = `
                ${rotateY / 2}px ${rotateX / 2}px 30px rgba(255, 199, 44, 0.4),
                inset 0 0 15px rgba(255, 255, 255, 0.2)
            `;
        });

        card.addEventListener('mouseleave', () => {
            // إعادة التنسيق إلى الوضع الأصلي عند إبعاد المؤشر
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            card.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.37)'; 
        });
    });
}

// ----------------------------------------------------
// 5. وظيفة تأثير التركيز على حقول الإدخال (Input Focus Effect)
// ----------------------------------------------------

/**
 * تضيف فئة 'focused' إلى حقول الإدخال عند التركيز عليها.
 * يمكن استخدام هذه الفئة لتطبيق تنسيقات مخصصة (مثل Tailwind) عند التركيز.
 */
function setupInputFocusEffect() {
    // 🛠️ إضافة select و textarea
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            input.classList.remove('focused');
        });
    });
}

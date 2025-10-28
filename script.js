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

            // 🛠️ تعديل: التحكم بفئة 'filter' فقط لتطبيق/إزالة تأثير التعتيم 🛠️
            // فئة 'filter' هي التي تطبق التعتيم (blur) والـ grayscale في CSS
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
            // نضيف تحققاً للتأكد أن المستخدم لم يضغط على عنصر تفاعلي داخل mainContent
            if (window.innerWidth < 1024 && sidebar.classList.contains('open') && !event.target.closest('a, button, input')) {
                sidebar.classList.remove('open');
                // 🛠️ تعديل: إزالة فئة filter فقط 🛠️
                mainContent.classList.remove('filter');
                
                // إعادة الأيقونة إلى حالتها الأصلية
                const icon = toggleButton.querySelector('i');
                if (icon) {
                    icon.classList.remove('ri-close-line');
                    icon.classList.add('ri-menu-2-line');
                }
            }
        });

        // 🛠️ تحسين: إغلاق الشريط الجانبي عند تغيير حجم الشاشة من صغير إلى كبير
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                // 🛠️ تعديل: إزالة فئة filter فقط 🛠️
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
    
    // 💡 التعديل الرئيسي: تفعيل تأثير Glass Hover فقط إذا كانت بطاقة Auth موجودة
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
        setupGlassHover();
    }
    
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
    if (tabButtons.length > 0) {
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
        // نستخدم setTimeout لضمان اكتمال تحميل الصفحة ورؤية Loader لثواني معدودة (اختياري)
        setTimeout(() => {
            loader.classList.add('hidden');
            loader.classList.remove('flex');
        }, 300); // 300ms مهلة بسيطة
    }
}

// ----------------------------------------------------
// 4. وظيفة تأثيرات Glassmorphism (Glass Hover Effect)
// ----------------------------------------------------

/**
 * تطبق تأثير إمالة (Tilt/Parallax) عند التمرير
 * ليعمل فقط على بطاقة Auth.
 */
function setupGlassHover() {
    // 🛠️ التعديل: استهداف البطاقة الرئيسية لنموذج التسجيل/الدخول فقط
    // (يجب إضافة فئة auth-card إلى البطاقة في ملف auth.html)
    const glassCards = document.querySelectorAll('.glass-card.auth-card'); 

    glassCards.forEach(card => {
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

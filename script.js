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
            
            // تبديل الأيقونة (إذا كانت تستخدم Tailwind classes)
            const icon = toggleButton.querySelector('i'); // تم تغيير selector إلى i بدلاً من svg لأنه يتم استخدام Remix Icon
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

            // لتمكين إغلاق الـ sidebar عند الضغط خارجها على الشاشات الصغيرة
            if (sidebar.classList.contains('open')) {
                // إضافة فئة تظليل عند فتح الـ sidebar (مهم لعمل التنسيق الجديد في style.css)
                // نستخدم flex هنا للتأكد من أن MainContent هو عنصر مرئي
                mainContent.classList.add('lg:blur-none', 'filter', 'blur-sm'); 
            } else {
                // إزالة فئة التظليل عند إغلاق الـ sidebar
                mainContent.classList.remove('filter', 'blur-sm');
            }
        });
        
        // إغلاق الـ Sidebar عند النقر على محتوى الصفحة الرئيسي (للشاشات الصغيرة)
        mainContent.addEventListener('click', (event) => {
            // تحقق من أن الشاشة صغيرة وأن الـ sidebar مفتوح
            // window.innerWidth < 1024 يمثل شاشات الجوال (وفقًا لإعدادات Tailwind lg)
            if (window.innerWidth < 1024 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                mainContent.classList.remove('filter', 'blur-sm');
                
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
            // إذا أصبح حجم الشاشة كبير (أكبر من 1024 بكسل) وقائمة sidebar مفتوحة (في وضع الشاشات الصغيرة)
            if (window.innerWidth >= 1024 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                mainContent.classList.remove('filter', 'blur-sm');
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
    
    // 💡 تعديل جديد: تفعيل تأثير Glass Hover دائمًا لصفحات مثل Portfolio و Landing Page
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
                panel.classList.remove('animate-fade-in'); // لإيقاف أي أنيميشن سابق
            });

            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
                targetPanel.classList.add('flex', 'animate-fade-in'); // إضافة أنيميشن بسيط
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
 * هذه الوظيفة تطبق تأثير إمالة (Tilt/Parallax) عند التمرير 
 * لجعل تأثير Glassmorphism يبدو أكثر تفاعلية.
 */
function setupGlassHover() {
    // 🛠️ التعديل: استهداف البطاقات التي لا تحتوي على فئة 'project-card'
    // لتجنب تعارض الـ Hover مع تأثير الـ CSS في بطاقات المشاريع الصغيرة.
    const glassCards = document.querySelectorAll('.glass-card:not(.project-card)'); 

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
            card.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.37)'; // ظل الـ Glassmorphism الافتراضي
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

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
            const icon = toggleButton.querySelector('svg');
            if (icon) {
                icon.classList.toggle('rotate-180'); // تدوير الأيقونة عند الفتح/الإغلاق
            }

            // لتمكين إغلاق الـ sidebar عند الضغط خارجها على الشاشات الصغيرة
            if (sidebar.classList.contains('open')) {
                // إضافة فئة تظليل عند فتح الـ sidebar
                mainContent.classList.add('lg:blur-none', 'filter', 'blur-sm'); 
            } else {
                // إزالة فئة التظليل عند إغلاق الـ sidebar
                mainContent.classList.remove('filter', 'blur-sm');
            }
        });
        
        // إغلاق الـ Sidebar عند النقر على محتوى الصفحة الرئيسي (للشاشات الصغيرة)
        mainContent.addEventListener('click', (event) => {
            // تحقق من أن الشاشة صغيرة وأن الـ sidebar مفتوح
            if (window.innerWidth < 1024 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                mainContent.classList.remove('filter', 'blur-sm');
                const icon = toggleButton.querySelector('svg');
                if (icon) icon.classList.remove('rotate-180');
            }
        });
    }

    // تهيئة وظائف التبويبات (لصفحة Auth)
    setupAuthTabs();
    
    // 💡 الفحص الذكي: قم بتفعيل تأثير Glass Hover فقط إذا كانت الصفحة تحتوي على تبويبات التسجيل (Auth)
    const isAuthPage = document.querySelector('.tab-button');
    if (isAuthPage) {
        setupGlassHover();
    }
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
            });

            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
                targetPanel.classList.add('flex'); // استخدم فئة flex كما في Tailwind
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

/**
 * وظيفة لإظهار الـ Loader.
 */
function showLoader() {
    // ... (الكود الخاص بـ Loader)
}

/**
 * وظيفة لإخفاء الـ Loader.
 */
function hideLoader() {
    // ... (الكود الخاص بـ Loader)
}

// ----------------------------------------------------
// 4. وظيفة تأثيرات Glassmorphism (Glass Hover Effect)
// ----------------------------------------------------

/* * هذه الوظيفة تطبق تأثير إمالة (Tilt/Parallax) عند التمرير 
 * لجعل تأثير Glassmorphism يبدو أكثر تفاعلية.
 */
function setupGlassHover() {
    const glassCards = document.querySelectorAll('.glass-card');

    glassCards.forEach(card => {
        // إضافة انتقال (transition) لضمان سلاسة حركة العودة
        card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';

        card.addEventListener('mousemove', (e) => {
            // الحصول على أبعاد العنصر
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

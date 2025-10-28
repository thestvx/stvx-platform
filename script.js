// script.js (وظائف عامة وتهيئة للعناصر)

// ----------------------------------------------------
// 1. وظائف المساعدة العامة (Helper Functions)
// ----------------------------------------------------

// الوظائف القديمة تم حذفها لتنظيف الكود كما أشرت في تعليقك.

// ----------------------------------------------------
// 2. تهيئة الشريط الجانبي (Sidebar Toggle)
// ----------------------------------------------------

/**
 * تهيئة آلية فتح وإغلاق الشريط الجانبي (Sidebar)
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
        // تم إزالة 'filter'
        backdrop.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // منع تمرير الجسم أثناء فتح الشريط
    };

    const closeSidebar = () => {
        sidebar.classList.add('-translate-x-full');
        // mainContent.classList.remove('filter');
        backdrop.classList.add('hidden');
        document.body.style.overflow = '';
    };

    toggleButton.addEventListener('click', openSidebar);
    backdrop.addEventListener('click', closeSidebar);

    // إضافة مستمع لإغلاق الشريط عند النقر على رابط بداخله
    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeSidebar);
    });
}

// ----------------------------------------------------
// 3. تهيئة تبديل علامات التبويب في صفحة المصادقة (Auth Tabs)
// ----------------------------------------------------

/**
 * تهيئة تبديل علامات التبويب في صفحة المصادقة (Auth Tabs)
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
// 4. وظيفة تأثير التكبير السلس عند التحويم (Smooth Zoom) 🆕
// ----------------------------------------------------

/**
 * تهيئة تأثير التكبير السلس على العناصر المحددة (يفترض وجود كلاسات CSS/Tailwind جاهزة: 
 * 'transition-transform duration-300 ease-in-out' و 'scale-110').
 * يجب إضافة الكلاس 'zoom-target' إلى العناصر التي تريد تطبيق التأثير عليها.
 */
function initImageHoverZoom() {
    // العناصر المراد تطبيق التكبير عليها.
    // يجب أن تكون هذه العناصر هي الصور أو الحاويات التي تحويها.
    const zoomTargets = document.querySelectorAll('.zoom-target'); 

    if (zoomTargets.length === 0) {
        return;
    }

    zoomTargets.forEach(target => {
        // إضافة كلاسات الانتقال (Transition) الأساسية لضمان السلاسة
        // (إذا لم تكن مضافة بالفعل في HTML/CSS).
        target.classList.add('transition-transform', 'duration-300', 'ease-in-out');

        // عند التحويم (mouseover)
        target.addEventListener('mouseenter', () => {
            // إضافة كلاس التكبير (يجب أن يكون 'scale-110' أو ما يعادله في CSS)
            target.classList.add('scale-110'); 
        });

        // عند مغادرة التحويم (mouseout)
        target.addEventListener('mouseleave', () => {
            // إزالة كلاس التكبير للعودة إلى الحجم الأصلي (scale-100 أو بدون scale)
            target.classList.remove('scale-110');
        });
    });
}


// ----------------------------------------------------
// 5. التشغيل العام (Global Execution)
// ----------------------------------------------------

/**
 * تشغيل وظائف التهيئة العامة عند تحميل الصفحة
 */
document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initAuthTabs();
    initImageHoverZoom(); // 🆕 إضافة وظيفة التكبير السلس
});

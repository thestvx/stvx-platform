// script.js (وظائف عامة وتهيئة للعناصر)

// ----------------------------------------------------
// وظائف المساعدة العامة (Helper Functions)
// ----------------------------------------------------

// هذه الوظائف لم تعد ضرورية بعد إزالة OGL Gallery
/*
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
*/

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
        // تم إزالة 'filter' من هنا لضمان عدم تأثيره على أداء المعرض الجديد
        // mainContent.classList.add('filter');
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

/**
 * تم حذف وظيفة window.initCircularGallery بالكامل.
 * تم إبقاء وظائف التهيئة العامة فقط.
 */

// تشغيل وظائف التهيئة العامة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initAuthTabs();
});

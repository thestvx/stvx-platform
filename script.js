// script.js (وظائف عامة وتهيئة للعناصر)

// ----------------------------------------------------
// 1. تهيئة الشريط الجانبي (Sidebar Toggle)
// ----------------------------------------------------
function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('sidebar-toggle');
    const mainContent = document.getElementById('mainContent');
    const backdrop = document.getElementById('sidebar-backdrop');
    
    if (!sidebar || !toggleButton || !mainContent || !backdrop) {
        return; 
    }

    const openSidebar = () => {
        sidebar.classList.remove('-translate-x-full');
        backdrop.classList.remove('hidden');
        // تعديل: استخدام كلاس overflow-hidden بدلاً من التعديل المباشر
        document.body.classList.add('overflow-hidden'); 
    };

    const closeSidebar = () => {
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
        // تعديل: إزالة كلاس overflow-hidden
        document.body.classList.remove('overflow-hidden'); 
    };

    toggleButton.addEventListener('click', openSidebar);
    backdrop.addEventListener('click', closeSidebar);

    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeSidebar);
    });
}

// ----------------------------------------------------
// 2. تهيئة تبديل علامات التبويب في صفحة المصادقة (Auth Tabs)
// ----------------------------------------------------
function initAuthTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    if (tabButtons.length === 0 || tabPanels.length === 0) {
        return; 
    }

    const switchTab = (targetId) => {
        tabButtons.forEach(btn => {
            // إزالة حالة التفعيل من جميع الأزرار
            btn.classList.remove('active', 'text-primary', 'font-bold');
            btn.classList.add('text-gray-400', 'font-medium');
            
            // تفعيل الزر المستهدف
            if (btn.getAttribute('data-target') === targetId) {
                btn.classList.add('active', 'text-primary', 'font-bold');
                btn.classList.remove('text-gray-400', 'font-medium');
            }
        });

        tabPanels.forEach(panel => {
            // إخفاء جميع اللوحات
            panel.classList.add('hidden');
            
            // إظهار اللوحة المستهدفة مع تأثير حركي
            if (panel.id === targetId) {
                panel.classList.remove('hidden');
                // نترك animate-slide-down على افتراض وجودها في الـ CSS/Tailwind
                panel.classList.add('animate-slide-down'); 
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

    // تفعيل أول تبويب عند التحميل
    if (tabButtons.length > 0) {
        switchTab(tabButtons[0].getAttribute('data-target'));
    }
}

// ----------------------------------------------------
// 3. التشغيل العام (Global Execution)
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initAuthTabs();
    // تم إلغاء: initClickLightbox(); 
    // تم إلغاء: initImageLightboxOnHover(); 
    // تم إلغاء: initImageModalGallery(); 
});

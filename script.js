// script.js (وظائف عامة وتهيئة للعناصر)

// ----------------------------------------------------
// 1. تهيئة الشريط الجانبي (Sidebar Toggle) 💻
// ----------------------------------------------------
function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('sidebar-toggle');
    const backdrop = document.getElementById('sidebar-backdrop');
    
    // التحقق من وجود جميع العناصر المطلوبة قبل المتابعة
    if (!sidebar || !toggleButton || !backdrop) {
        return; 
    }

    const openSidebar = () => {
        // إزالة فئة الإخفاء/الإزاحة لفتح الشريط
        sidebar.classList.remove('-translate-x-full');
        backdrop.classList.remove('hidden');
        // منع التمرير في جسم الصفحة عند فتح الشريط الجانبي (للتناسق مع الـ Backdrop)
        document.body.classList.add('overflow-hidden'); 
    };

    const closeSidebar = () => {
        // إضافة فئة الإخفاء/الإزاحة لإغلاق الشريط
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
        // السماح بالتمرير مرة أخرى
        document.body.classList.remove('overflow-hidden'); 
    };

    // ربط الأحداث
    toggleButton.addEventListener('click', openSidebar);
    backdrop.addEventListener('click', closeSidebar);

    // إغلاق الشريط الجانبي عند النقر على أي رابط داخله
    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeSidebar);
    });
}

// ----------------------------------------------------
// 2. تهيئة تبديل علامات التبويب في صفحة المصادقة (Auth Tabs) ➡️
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
            panel.classList.remove('animate-slide-down'); // إزالة الحركة قبل الإظهار

            // إظهار اللوحة المستهدفة مع تأثير حركي (على افتراض وجوده في CSS/Tailwind)
            if (panel.id === targetId) {
                panel.classList.remove('hidden');
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

    // التفعيل التلقائي عند التحميل: تفعيل التبويب الذي يحتوي على كلاس 'active' أو أول تبويب بشكل افتراضي
    const activeTabButton = document.querySelector('.tab-button.active');
    if (activeTabButton) {
         switchTab(activeTabButton.getAttribute('data-target'));
    } else if (tabButtons.length > 0) {
        // تفعيل الأول إذا لم يكن هناك أي تبويب 'active' مسبقاً
        switchTab(tabButtons[0].getAttribute('data-target'));
    }
}

// ----------------------------------------------------
// 3. إضافة وظيفة الأزرار المنسدلة (Dropdowns) 🔽
// ----------------------------------------------------
function initDropdowns() {
    // جميع الأزرار التي تفتح قائمة منسدلة
    const dropdownToggles = document.querySelectorAll('[data-dropdown-toggle]');

    dropdownToggles.forEach(toggle => {
        const targetId = toggle.getAttribute('data-dropdown-toggle');
        const dropdownMenu = document.getElementById(targetId);

        if (!dropdownMenu) return;

        // وظيفة لإغلاق جميع القوائم المنسدلة باستثناء القائمة المستهدفة (للتأكد من أن قائمة واحدة فقط مفتوحة)
        const closeAllDropdowns = (currentMenu) => {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu !== currentMenu) {
                    menu.classList.add('hidden');
                    menu.classList.remove('block');
                }
            });
        };

        toggle.addEventListener('click', (e) => {
            e.stopPropagation(); // منع انتقال النقر إلى الـ document

            // تبديل حالة الظهور/الإخفاء
            const isHidden = dropdownMenu.classList.contains('hidden');
            
            // أغلق الجميع أولاً ثم افتح المستهدف إذا كان مخفياً
            closeAllDropdowns(dropdownMenu);
            
            if (isHidden) {
                dropdownMenu.classList.remove('hidden');
                dropdownMenu.classList.add('block');
            } else {
                dropdownMenu.classList.add('hidden');
                dropdownMenu.classList.remove('block');
            }
        });
    });

    // إغلاق القوائم المنسدلة عند النقر خارجها
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.add('hidden');
            menu.classList.remove('block');
        });
    });
}

// ----------------------------------------------------
// 4. التشغيل العام لجميع الوظائف (Global Execution) 🚀
// ----------------------------------------------------

/**
 * دالة مركزية لتهيئة جميع مكونات JavaScript في الصفحة.
 * يتم استدعاؤها بعد تحميل محتوى DOM بالكامل.
 */
function initAllComponents() {
    initSidebarToggle(); // تهيئة الشريط الجانبي
    initAuthTabs();      // تهيئة تبديل علامات التبويب (في صفحة المصادقة غالباً)
    initDropdowns();     // تهيئة القوائم المنسدلة

    // هنا يمكنك إضافة استدعاءات لوظائف تهيئة أخرى مثل:
    // initLightbox();
    // initImageGallery();
}

// الانتظار حتى يتم تحميل محتوى DOM بالكامل لبدء تهيئة المكونات
document.addEventListener('DOMContentLoaded', initAllComponents);

// script.js (وظائف عامة وتهيئة للعناصر)

// ----------------------------------------------------
// 1. تهيئة الشريط الجانبي (Sidebar Toggle)
// ----------------------------------------------------
// (وظيفة initSidebarToggle لم تتغير - تم حذفها هنا للاختصار، لكنها موجودة في النهاية)
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
        document.body.style.overflow = 'hidden'; 
    };

    const closeSidebar = () => {
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
        document.body.style.overflow = '';
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
// (وظيفة initAuthTabs لم تتغير - تم حذفها هنا للاختصار، لكنها موجودة في النهاية)
function initAuthTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    if (tabButtons.length === 0 || tabPanels.length === 0) {
        return; 
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

    if (tabButtons.length > 0) {
        switchTab(tabButtons[0].getAttribute('data-target'));
    }
}


// ----------------------------------------------------
// 3. 🆕 وظيفة Lightbox On Hover (الصورة تطفو وتظهر في المنتصف) 🆕
// ----------------------------------------------------

/**
 * تهيئة تأثير عرض الصورة بشكل عائم وبأبعادها الأصلية في منتصف الشاشة عند التحويم.
 * يجب إضافة الكلاس 'lightbox-trigger' إلى عنصر الصورة (img) داخل البطاقة.
 */
function initImageLightboxOnHover() {
    const triggers = document.querySelectorAll('.lightbox-trigger'); 

    if (triggers.length === 0) {
        return;
    }

    // عنصر حاوية للعرض العائم سيتم إنشاؤه لمرة واحدة
    let floatingImageContainer = null;

    const createContainer = () => {
        if (!floatingImageContainer) {
            floatingImageContainer = document.createElement('div');
            floatingImageContainer.id = 'floating-image-container';
            // تطبيق كلاسات التحكم في المظهر والتمركز (يجب تعريفها في CSS)
            floatingImageContainer.classList.add('floating-image-wrapper'); 
            document.body.appendChild(floatingImageContainer);
        }
    };

    const showImage = (originalImage) => {
        if (!floatingImageContainer) return;

        // 1. حساب موضع الصورة الأصلية
        const rect = originalImage.getBoundingClientRect();

        // 2. إنشاء نسخة طبق الأصل من الصورة
        const clonedImage = originalImage.cloneNode(true);
        clonedImage.classList.add('cloned-image');
        
        // 3. إعداد الأبعاد والموقع الأولي (مطابق للأصلية)
        Object.assign(clonedImage.style, {
            position: 'absolute',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            opacity: '0', // تبدأ شفافة
            transform: 'scale(1)',
        });

        // إفراغ الحاوية وإضافة النسخة
        floatingImageContainer.innerHTML = '';
        floatingImageContainer.appendChild(clonedImage);
        
        // إظهار النسخة المزدوجة وتفعيل الانتقال إلى المنتصف (بعد مهلة قصيرة للسماح بـ DOM Update)
        setTimeout(() => {
            // إخفاء الصورة الأصلية مؤقتاً
            originalImage.style.opacity = '0'; 

            clonedImage.style.opacity = '1';
            clonedImage.classList.add('is-centered'); // كلاس يطبق التمركز والأبعاد الأصلية في CSS
        }, 10); // مهلة قصيرة جداً

        return clonedImage;
    };

    const hideImage = (clonedImage, originalImage) => {
        if (!clonedImage || !originalImage || !floatingImageContainer) return;

        const rect = originalImage.getBoundingClientRect();
        
        // 1. إعادة الصورة العائمة إلى موقع الصورة الأصلية
        Object.assign(clonedImage.style, {
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            opacity: '0', 
            transform: 'scale(1)',
        });
        clonedImage.classList.remove('is-centered'); 
        
        // 2. إزالة الصورة العائمة وإظهار الأصلية بعد انتهاء الانتقال
        setTimeout(() => {
            if (floatingImageContainer.contains(clonedImage)) {
                floatingImageContainer.removeChild(clonedImage);
            }
            originalImage.style.opacity = '1'; 
        }, 600); // 600ms تتوافق مع مدة الانتقال في CSS
    };
    
    // إنشاء الحاوية مرة واحدة
    createContainer();

    triggers.forEach(trigger => {
        let clonedImg = null;

        trigger.addEventListener('mouseenter', () => {
            clonedImg = showImage(trigger);
        });

        trigger.addEventListener('mouseleave', () => {
            // يجب التأكد من أن الماوس لم يدخل إلى الصورة العائمة مباشرة
            // ولكن في هذا السيناريو، يجب أن نعتمد فقط على ترك الصورة الأصلية
            hideImage(clonedImg, trigger);
        });
    });
}


// ----------------------------------------------------
// 4. التشغيل العام (Global Execution)
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initAuthTabs();
    initImageLightboxOnHover(); // 🆕 تشغيل وظيفة Lightbox
});

// ----------------------------------------------------
// * إزالة وظيفة initImageHoverZoom القديمة إذا كانت موجودة *
// ----------------------------------------------------

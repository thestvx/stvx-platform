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
// 3. 🆕 وظيفة Lightbox عند النقر (LightBox on Click) 🆕
// ----------------------------------------------------
/**
 * تهيئة Lightbox لفتح صورة المشروع عند النقر عليها.
 * يعتمد على وجود العناصر في الـ HTML: #lightbox و #lightbox-image.
 */
function initClickLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    
    // العناصر المطلوبة للوظيفة
    if (!lightbox || !lightboxImage) {
        return;
    }

    const triggers = document.querySelectorAll('.lightbox-trigger');

    // وظيفة فتح النافذة
    const openLightbox = (src) => {
        lightboxImage.src = src; 
        lightbox.classList.add('active'); 
        document.body.style.overflow = 'hidden'; 
    };

    // وظيفة إغلاق النافذة
    const closeLightbox = (event) => {
        // الإغلاق عند الضغط على زر الإغلاق أو الخلفية الشفافة
        if (event.target.classList.contains('lightbox-overlay') || event.target.closest('.lightbox-close') || event.target.id === 'lightbox') {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; 
        }
    }

    // ربط الحدث بجميع العناصر التي تحمل الكلاس .lightbox-trigger
    triggers.forEach(trigger => {
        // للتأكد من أننا نلتقط النقر على العنصر الأب (الرابط <a>) إذا كانت الصورة بداخله
        // أو النقر على الصورة نفسها.
        const clickableParent = trigger.closest('a') || trigger;
        
        clickableParent.addEventListener('click', (e) => {
            // منع السلوك الافتراضي للرابط (#)
            e.preventDefault(); 
            // الحصول على مصدر الصورة من وسم <img>
            const imageSrc = trigger.getAttribute('src');
            if (imageSrc) {
                openLightbox(imageSrc);
            }
        });
    });

    // إضافة مستمع الإغلاق على الـ Lightbox نفسه
    lightbox.addEventListener('click', closeLightbox);
    
    // إغلاق Lightbox عند الضغط على مفتاح ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
             // إغلاق مباشرة
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}


// ----------------------------------------------------
// 4. وظيفة Lightbox On Hover (الصورة تطفو وتظهر في المنتصف)
// ----------------------------------------------------

function initImageLightboxOnHover() {
    const triggers = document.querySelectorAll('.lightbox-hover-trigger'); // تم تغيير الكلاس لتجنب التضارب مع lightbox-trigger للنقر
    
    if (triggers.length === 0) {
        return;
    }

    let floatingImageContainer = null;

    const createContainer = () => {
        if (!floatingImageContainer) {
            floatingImageContainer = document.createElement('div');
            floatingImageContainer.id = 'floating-image-container';
            floatingImageContainer.classList.add('floating-image-wrapper'); 
            document.body.appendChild(floatingImageContainer);
        }
    };

    const showImage = (originalImage) => {
        if (!floatingImageContainer) return;

        const rect = originalImage.getBoundingClientRect();

        const clonedImage = originalImage.cloneNode(true);
        clonedImage.classList.add('cloned-image');
        
        Object.assign(clonedImage.style, {
            position: 'absolute',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            opacity: '0', 
            transform: 'scale(1)',
            transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
        });

        floatingImageContainer.innerHTML = '';
        floatingImageContainer.appendChild(clonedImage);
        
        setTimeout(() => {
            originalImage.style.opacity = '0'; 

            clonedImage.style.opacity = '1';
            clonedImage.classList.add('is-centered'); 
        }, 10); 

        return clonedImage;
    };

    const hideImage = (clonedImage, originalImage) => {
        if (!clonedImage || !originalImage || !floatingImageContainer) return;

        const rect = originalImage.getBoundingClientRect();
        
        Object.assign(clonedImage.style, {
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            opacity: '0', 
            transform: 'scale(1)',
        });
        clonedImage.classList.remove('is-centered'); 
        
        const transitionDuration = 600; 
        setTimeout(() => {
            if (floatingImageContainer.contains(clonedImage)) {
                floatingImageContainer.removeChild(clonedImage);
            }
            originalImage.style.opacity = '1'; 
        }, transitionDuration); 
    };
    
    createContainer();

    triggers.forEach(trigger => {
        let clonedImg = null;

        trigger.addEventListener('mouseenter', () => {
            clonedImg = showImage(trigger);
        });

        trigger.addEventListener('mouseleave', () => {
            hideImage(clonedImg, trigger);
        });
    });
}


// ----------------------------------------------------
// 5. التشغيل العام (Global Execution)
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initAuthTabs();
    initClickLightbox(); // 🆕 تشغيل وظيفة Lightbox للنقر
    initImageLightboxOnHover(); // تشغيل وظيفة Lightbox للتحويم
});

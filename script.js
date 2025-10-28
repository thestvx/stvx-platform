// script.js (وظائف عامة وتهيئة للعناصر)

// ----------------------------------------------------
// 1. تهيئة الشريط الجانبي (Sidebar Toggle)
// ----------------------------------------------------
function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('sidebar-toggle');
    const mainContent = document.getElementById('mainContent'); // ملاحظة: لم يتم استخدام mainContent في الوظيفة، لكن الاحتفاظ به جيد
    const backdrop = document.getElementById('sidebar-backdrop');
    
    if (!sidebar || !toggleButton || !mainContent || !backdrop) {
        // الخروج إذا كانت العناصر المطلوبة غير موجودة في الصفحة
        return; 
    }

    const openSidebar = () => {
        sidebar.classList.remove('-translate-x-full');
        backdrop.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // لمنع التمرير عندما تكون القائمة الجانبية مفتوحة
    };

    const closeSidebar = () => {
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
        document.body.style.overflow = ''; // استعادة التمرير
    };

    toggleButton.addEventListener('click', openSidebar);
    backdrop.addEventListener('click', closeSidebar);
    // إغلاق الشريط الجانبي عند النقر على أي رابط داخله
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
// 3. 🆕 وظيفة Lightbox On Hover (الصورة تطفو وتظهر في المنتصف) 🆕
// ----------------------------------------------------

/**
 * تهيئة تأثير عرض الصورة بشكل عائم وبأبعادها الأصلية في منتصف الشاشة عند التحويم.
 * يجب إضافة الكلاس 'lightbox-trigger' إلى عنصر الصورة (img) داخل البطاقة.
 * ملاحظة: تعتمد هذه الوظيفة بشكل كبير على تعريف كلاسات مثل 'floating-image-wrapper' و 'cloned-image.is-centered' في ملفات CSS/Tailwind.
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
            // إضافة خاصية الانتقال (transition) هنا قد تكون أكثر مرونة من CSS
            transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' // مثال لتسريع وتسهيل التحكم بالحركة
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
        // يجب أن تتطابق المدة مع مدة الانتقال (transition) المطبقة
        const transitionDuration = 600; // 600ms = 0.6s (كما في Transition أعلاه)
        setTimeout(() => {
            if (floatingImageContainer.contains(clonedImage)) {
                floatingImageContainer.removeChild(clonedImage);
            }
            originalImage.style.opacity = '1'; 
        }, transitionDuration); 
    };
    
    // إنشاء الحاوية مرة واحدة
    createContainer();

    triggers.forEach(trigger => {
        let clonedImg = null;

        trigger.addEventListener('mouseenter', () => {
            clonedImg = showImage(trigger);
        });

        trigger.addEventListener('mouseleave', () => {
            // إخفاء الصورة العائمة والعودة إلى الأصلية
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

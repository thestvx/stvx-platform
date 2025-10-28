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
// 3. وظيفة Lightbox عند النقر (LightBox on Click)
// ----------------------------------------------------
/**
 * تهيئة Lightbox لفتح صورة المشروع عند النقر عليها.
 * يعتمد على وجود العناصر في الـ HTML: #lightbox و #lightbox-image.
 * @NOTE: هذا هو القسم الذي تم تحسين طريقة استخراج مصدر الصورة فيه.
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
        // تعديل: استخدام كلاس overflow-hidden بدلاً من التعديل المباشر
        document.body.classList.add('overflow-hidden'); 
    };

    // وظيفة إغلاق النافذة
    const closeLightbox = (event) => {
        // الإغلاق عند الضغط على زر الإغلاق أو الخلفية الشفافة
        if (event.target.classList.contains('lightbox-overlay') || event.target.closest('.lightbox-close') || event.target.id === 'lightbox') {
            lightbox.classList.remove('active');
            // تعديل: إزالة كلاس overflow-hidden
            document.body.classList.remove('overflow-hidden'); 
        }
    }

    // ربط الحدث بجميع العناصر التي تحمل الكلاس .lightbox-trigger
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => { 
            // منع السلوك الافتراضي للرابط (#) إذا كان trigger رابطاً
            if (trigger.tagName === 'A') {
                e.preventDefault(); 
            }
            
            // === الحل والتعديل: تحديد وسم الصورة بشكل صحيح ===
            // 1. البحث عن وسم <img> داخل العنصر trigger، أو استخدام trigger نفسه إذا كان هو <img>.
            let imageElement = null;
            if (trigger.tagName === 'IMG') {
                 imageElement = trigger;
            } else if (trigger.tagName === 'A' || trigger.tagName === 'DIV' || trigger.tagName === 'BUTTON') {
                 imageElement = trigger.querySelector('img');
            }
            
            if (imageElement) {
                const imageSrc = imageElement.getAttribute('src');
                if (imageSrc) {
                    openLightbox(imageSrc);
                } else {
                    // إذا لم يتم العثور على src في وسم img، تحقق من بيانات الرابط مباشرة
                    const dataSrc = trigger.getAttribute('data-src'); // قد تكون الصورة في data-src إذا كان الكلاس على الرابط
                    if (dataSrc) {
                        openLightbox(dataSrc);
                    }
                }
            } else {
                // محاولة أخيرة: التحقق من مصدر الصورة مباشرة من الـ trigger إذا لم يكن img ولكنه يحمل data-src
                const dataSrc = trigger.getAttribute('data-src');
                 if (dataSrc) {
                    openLightbox(dataSrc);
                }
            }
            // ===============================================
        });
    });

    // إضافة مستمع الإغلاق على الـ Lightbox نفسه
    lightbox.addEventListener('click', closeLightbox);
    
    // إغلاق Lightbox عند الضغط على مفتاح ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
             // إغلاق مباشرة
             lightbox.classList.remove('active');
             document.body.classList.remove('overflow-hidden'); // تعديل: إزالة كلاس overflow-hidden
        }
    });
}


// ----------------------------------------------------
// 4. وظيفة Lightbox On Hover (الصورة تطفو وتظهر في المنتصف)
// ----------------------------------------------------

function initImageLightboxOnHover() {
    // تم توحيد اسم المتغيرات لتكون أكثر وضوحاً
    const hoverTriggers = document.querySelectorAll('.lightbox-hover-trigger'); 
    
    if (hoverTriggers.length === 0) {
        return;
    }

    let floatingImageContainer = null;

    const createContainer = () => {
        if (!floatingImageContainer) {
            floatingImageContainer = document.createElement('div');
            floatingImageContainer.id = 'floating-image-container';
            // نستخدم wrapper لضمان أن الصورة العائمة تكون في الأعلى دائماً
            floatingImageContainer.classList.add('floating-image-wrapper'); 
            document.body.appendChild(floatingImageContainer);
        }
    };

    const showImage = (originalImage) => {
        if (!floatingImageContainer) return;

        const rect = originalImage.getBoundingClientRect();

        const clonedImage = originalImage.cloneNode(true);
        clonedImage.classList.add('cloned-image');
        
        // تطبيق الأنماط الأولية للانتقال من موقع الصورة الأصلية
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
            // إخفاء الصورة الأصلية بعد نسخها
            originalImage.style.opacity = '0'; 

            // بدء حركة الانتقال إلى المنتصف (يجب أن يتم تعريف أنماط is-centered في الـ CSS)
            clonedImage.style.opacity = '1';
            clonedImage.classList.add('is-centered'); 
        }, 10); 

        return clonedImage;
    };

    const hideImage = (clonedImage, originalImage) => {
        if (!clonedImage || !originalImage || !floatingImageContainer) return;

        const rect = originalImage.getBoundingClientRect();
        
        // إعادة الصورة إلى موقعها الأصلي قبل الحذف
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
            originalImage.style.opacity = '1'; // إظهار الصورة الأصلية مرة أخرى
        }, transitionDuration); 
    };
    
    createContainer();

    hoverTriggers.forEach(trigger => {
        let clonedImg = null; // متغير لتخزين الصورة المستنسخة لكل عنصر

        trigger.addEventListener('mouseenter', () => {
            clonedImg = showImage(trigger);
        });

        trigger.addEventListener('mouseleave', () => {
            hideImage(clonedImg, trigger);
        });
    });
}

// ----------------------------------------------------
// 5. تهيئة معرض الصور المودال (Programs Image Modal)
// ----------------------------------------------------
/**
 * وظيفة خاصة بصفحة programs.html للتحكم في ظهور الـ modal الخاصة بالصور.
 */
function initImageModalGallery() {
    const imageModal = document.getElementById('image-modal'); // تم تغيير اسم المتغير
    const fullImage = document.getElementById('full-image');
    const closeModalButton = document.getElementById('close-modal'); // تم تغيير اسم المتغير
    const cardLinkWrappers = document.querySelectorAll('.card-link-wrapper');

    if (!imageModal || !fullImage || !closeModalButton || cardLinkWrappers.length === 0) {
        // لا تشغل الوظيفة إذا لم يتم العثور على العناصر، أي أننا لسنا في صفحة programs.html
        return;
    }

    // وظيفة إخفاء الـ Modal
    const hideModal = () => {
        imageModal.classList.remove('opacity-100', 'visible');
        imageModal.classList.add('opacity-0', 'invisible');
        
        // ✅ إعادة التمرير إلى الجسم (إذا كان قد تم إيقافه)
        document.body.classList.remove('overflow-hidden');
        
        // تأخير إزالة مصدر الصورة حتى انتهاء الانتقال
        setTimeout(() => { fullImage.src = ''; }, 500);
    }
    
    // ربط الحدث بجميع الروابط التي تحمل الكلاس .card-link-wrapper
    cardLinkWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', (e) => {
            e.preventDefault(); // منع الانتقال إلى #

            // ✅ التأكد من الحصول على مصدر الصورة ✅
            const imageUrl = wrapper.getAttribute('data-image-url') || wrapper.querySelector('img')?.getAttribute('src');
            
            if (imageUrl) {
                fullImage.src = imageUrl;

                // إظهار الـ Modal
                imageModal.classList.remove('opacity-0', 'invisible');
                imageModal.classList.add('opacity-100', 'visible');
                
                // ✅ التعديل لحل مشكلة السكرول ✅
                // منع التمرير على الجسم
                document.body.classList.add('overflow-hidden');
                
                // نقل تركيز الشاشة إلى أعلى الـ modal (إلى أعلى الصفحة)
                window.scrollTo(0, 0); 
            }
        });
    });

    // إغلاق الـ Modal عند النقر على زر الإغلاق
    closeModalButton.addEventListener('click', hideModal);

    // إغلاق الـ Modal عند النقر خارج الصورة (على الخلفية السوداء)
    imageModal.addEventListener('click', (e) => {
        // تحقق ما إذا كان النقر على الـ modal نفسه وليس على الـ content (الصورة)
        if (e.target.id === 'image-modal') { 
            hideModal();
        }
    });

    // إغلاق الـ Modal عند الضغط على مفتاح ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && imageModal.classList.contains('opacity-100')) {
            hideModal();
        }
    });
}


// ----------------------------------------------------
// 6. التشغيل العام (Global Execution)
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initAuthTabs();
    initClickLightbox(); 
    initImageLightboxOnHover(); 
    
    // تشغيل وظيفة معرض الصور المودال الجديدة
    initImageModalGallery(); 
});

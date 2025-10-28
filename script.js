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
        document.body.classList.add('overflow-hidden'); // 💡 تعديل: منع التمرير
    };

    const closeSidebar = () => {
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
        document.body.classList.remove('overflow-hidden'); // 💡 تعديل: السماح بالتمرير
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
// 3. وظيفة Lightbox عند النقر (LightBox on Click)
// ----------------------------------------------------
function initClickLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    
    if (!lightbox || !lightboxImage) {
        return;
    }

    const triggers = document.querySelectorAll('.lightbox-trigger');

    const openLightbox = (src) => {
        lightboxImage.src = src; 
        lightbox.classList.add('active'); 
        document.body.classList.add('overflow-hidden'); // 💡 تعديل: منع التمرير
    };

    const closeLightbox = (event) => {
        // الإغلاق عند الضغط على زر الإغلاق أو الخلفية الشفافة
        if (event.target.classList.contains('lightbox-overlay') || event.target.closest('.lightbox-close') || event.target.id === 'lightbox') {
            lightbox.classList.remove('active');
            document.body.classList.remove('overflow-hidden'); // 💡 تعديل: السماح بالتمرير
        }
    }

    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => { 
            if (trigger.tagName === 'A') {
                e.preventDefault(); 
            }
            
            // البحث عن وسم <img> داخل trigger أو استخدام trigger نفسه
            const imageElement = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img');
            
            if (imageElement) {
                const imageSrc = imageElement.getAttribute('src');
                if (imageSrc) {
                    openLightbox(imageSrc);
                }
            }
        });
    });

    lightbox.addEventListener('click', closeLightbox);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
             lightbox.classList.remove('active');
             document.body.classList.remove('overflow-hidden');
        }
    });
}


// ----------------------------------------------------
// 4. وظيفة Lightbox On Hover (الصورة تطفو وتظهر في المنتصف)
// ----------------------------------------------------

function initImageLightboxOnHover() {
    const triggers = document.querySelectorAll('.lightbox-hover-trigger'); 
    
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

    // (وظائف showImage و hideImage لم تتغير، وهي منطقية)
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
// 5. تهيئة معرض الصور المودال (Programs Image Modal)
// ----------------------------------------------------
function initImageModalGallery() {
    const modal = document.getElementById('image-modal');
    const fullImage = document.getElementById('full-image');
    const closeModal = document.getElementById('close-modal');
    const cardLinkWrappers = document.querySelectorAll('.card-link-wrapper');

    if (!modal || !fullImage || !closeModal || cardLinkWrappers.length === 0) {
        return;
    }

    // وظيفة إخفاء الـ Modal
    const hideModal = () => {
        modal.classList.remove('opacity-100', 'visible');
        modal.classList.add('opacity-0', 'invisible');
        
        // 🛑 إعادة التمرير إلى الجسم
        document.body.classList.remove('overflow-hidden');
        
        setTimeout(() => { fullImage.src = ''; }, 500);
    }
    
    // ربط الحدث بجميع الروابط التي تحمل الكلاس .card-link-wrapper
    cardLinkWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', (e) => {
            e.preventDefault(); // منع الانتقال إلى #

            const imageUrl = wrapper.getAttribute('data-image-url');
            
            if (imageUrl) {
                fullImage.src = imageUrl;

                // إظهار الـ Modal
                modal.classList.remove('opacity-0', 'invisible');
                modal.classList.add('opacity-100', 'visible');
                
                // 🚀 منع التمرير على الجسم
                document.body.classList.add('overflow-hidden');
                
                window.scrollTo(0, 0); 
            }
        });
    });

    closeModal.addEventListener('click', hideModal);

    modal.addEventListener('click', (e) => {
        if (e.target.id === 'image-modal') { 
            hideModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && modal.classList.contains('opacity-100')) {
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
    initImageModalGallery(); 
});

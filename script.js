// script.js (وظائف عامة وتهيئة للعناصر + إضافات أنيميشن)

/* ----------------------------------------------------
   1. تهيئة الشريط الجانبي (Sidebar Toggle) 
   ---------------------------------------------------- */
function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('sidebar-toggle');
    const backdrop = document.getElementById('sidebar-backdrop');
    
    if (!sidebar || !toggleButton || !backdrop) {
        return; 
    }

    const openSidebar = () => {
        // في حالة استخدام Tailwind: إزالة -translate-x-full 
        sidebar.classList.remove('-translate-x-full'); 
        backdrop.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        // blur content: يستخدم فئة CSS filter المعرفة في style.css
        const main = document.getElementById('mainContent');
        if (main) main.classList.add('filter');
    };

    const closeSidebar = () => {
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        const main = document.getElementById('mainContent');
        if (main) main.classList.remove('filter');
    };

    toggleButton.addEventListener('click', openSidebar);
    backdrop.addEventListener('click', closeSidebar);
    sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', closeSidebar));
}

/* ----------------------------------------------------
   2. تهيئة تبديل علامات التبويب في صفحة المصادقة (Auth Tabs)
   ---------------------------------------------------- */
function initAuthTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    if (tabButtons.length === 0 || tabPanels.length === 0) {
        return; 
    }

    const switchTab = (targetId) => {
        tabButtons.forEach(btn => {
            // تحديث الفئات لـ active
            btn.classList.remove('active', 'text-primary', 'font-bold');
            btn.classList.add('text-gray-400', 'font-medium');
            if (btn.getAttribute('data-target') === targetId) {
                btn.classList.add('active', 'text-primary', 'font-bold');
                btn.classList.remove('text-gray-400', 'font-medium');
            }
        });

        tabPanels.forEach(panel => {
            // تفعيل الأنيميشن عبر class animate-slide-down
            panel.classList.add('hidden');
            panel.classList.remove('animate-slide-down');
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

    const activeTabButton = document.querySelector('.tab-button.active');
    if (activeTabButton) {
         switchTab(activeTabButton.getAttribute('data-target'));
    } else if (tabButtons.length > 0) {
        switchTab(tabButtons[0].getAttribute('data-target'));
    }
}

/* ----------------------------------------------------
   3. Dropdowns (القوائم المنسدلة)
   - تستخدم فئتي block/hidden و block/dropdown-menu المعرفتين في style.css
   ---------------------------------------------------- */
function initDropdowns() {
    const dropdownToggles = document.querySelectorAll('[data-dropdown-toggle]');

    dropdownToggles.forEach(toggle => {
        const targetId = toggle.getAttribute('data-dropdown-toggle');
        const dropdownMenu = document.getElementById(targetId);
        if (!dropdownMenu) return;

        const closeAllDropdowns = (currentMenu) => {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu !== currentMenu) {
                    menu.classList.add('hidden');
                    menu.classList.remove('block');
                }
            });
        };

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = dropdownMenu.classList.contains('hidden');
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

    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.add('hidden');
            menu.classList.remove('block');
        });
    });
}

/* ----------------------------------------------------
   4. تهيئة انيميشنات عند التمرير (IntersectionObserver)
   ---------------------------------------------------- */
function initScrollAnimations() {
    // إذا لم يدعم المتصفح الـ IntersectionObserver، نعرض العناصر مباشرة
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.animate-on-scroll, .animate-card-pop, .animate-fade-in, .stagger-container, .svg-underline').forEach(el => {
            el.classList.add('visible');
        });
        return;
    }

    // يجب إعادة تعريف الـ observer في كل مرة يتم استدعاء هذه الدالة لضمان
    // أن العناصر التي أصبحت مخفية (بسبب الفلترة) وتم إظهارها لاحقاً يتم رصدها مجدداً.
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.12
    };

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.classList.add('visible');
                
                // إذا لم تكن الخاصية data-keep=true، نوقف الرصد
                if (!el.dataset.keep || el.dataset.keep !== "true") {
                    obs.unobserve(el);
                }
            }
        });
    }, observerOptions);
    
    // إيقاف رصد جميع العناصر القديمة قبل الرصد الجديد (لمنع تكرار الرصد)
    document.querySelectorAll('.animate-on-scroll, .animate-card-pop, .animate-fade-in, .stagger-container, .svg-underline').forEach(el => {
        // نوقف رصد العناصر التي تم تفعيلها بالفعل
        if (el.classList.contains('visible') && (!el.dataset.keep || el.dataset.keep !== "true")) {
            return;
        }

        // رصد العناصر التي لم تُفعل بعد وتلك التي لم يتم رصدها بعد
        const th = parseFloat(el.dataset.threshold || '0.12');
        if (th !== observerOptions.threshold) {
            // ننشئ observer خاص لكل عنصر يختلف في threshold
            const customObs = new IntersectionObserver((entries, ob) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        if (!entry.target.dataset.keep || entry.target.dataset.keep !== "true") ob.unobserve(entry.target);
                    }
                });
            }, { root: null, rootMargin: '0px', threshold: th });
            customObs.observe(el);
        } else {
            revealObserver.observe(el);
        }
    });
}

/* ----------------------------------------------------
   5. Tilt effect for elements with .tilt (mouse move)
   ---------------------------------------------------- */
function initTiltEffect() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (isTouch) return; // نحذف التأثير للأجهزة اللمسية

    const tiltEls = document.querySelectorAll('.tilt');
    tiltEls.forEach(el => {
        // mousemove listener
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left; // الإحداثي الأفقي النسبي
            const y = e.clientY - rect.top;  // الإحداثي العمودي النسبي
            const px = (x / rect.width) - 0.5; // -0.5 .. 0.5
            const py = (y / rect.height) - 0.5;
            const rotateY = (px * 6).toFixed(2); // درجة الدوران على المحور Y
            const rotateX = (-py * 6).toFixed(2); // درجة الدوران على المحور X
            el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
        });
    });
}

/* ----------------------------------------------------
   6. تهيئة وظيفة فلترة العناصر الرسومية (Graphics Filter) 🖼️
   ---------------------------------------------------- */
function initGraphicsFilter() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    const graphicItems = document.querySelectorAll('.graphic-item-card');

    if (filterButtons.length === 0 || graphicItems.length === 0) {
        return;
    }

    const filterGraphics = (filter) => {
        graphicItems.forEach(item => {
            const categories = item.dataset.category ? item.dataset.category.split(',').map(c => c.trim()) : [];
            const shouldShow = filter === 'all' || categories.includes(filter);

            if (shouldShow) {
                // إزالة 'hidden' (في حالة استخدام Tailwind)
                item.classList.remove('hidden');
                // إعادة تشغيل الـ animation على العنصر الظاهر
                if (item.classList.contains('animate-on-scroll')) {
                    item.classList.remove('visible'); 
                }
            } else {
                item.classList.add('hidden');
                // إزالة فئة visible فوراً لضمان إمكانية إعادة تشغيل الـ animation
                item.classList.remove('visible'); 
            }
        });
        
        // إعادة تهيئة الـ IntersectionObserver لرصد العناصر الظاهرة حديثاً
        // (ننتظر قليلاً لضمان أن التغييرات في DOM قد حدثت)
        setTimeout(initScrollAnimations, 100);
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const filterValue = button.dataset.filter;
            
            // تحديث حالة الأزرار
            filterButtons.forEach(btn => btn.classList.remove('active-filter'));
            button.classList.add('active-filter');
            
            filterGraphics(filterValue);
        });
    });

    // تعيين الفلتر الافتراضي عند التحميل
    const defaultFilter = document.querySelector('[data-filter].active-filter')?.dataset.filter || 'all';
    filterGraphics(defaultFilter);
}


/* ----------------------------------------------------
   7. Accessibility: respect reduced-motion preference
   ---------------------------------------------------- */
function respectsReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ----------------------------------------------------
   8. Central init function
   ---------------------------------------------------- */
function initAllComponents() {
    initSidebarToggle();
    initAuthTabs();
    initDropdowns();
    initScrollAnimations();
    initTiltEffect();
    **initGraphicsFilter();** // تم إضافة وظيفة الفلترة هنا

    // Extra: add gentle entrance to hero CTA
    const heroCTAs = document.querySelectorAll('.shimmer');
    heroCTAs.forEach((cta, idx) => {
        // لإظهار زر CTA الرئيسي بعد فترة قصيرة
        setTimeout(() => cta.classList.add('visible'), 250 + (idx * 120));
    });
}

/* ----------------------------------------------------
   9. Run after DOMContentLoaded
   ---------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    // إذا كانت الحركة المُقللة مفضلة، نضيف فئة لمزيد من التحكم عبر CSS
    if (respectsReducedMotion()) {
        document.documentElement.classList.add('reduced-motion');
    }
    initAllComponents();
});

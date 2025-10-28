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

        sidebar.classList.remove('-translate-x-full');

        backdrop.classList.remove('hidden');

        document.body.classList.add('overflow-hidden');

        // blur content

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

            btn.classList.remove('active', 'text-primary', 'font-bold');

            btn.classList.add('text-gray-400', 'font-medium');

            if (btn.getAttribute('data-target') === targetId) {

                btn.classList.add('active', 'text-primary', 'font-bold');

                btn.classList.remove('text-gray-400', 'font-medium');

            }

        });



        tabPanels.forEach(panel => {

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

   3. Dropdowns

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

   - يفعّل .visible على العناصر التي لها:

     .animate-on-scroll, .animate-card-pop, .animate-fade-in, .stagger-container, .svg-underline

   ---------------------------------------------------- */

function initScrollAnimations() {

    // إذا لم يدعم المتصفح الـ IntersectionObserver، نعرض العناصر مباشرة

    if (!('IntersectionObserver' in window)) {

        document.querySelectorAll('.animate-on-scroll, .animate-card-pop, .animate-fade-in, .stagger-container, .svg-underline').forEach(el => {

            el.classList.add('visible');

        });

        return;

    }



    const observerOptions = {

        root: null,

        rootMargin: '0px',

        threshold: 0.12

    };



    const revealObserver = new IntersectionObserver((entries, obs) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                const el = entry.target;

                // Add visible class to trigger CSS transitions

                el.classList.add('visible');



                // Special: for stagger containers, reveal children with tiny delays handled by CSS

                if (el.classList.contains('stagger-container')) {

                    // nothing extra; CSS handles nth-child delays

                }



                // If element has data-keep attribute false, unobserve; default: unobserve to save perf

                if (!el.dataset.keep || el.dataset.keep !== "true") {

                    obs.unobserve(el);

                }

            }

        });

    }, observerOptions);



    document.querySelectorAll('.animate-on-scroll, .animate-card-pop, .animate-fade-in, .stagger-container, .svg-underline').forEach(el => {

        // allow optional custom threshold via data-threshold

        const th = parseFloat(el.dataset.threshold || '0.12');

        if (th !== observerOptions.threshold) {

            // create a per-element observer if threshold differs

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

   - خفيف ومناسب للبطاقات. يعمل فقط على الشاشات الكبيرة.

   ---------------------------------------------------- */

function initTiltEffect() {

    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

    if (isTouch) return; // نحذف التأثير للأجهزة اللمسية



    const tiltEls = document.querySelectorAll('.tilt');

    tiltEls.forEach(el => {

        const bounds = el.getBoundingClientRect();

        // mousemove listener

        el.addEventListener('mousemove', (e) => {

            const rect = el.getBoundingClientRect();

            const x = e.clientX - rect.left; // relative X

            const y = e.clientY - rect.top;  // relative Y

            const px = (x / rect.width) - 0.5; // -0.5 .. 0.5

            const py = (y / rect.height) - 0.5;

            const rotateY = (px * 6).toFixed(2); // degrees

            const rotateX = (-py * 6).toFixed(2);

            el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;

        });

        el.addEventListener('mouseleave', () => {

            el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';

        });

    });

}



/* ----------------------------------------------------

   6. Small helpers: init image glows (class based)

   ---------------------------------------------------- */

function initImageGlows() {

    // No JS required; kept for future extension

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

    initImageGlows();



    // Extra: add gentle entrance to hero CTA

    const heroCTAs = document.querySelectorAll('.shimmer');

    heroCTAs.forEach((cta, idx) => {

        setTimeout(() => cta.classList.add('visible'), 250 + (idx * 120));

    });

}



/* ----------------------------------------------------

   9. Run after DOMContentLoaded

   ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

    // If reduced motion, skip JS heavy transforms (CSS handles fallback)

    if (respectsReducedMotion()) {

        document.documentElement.classList.add('reduced-motion');

    }

    initAllComponents();

});

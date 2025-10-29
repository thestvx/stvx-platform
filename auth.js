// auth.js - النسخة النهائية التي تعتمد على Vanilla JS وتناسب الهيكل المعدل

document.addEventListener('DOMContentLoaded', () => {
    // جلب العناصر الأساسية
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabIndicator = document.getElementById('tab-indicator');
    const formWrapper = document.getElementById('form-wrapper');

    /**
     * @function updateTabIndicator
     * تحديث شريط التحديد المتحرك (Indicator) ليطابق التبويب النشط.
     * @param {HTMLElement} activeTab - التبويب النشط حاليًا (loginTab أو registerTab).
     */
    function updateTabIndicator(activeTab) {
        const tabRect = activeTab.getBoundingClientRect();
        const parentRect = activeTab.parentElement.getBoundingClientRect();

        // تعيين العرض
        tabIndicator.style.width = `${tabRect.width}px`;
        // الحساب في وضع RTL: يمين الحاوية - يمين التبويب = المسافة من اليمين
        tabIndicator.style.right = `${parentRect.right - tabRect.right}px`;
    }

    /**
     * @function updateFormWrapperHeight
     * تحديث ارتفاع حاوية النماذج (form-wrapper) لمنع القفز عند التبديل.
     * @param {HTMLElement} activeForm - النموذج الذي سيصبح نشطًا.
     */
    function updateFormWrapperHeight(activeForm) {
        // نضبط الارتفاع على ارتفاع النموذج النشط مع تأخير بسيط لضمان حساب ارتفاعه
        setTimeout(() => {
             formWrapper.style.height = `${activeForm.offsetHeight}px`;
        }, 50); 
    }

    /**
     * @function switchForms
     * التبديل بين النماذج بحركة انزلاق سلسة.
     * @param {HTMLElement} incomingForm - النموذج الذي سيدخل.
     * @param {HTMLElement} outgoingForm - النموذج الذي سيخرج.
     * @param {string} direction - اتجاه الحركة ('to-login' أو 'to-register').
     */
    function switchForms(incomingForm, outgoingForm, direction) {
        // إذا كان النموذج الداخل هو نفسه النموذج النشط، نتجاهل الحركة
        if (incomingForm.classList.contains('active-form')) return;

        // 1. إعداد النموذج الخارج للحركة (يزال منه الـ active)
        outgoingForm.classList.remove('active-form');
        // نضيف فئة الحركة للخروج (بناءً على الاتجاه)
        outgoingForm.classList.add(direction === 'to-register' ? 'animate-out-left' : 'animate-out-right');

        // 2. إعداد النموذج الداخل للحركة (للدخول من الجهة المعاكسة)
        incomingForm.classList.remove('animate-out-left', 'animate-out-right');
        incomingForm.classList.add(direction === 'to-register' ? 'animate-in-left' : 'animate-in-right');

        // نستخدم setTimeout لتطبيق فئة الخروج أولاً، ثم تفعيل الدخول
        setTimeout(() => {
            // 3. تفعيل النموذج الداخل ليأتي إلى المنتصف
            incomingForm.classList.add('active-form');

            // 4. تحديث ارتفاع الحاوية
            updateFormWrapperHeight(incomingForm);

            // 5. إزالة فئات الحركة من النموذج الخارج بعد انتهاء الحركة
            outgoingForm.addEventListener('transitionend', function handler() {
                // نضمن إزالة فئات الحركة بعد اكتمالها
                outgoingForm.classList.remove('animate-out-left', 'animate-out-right');
                outgoingForm.classList.remove('animate-in-left', 'animate-in-right');
                outgoingForm.removeEventListener('transitionend', handler);
            }, {once: true}); // يتم تشغيل المستمع مرة واحدة فقط
            
        }, 50);
    }


    // --- معالجات الأحداث للتبويبات ---

    loginTab.addEventListener('click', () => {
        if (!loginTab.classList.contains('active')) {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            updateTabIndicator(loginTab);
            switchForms(loginForm, registerForm, 'to-login');
        }
    });

    registerTab.addEventListener('click', () => {
        if (!registerTab.classList.contains('active')) {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            updateTabIndicator(registerTab);
            switchForms(registerForm, loginForm, 'to-register');
        }
    });

    // --- معالجات الأحداث لمنع الإرسال والانتقال إلى الصفحة الرئيسية ---

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // هنا يمكنك إضافة منطق التحقق من صحة البيانات قبل الانتقال
        window.location.href = 'index.html'; 
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // هنا يمكنك إضافة منطق التحقق من صحة البيانات قبل الانتقال
        window.location.href = 'index.html';
    });

    // --- التهيئة الأولية عند تحميل الصفحة ---

    // نحسب الارتفاع الأولي لحاوية النماذج (نموذج الدخول هو الافتراضي)
    updateFormWrapperHeight(loginForm);
    // نضع شريط التحديد في مكانه الصحيح
    updateTabIndicator(loginTab);

    // للتأكد من حساب الارتفاع والمؤشر بشكل صحيح عند تغيير حجم النافذة
    window.addEventListener('resize', () => {
        // نتحقق من النموذج النشط لحساب ارتفاع الحاوية
        const activeForm = loginForm.classList.contains('active-form') ? loginForm : registerForm;
        const activeTab = loginTab.classList.contains('active') ? loginTab : registerTab;
        
        updateFormWrapperHeight(activeForm);
        updateTabIndicator(activeTab);
    });
});

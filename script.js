// script.js

/**
 * وظيفة لإظهار الـ Loader.
 * (تضيف class 'active' لتشغيل الانتقال عبر CSS)
 */
function showLoader() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        // نستخدم active لتشغيل الانتقال
        loadingOverlay.classList.add('active');
        // نضمن إزالة hidden إذا كانت موجودة
        loadingOverlay.classList.remove('hidden');
    }
}

/**
 * وظيفة لإخفاء الـ Loader.
 */
function hideLoader() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        // نبدأ إزالة الشفافية أولاً
        loadingOverlay.classList.remove('active');
        
        // بعد انتهاء مدة الانتقال (0.5s)، نضيف hidden لإزالة العنصر تماماً من الـ Layout
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
        }, 500); 
    }
}

// ----------------------------------------------------
// 💡 يمكن إضافة أي منطق JavaScript إضافي هنا في المستقبل
// ----------------------------------------------------

// لا حاجة لـ window.onload هنا لأننا أضفنا الكود في <script> داخل auth.html للتحكم في الإخفاء الأولي.

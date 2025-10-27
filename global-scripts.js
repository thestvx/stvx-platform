// global-scripts.js

/**
 * وظيفة لإظهار الـ Loader.
 */
function showLoader() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        // نستخدم Tailwind class 'hidden' للتحكم في الإظهار والإخفاء
        loadingOverlay.classList.remove('hidden');
    }
}

/**
 * وظيفة لإخفاء الـ Loader.
 */
function hideLoader() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        // نستخدم تأخيراً صغيراً لجعل الإخفاء يبدو أكثر سلاسة
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
        }, 300); 
    }
}

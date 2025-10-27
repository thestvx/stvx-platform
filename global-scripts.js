// global-scripts.js

/**
 * وظيفة لإظهار الـ Loader.
 * يجب أن تكون طبقة الـ Loader (loader.html) مضافة إلى الصفحة بالفعل.
 */
function showLoader() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

/**
 * وظيفة لإخفاء الـ Loader.
 */
function hideLoader() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        // يمكنك إضافة تأخير لإعطاء انطباع بالتحميل المكتمل
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
        }, 300); // 300 مللي ثانية للتأكد من سلاسة الإخفاء
    }
}

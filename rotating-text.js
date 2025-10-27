// ملف: rotating-text.js

const texts = [
    "الابتكار", 
    "التصميم",
    "البرمجة",
    "الإبداع",
    "المحتوى"
];

const rotationInterval = 2000; // 2 ثانية بين كل كلمة

let currentTextIndex = 0;
let intervalId;

/**
 * وظيفة تبديل الكلمة الدوارة.
 */
function rotateText() {
    const rotatingElement = document.getElementById('rotatingTextDisplay');
    if (!rotatingElement) return;

    // 1. إنشاء العنصر الجديد (الكلمة التالية)
    const newTextElement = document.createElement('span');
    newTextElement.textContent = texts[currentTextIndex];
    newTextElement.className = 'rotating-text-element';

    // 2. تحديد العنصر القديم
    const oldTextElement = rotatingElement.querySelector('.rotating-text-element');

    // 3. تطبيق حركة الخروج على الكلمة القديمة
    if (oldTextElement) {
        oldTextElement.classList.remove('animate-in');
        oldTextElement.classList.add('animate-out');

        // إزالة العنصر القديم بعد انتهاء الحركة
        setTimeout(() => {
            oldTextElement.remove();
        }, 500);
    }

    // 4. تطبيق حركة الدخول على الكلمة الجديدة وإضافتها
    newTextElement.classList.add('animate-in');
    rotatingElement.appendChild(newTextElement);

    // 5. تحديث الفهرس للدورة التالية
    currentTextIndex = (currentTextIndex + 1) % texts.length;
}

/**
 * وظيفة بدء الدوران التلقائي.
 */
function startRotation() {
    // تشغيل أول كلمة فوراً
    rotateText(); 
    
    // ضبط المؤقت للدورات اللاحقة
    intervalId = setInterval(rotateText, rotationInterval);
}

// البدء عند تحميل محتوى الصفحة بالكامل
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('rotatingTextDisplay')) {
        startRotation();
    }
});

/*
    ملف auth.js (مُعدَّل لدعم الاتجاه من اليمين لليسار RTL)
    يعتمد على jQuery و jQuery Easing
*/

// ******************************************************
// 1. منطق التبديل بين نموذج تسجيل الدخول وإنشاء الحساب
// ******************************************************
const container = document.getElementById('container');
const registerBtn = document.getElementById('register'); // زر "إنشاء حساب" في لوحة التبديل
const loginBtn = document.getElementById('login');     // زر "تسجيل الدخول" في لوحة التبديل

// عند الضغط على زر "إنشاء حساب"، أضف فئة "active" (لعرض نموذج إنشاء الحساب)
registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

// عند الضغط على زر "تسجيل الدخول"، أزل فئة "active" (لعرض نموذج تسجيل الدخول)
loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// ******************************************************
// 2. منطق النموذج متعدد الخطوات (Multi-step form)
// ******************************************************
var current_fs, next_fs, previous_fs;
var left, opacity, scale;
var animating;

// عند الضغط على زر 'التالي'
$(".next").click(function(){
    if(animating) return false;
    animating = true;
    
    current_fs = $(this).parent();
    next_fs = $(this).parent().next();
    
    // تفعيل الخطوة التالية في شريط التقدم
    $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
    
    // إظهار الخطوة التالية
    next_fs.show(); 
    
    // إخفاء الخطوة الحالية عبر الحركة (تم تعديل حركة RTL هنا)
    current_fs.animate({opacity: 0}, {
        step: function(now, mx) {
            // تصغير النموذج الحالي
            scale = 1 - (1 - now) * 0.2;
            // يتم عكس حركة الانزلاق لـ RTL: تبدأ من 0 وتنتهي عند -50% (خارج الشاشة لليسار)
            left = -(now * 50)+"%";
            opacity = 1 - now;
            current_fs.css({
                'transform': 'scale('+scale+')',
                'position': 'absolute',
                'top': 0, 
                'width': '100%' 
            });
            // يتم عكس حركة دخول النموذج التالي: يبدأ من 50% (خارج الشاشة لليمين) وينتهي عند 0
            next_fs.css({'left': left, 'opacity': opacity, 'position': 'relative'});
        }, 
        duration: 800, 
        complete: function(){
            current_fs.hide();
            animating = false;
        }, 
        easing: 'easeInOutBack'
    });
});

// عند الضغط على زر 'رجوع'
$(".previous").click(function(){
    if(animating) return false;
    animating = true;
    
    current_fs = $(this).parent();
    previous_fs = $(this).parent().prev();
    
    // إلغاء تفعيل الخطوة الحالية في شريط التقدم
    $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
    
    // إظهار الخطوة السابقة
    previous_fs.show(); 
    
    // إخفاء الخطوة الحالية عبر الحركة (تم تعديل حركة RTL هنا)
    current_fs.animate({opacity: 0}, {
        step: function(now, mx) {
            // تكبير النموذج السابق
            scale = 0.8 + (1 - now) * 0.2;
            // يتم عكس حركة الانزلاق لـ RTL: تبدأ من -50% وتنتهي عند 0
            left = ((1-now) * 50)+"%"; 
            opacity = 1 - now;
            current_fs.css({'left': left, 'position': 'absolute', 'top': 0, 'width': '100%'});
            previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity, 'position': 'relative'});
        }, 
        duration: 800, 
        complete: function(){
            current_fs.hide();
            animating = false;
        }, 
        easing: 'easeInOutBack'
    });
});

// منع الإرسال الافتراضي للنموذج الأخير
$(".submit").click(function(){
    return false;
})

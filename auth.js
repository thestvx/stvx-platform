document.addEventListener('DOMContentLoaded', () => {
    const loginToggle = document.getElementById('loginToggle');
    const registerToggle = document.getElementById('registerToggle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const successMessage = document.getElementById('successMessage');
    const successText = document.getElementById('successText');

    // وظيفة التبديل بين النماذج
    function switchForm(activeForm, inactiveForm, activeToggle, inactiveToggle) {
        inactiveForm.classList.remove('active');
        activeForm.classList.add('active');
        inactiveToggle.classList.remove('active');
        activeToggle.classList.add('active');
    }

    // ربط أزرار التبديل
    loginToggle.addEventListener('click', () => {
        switchForm(loginForm, registerForm, loginToggle, registerToggle);
    });

    registerToggle.addEventListener('click', () => {
        switchForm(registerForm, loginForm, registerToggle, loginToggle);
    });
    
    // إظهار وإخفاء كلمة المرور
    document.querySelectorAll('.password-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const icon = button.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // معالجة إرسال النماذج (للعرض فقط)
    document.getElementById('loginFormElement').addEventListener('submit', (e) => {
        e.preventDefault();
        successText.textContent = 'تم تسجيل دخولك بنجاح!';
        successMessage.style.opacity = '1';
        successMessage.style.visibility = 'visible';
        setTimeout(() => {
            successMessage.style.opacity = '0';
            successMessage.style.visibility = 'hidden';
        }, 3000);
    });

    document.getElementById('registerFormElement').addEventListener('submit', (e) => {
        e.preventDefault();
        successText.textContent = 'تم إنشاء حسابك بنجاح!';
        successMessage.style.opacity = '1';
        successMessage.style.visibility = 'visible';
        setTimeout(() => {
            successMessage.style.opacity = '0';
            successMessage.style.visibility = 'hidden';
            // يمكن هنا إضافة كود لإعادة توجيه المستخدم أو تبديل النموذج إلى تسجيل الدخول
            switchForm(loginForm, registerForm, loginToggle, registerToggle);
        }, 3000);
    });
});

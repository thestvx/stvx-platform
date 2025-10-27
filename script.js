document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------
    // I. وظيفة تفاعل الشريط الجانبي (تحديد العنصر النشط)
    // ----------------------------------------------------
    // ملاحظة: بما أننا لم نستخدم كلاس .menu و <li> في الشريط الجانبي،
    // فالكود أدناه قد لا يعمل، ولكن سنبقيه في حال تم تطبيقه مستقبلاً.
    const menuItems = document.querySelectorAll('.sidebar-list .menu-item'); // افتراض كلاسات جديدة
    const currentPath = window.location.pathname.split('/').pop() || 'index.html'; 

    menuItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            const linkPath = link.getAttribute('href').split('/').pop(); 
            if (linkPath === currentPath) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    });

    // ----------------------------------------------------
    // II. وظيفة تأثير بطاقات المشاريع ثلاثية الأبعاد (3D Tilt) 
    // ----------------------------------------------------
    // التعديل: استهداف كلاس .glass-card المستخدم في HTML.
    const cards = document.querySelectorAll('.glass-card'); 
    
    cards.forEach(card => {
        
        // منع تطبيق التأثير على الشريط العلوي والسفلي لتجنب المشاكل
        if (card.closest('nav') || card.closest('footer') || card.closest('aside')) {
            return; // تجاوز عناصر التنقل
        }
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // قيم الدوران
            const rotateY = (x / rect.width - 0.5) * -8; // تم تخفيف القيمة من 10 إلى 8
            const rotateX = (y / rect.height - 0.5) * 8; // تم تخفيف القيمة من 10 إلى 8
            
            // تطبيق التحول
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`; // تم تخفيف قيمة الـ scale
            card.style.transition = 'none'; // تعطيل الترانزيشن أثناء الحركة
        });
        
        card.addEventListener('mouseleave', () => {
            // إعادة التعيين مع إضافة ترانزيشن سلس
            card.style.transform = 'translateY(0) scale(1)';
            card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'; // استخدام Cubic-Bezier لمرونة أفضل
        });
    });
    
    // ----------------------------------------------------
    // III. وظيفة معالجة نموذج طلب المشروع (Form Submission) 
    // ----------------------------------------------------
    const requestForm = document.querySelector('.request-form'); 
    
    if (requestForm) {
        requestForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            // ... (منطق إرسال النموذج هنا)
            alert('✅ تم استلام طلبك بنجاح! سيتم التواصل معك قريباً عبر البريد الإلكتروني.');
            requestForm.reset();
        });
    }

    // ----------------------------------------------------
    // IV. وظيفة مؤثر ظهور العناصر أثناء التمرير (Reveal on Scroll)
    // ----------------------------------------------------
    const sections = document.querySelectorAll('section'); // استهداف الأقسام فقط

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // استخدام كلاسات الأنيميشن المحددة في Tailwind CSS
                entry.target.classList.add('animate-slide-up');
                
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1 }); 

    sections.forEach(section => {
        // لا نحتاج لإضافة كلاس 'hidden-section' إذا كنا نعتمد على أنيميشن Tailwind
        observer.observe(section);
    });
});

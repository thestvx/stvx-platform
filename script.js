document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------
    // I. وظيفة تفاعل الشريط الجانبي (تحديد العنصر النشط) - غير مستخدمة حاليًا
    // ----------------------------------------------------
    // تم حذف الكود الخاص بها لعدم وجود كلاسات .menu حاليًا، ويمكن إضافته لاحقاً.
    
    // ----------------------------------------------------
    // II. وظيفة تأثير بطاقات المشاريع ثلاثية الأبعاد (3D Tilt) 
    // ----------------------------------------------------
    // التعديل: استهداف كلاس .glass-card المستخدم في HTML.
    const cards = document.querySelectorAll('.glass-card'); 
    
    cards.forEach(card => {
        
        // منع تطبيق التأثير على الشريط العلوي والسفلي والشريط الجانبي لتجنب المشاكل
        if (card.closest('nav') || card.closest('footer') || card.closest('aside')) {
            return; 
        }
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // قيم الدوران
            const rotateY = (x / rect.width - 0.5) * -8; 
            const rotateX = (y / rect.height - 0.5) * 8; 
            
            // تطبيق التحول
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`; 
            card.style.transition = 'none'; 
        });
        
        card.addEventListener('mouseleave', () => {
            // إعادة التعيين مع إضافة ترانزيشن سلس
            card.style.transform = 'translateY(0) scale(1)';
            card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'; 
        });
    });
    
    // ----------------------------------------------------
    // III. وظيفة معالجة نموذج طلب المشروع (Form Submission) - تم الحذف لعدم وجود النموذج في index.html حاليًا
    // ----------------------------------------------------

    // ----------------------------------------------------
    // IV. وظيفة مؤثر ظهور العناصر أثناء التمرير (Reveal on Scroll)
    // ----------------------------------------------------
    // تم التعديل للاعتماد على كلاسات الأنيميشن في Tailwind (animate-fade-in/animate-slide-up)
    const sections = document.querySelectorAll('section'); 

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // الكلاسات موجودة في الـ HTML ومُطبقة بالـ style="animation: ..." 
                // لذلك، يمكننا حذف هذا الكود أو إبقائه إذا كنت تفضل استخدامه مستقبلاً.
                // حالياً، سنبقي على الـ HTML animations.
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1 }); 

    sections.forEach(section => {
        observer.observe(section);
    });
});

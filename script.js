document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // I. وظيفة تفاعل الشريط الجانبي (Liquid Highlight)
    // ----------------------------------------------------
    const menuItems = document.querySelectorAll('.menu li');
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

    // ... (تفاعلات Liquid Highlight و Nudge Effect) ...

    // ----------------------------------------------------
    // II. وظيفة تأثير بطاقات المشاريع ثلاثية الأبعاد (3D Tilt) 
    // ----------------------------------------------------
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const rotateY = (x / rect.width - 0.5) * -10; 
            const rotateX = (y / rect.height - 0.5) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.transition = 'transform 0.5s ease';
        });
    });
    
    // ----------------------------------------------------
    // III. وظيفة معالجة نموذج طلب المشروع (Form Submission) 
    // ----------------------------------------------------
    const requestForm = document.querySelector('.request-form');
    
    if (requestForm) {
        requestForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            // ... (منطق إرسال النموذج)
            alert('✅ تم استلام طلبك بنجاح! سيتم التواصل معك قريباً عبر البريد الإلكتروني.');
            requestForm.reset();
        });
    }

    // ----------------------------------------------------
    // IV. وظيفة مؤثر ظهور العناصر أثناء التمرير (Reveal on Scroll)
    // ----------------------------------------------------
    const sections = document.querySelectorAll('section, header');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.index * 100;
                setTimeout(() => {
                    entry.target.classList.add('fade-in');
                }, delay);
                
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1 }); 

    let index = 0;
    sections.forEach(section => {
        section.classList.add('hidden-section'); 
        section.dataset.index = index++; 
        observer.observe(section);
    });
});

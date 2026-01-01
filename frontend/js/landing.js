// Landing Page Interactions

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Demo video placeholder interaction
    const videoPlaceholder = document.querySelector('.video-placeholder');
    if (videoPlaceholder) {
        videoPlaceholder.addEventListener('click', () => {
            alert('Demo video would play here. For now, please explore the app by clicking "Launch App"!');
        });
    }

    // Hamburger Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');

    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('#nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('is-active');
                navMenu.classList.remove('active');
            });
        });
    }
});

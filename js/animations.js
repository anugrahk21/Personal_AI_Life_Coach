// Professional animations for AI Life Coach website
document.addEventListener('DOMContentLoaded', () => {
    // Utility function for smooth animations
    const animate = (element, properties, duration = 1000, delay = 0, easing = 'cubic-bezier(0.4, 0, 0.2, 1)') => {
        element.style.transitionProperty = Object.keys(properties).join(', ');
        element.style.transitionDuration = `${duration}ms`;
        element.style.transitionTimingFunction = easing;
        element.style.transitionDelay = `${delay}ms`;
        
        // Apply the animations
        Object.keys(properties).forEach(key => {
            element.style[key] = properties[key];
        });
    };

    // Hero section animation
    const heroSection = document.querySelector('#scrollspyHero');
    if (heroSection) {
        // Set initial state
        heroSection.style.opacity = '0';
        heroSection.style.transform = 'scale(0.98)';
        
        // Add animation class for consistent styling
        heroSection.classList.add('animated-section');
        
        // Animate hero section
        setTimeout(() => {
            animate(heroSection, {
                opacity: '1',
                transform: 'scale(1)'
            }, 1200, 100);
            
            // Animate hero content with stagger
            const heroContent = heroSection.querySelectorAll('.col-lg-6');
            heroContent.forEach((content, index) => {
                content.style.opacity = '0';
                content.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    animate(content, {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }, 800, 300 * (index + 1));
                }, 200);
            });
        }, 100);
    }

    // Section arrival animations
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                
                // Don't re-animate hero section
                if (section.id === 'scrollspyHero') return;
                
                // Animate section
                animate(section, {
                    opacity: '1',
                    transform: 'translateY(0)'
                }, 800);

                // Staggered animation for section content
                const animateContent = () => {
                    const elements = section.querySelectorAll('.card, .col-lg-4, .col-lg-6, h2, .lead');
                    elements.forEach((element, index) => {
                        element.style.opacity = '0';
                        element.style.transform = 'translateY(15px)';
                        
                        setTimeout(() => {
                            animate(element, {
                                opacity: '1',
                                transform: 'translateY(0)'
                            }, 600, 100 * index);
                        }, 150);
                    });
                };

                animateContent();
                sectionObserver.unobserve(section);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '-50px'
    });

    // Apply initial styles and observe all sections
    document.querySelectorAll('section:not(#scrollspyHero)').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.classList.add('animated-section');
        sectionObserver.observe(section);
    });

    // Smooth reveal for images
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                animate(img, {
                    opacity: '1',
                    transform: 'scale(1)'
                }, 800);
                imageObserver.unobserve(img);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '20px'
    });

    // Apply initial styles and observe all images in sections
    document.querySelectorAll('section img').forEach(img => {
        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        img.style.willChange = 'transform, opacity';
        imageObserver.observe(img);
    });

    // Add base styles to document
    const style = document.createElement('style');
    style.textContent = `
        .animated-section {
            will-change: transform, opacity;
        }
        
        section {
            backface-visibility: hidden;
        }
        
        img {
            backface-visibility: hidden;
        }
    `;
    document.head.appendChild(style);
});
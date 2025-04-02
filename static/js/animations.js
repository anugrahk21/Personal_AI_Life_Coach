// Professional animations for AI Life Coach
document.addEventListener('DOMContentLoaded', () => {
    // Performance optimization - throttle scroll events
    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // Utility function for smooth animations
    const smoothTransition = (element, properties, duration = 800, delay = 0, easing = 'cubic-bezier(0.5, 0, 0, 1)') => {
        element.style.transitionProperty = Object.keys(properties).join(', ');
        element.style.transitionDuration = `${duration}ms`;
        element.style.transitionTimingFunction = easing;
        element.style.transitionDelay = `${delay}ms`;
        requestAnimationFrame(() => {
            Object.entries(properties).forEach(([key, value]) => {
                element.style[key] = value;
            });
        });
    };

    // Hero section animation on load
    const initHeroAnimation = () => {
        const hero = document.querySelector('#scrollspyHero');
        if (!hero) return;

        // Set initial states
        hero.style.opacity = '0';
        hero.style.transform = 'translateY(10px)';
        
        // Animate hero container
        setTimeout(() => {
            smoothTransition(hero, {
                opacity: '1',
                transform: 'translateY(0)'
            }, 1000, 100);

            // Staggered animation for hero content
            const heroElements = hero.querySelectorAll('.col-lg-6, h1, .btn');
            heroElements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                
                smoothTransition(el, {
                    opacity: '1',
                    transform: 'translateY(0)'
                }, 800, 200 + (index * 150));
            });
        }, 150);
    };

    // Section reveal animations
    const initSectionAnimations = () => {
        const sections = document.querySelectorAll('section:not(#scrollspyHero)');
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                
                const section = entry.target;
                smoothTransition(section, {
                    opacity: '1',
                    transform: 'translateY(0)'
                }, 800);

                // Animate section contents with stagger
                const elements = section.querySelectorAll('.card, .col-lg-4, .col-lg-6, h2, .lead, .btn, img');
                elements.forEach((el, index) => {
                    smoothTransition(el, {
                        opacity: '1',
                        transform: 'translateY(0) scale(1)'
                    }, 600, 100 + (index * 100));
                });

                sectionObserver.unobserve(section);
            });
        }, {
            threshold: 0.15,
            rootMargin: '-50px'
        });

        // Set initial states and observe sections
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            
            // Set initial states for section contents
            section.querySelectorAll('.card, .col-lg-4, .col-lg-6, h2, .lead, .btn, img').forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px) scale(0.98)';
            });

            sectionObserver.observe(section);
        });
    };

    // Special animations for testimonials
    const initTestimonialAnimations = () => {
        const testimonials = document.querySelectorAll('#scrollspyTestimonials .card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                
                testimonials.forEach((card, index) => {
                    smoothTransition(card, {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }, 800, index * 200);
                });
                
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.2 });

        testimonials.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px)';
        });

        if (testimonials.length) {
            observer.observe(testimonials[0].parentElement);
        }
    };

    // Special animations for pricing cards
    const initPricingAnimations = () => {
        const pricingCards = document.querySelectorAll('#scrollspyPricing .card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                
                pricingCards.forEach((card, index) => {
                    smoothTransition(card, {
                        opacity: '1',
                        transform: 'translateY(0)',
                    }, 800, index * 150);
                });
                
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.2 });

        pricingCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
        });

        if (pricingCards.length) {
            observer.observe(pricingCards[0].parentElement);
        }
    };

    // Initialize all animations
    initHeroAnimation();
    initSectionAnimations();
    initTestimonialAnimations();
    initPricingAnimations();

    // Add necessary styles
    const style = document.createElement('style');
    style.textContent = `
        section {
            will-change: transform, opacity;
            backface-visibility: hidden;
        }
        
        .card {
            will-change: transform;
            backface-visibility: hidden;
        }
        
        img {
            will-change: transform, opacity;
            backface-visibility: hidden;
        }
        
        @media (prefers-reduced-motion: reduce) {
            * {
                transition-duration: 0.01ms !important;
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                scroll-behavior: auto !important;
            }
        }
    `;
    document.head.appendChild(style);
});
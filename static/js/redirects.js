document.addEventListener('DOMContentLoaded', () => {
    // Find all links pointing to "/coachai"
    const coachLinks = document.querySelectorAll('a[href="/coachai"]');
    
    // Change their behavior to redirect to the coachai route
    coachLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/coachai';
        });
    });
});

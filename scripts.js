// OIAFS 2026 - Main JavaScript
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollAnimations();
    initStatsCounter();
    initModal();
    initDropdown();
    initForms();
    initSmoothScroll();
});

function initNavigation() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    }, { passive: true });
}

function initScrollAnimations() {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    document.querySelectorAll('.fade-in, .fade-in-up').forEach(el => observer.observe(el));
}

function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    const observerOptions = { threshold: 0.3 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const count = parseInt(target.dataset.count);
                const suffix = target.dataset.suffix || '+';
                animateCounter(target, count, suffix);
                observer.unobserve(target);
            }
        });
    }, observerOptions);
    stats.forEach(stat => observer.observe(stat));
}

function animateCounter(element, target, suffix) {
    const duration = 1500;
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeProgress * target);
        element.textContent = current.toLocaleString() + suffix;
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString() + suffix;
        }
    }
    requestAnimationFrame(update);
}

function initModal() {
    const modal = document.getElementById('inquiryModal');
    if (!modal) return;
    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = modal.querySelector('.modal-close');
    document.querySelectorAll('[data-category]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const category = trigger.dataset.category;
            openModal(category);
        });
    });
    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    function openModal(category) {
        const categorySelect = document.getElementById('inquiryCategory');
        if (categorySelect && category) {
            categorySelect.value = category;
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            document.getElementById('inquiryFirstName')?.focus();
        }, 300);
    }
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            const form = document.getElementById('inquiryForm');
            if (form) form.reset();
        }, 300);
    }
}

function initDropdown() {
    const dropdownBtn = document.getElementById('participateDropdownBtn');
    const dropdown = document.getElementById('participateDropdown');
    const dropdownContainer = document.querySelector('.dropdown-container');
    if (!dropdownBtn || !dropdown || !dropdownContainer) return;
    dropdownBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isActive = dropdownContainer.classList.toggle('active');
        dropdownBtn.setAttribute('aria-expanded', isActive);
    });
    document.addEventListener('click', (e) => {
        if (!dropdownContainer.contains(e.target)) {
            dropdownContainer.classList.remove('active');
            dropdownBtn.setAttribute('aria-expanded', 'false');
        }
    });
    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const category = item.dataset.category;
            dropdownContainer.classList.remove('active');
            dropdownBtn.setAttribute('aria-expanded', 'false');
        });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdownContainer.classList.contains('active')) {
            dropdownContainer.classList.remove('active');
            dropdownBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

function initForms() {
    const inquiryForm = document.getElementById('inquiryForm');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', handleInquirySubmit);
    }
    document.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            const group = field.closest('.form-group');
            if (group?.classList.contains('error')) {
                validateField(field);
            }
        });
    });
}

function validateField(field) {
    const group = field.closest('.form-group');
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'This field is required';
    }
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        }
    }
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\(\)\+\.]{10,}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            isValid = false;
            message = 'Please enter a valid phone number';
        }
    }
    const errorEl = group?.querySelector('.error-message');
    if (group) {
        group.classList.toggle('error', !isValid);
        if (errorEl) errorEl.textContent = message;
    }
    return isValid;
}

async function handleInquirySubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    let isValid = true;
    form.querySelectorAll('input, select').forEach(field => {
        if (!validateField(field)) isValid = false;
    });
    if (!isValid) return;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Processing...</span>';
    const formData = {
        firstName: form.firstName.value.trim(),
        email: form.email.value.trim().toLowerCase(),
        phone: form.phone.value.trim(),
        category: form.category.value,
        source: 'website',
        submittedAt: new Date().toISOString()
    };
    try {
        const params = new URLSearchParams({
            lead: 'temp-lead-id',
            category: formData.category,
            email: formData.email
        });
        window.location.href = `/register.html?${params.toString()}`;
    } catch (error) {
        console.error('Form submission error:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        alert('Something went wrong. Please try again.');
    }
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') {
                e.preventDefault();
                return;
            }
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                e.stopPropagation();
                const navHeight = document.getElementById('navbar')?.offsetHeight || 70;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
}

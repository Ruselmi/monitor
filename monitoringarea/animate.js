/* ================================================
   TANIKU MONITOR - ANIMATION ENGINE
   JavaScript Animation Utilities
   ================================================ */

const AnimationEngine = {
    // ========== SCROLL REVEAL ==========
    revealElements: [],

    initScrollReveal() {
        this.revealElements = document.querySelectorAll('.reveal');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            this.revealElements.forEach(el => observer.observe(el));
        } else {
            // Fallback for older browsers
            this.revealElements.forEach(el => el.classList.add('revealed'));
        }
    },

    // ========== STAGGER ANIMATION ==========
    staggerAnimate(elements, animationClass, delayMs = 50) {
        elements.forEach((el, index) => {
            el.style.animationDelay = `${index * delayMs}ms`;
            el.classList.add('animate', animationClass);
        });
    },

    // ========== NUMBER COUNTER ==========
    animateCounter(element, targetValue, duration = 1000, prefix = '', suffix = '') {
        const startValue = 0;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out-cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);

            element.textContent = prefix + currentValue.toLocaleString('id-ID') + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        requestAnimationFrame(updateCounter);
    },

    // ========== RIPPLE EFFECT ==========
    createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();

        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;

        ripple.style.width = ripple.style.height = `${diameter}px`;
        ripple.style.left = `${event.clientX - rect.left - radius}px`;
        ripple.style.top = `${event.clientY - rect.top - radius}px`;
        ripple.classList.add('ripple-effect');

        // Add ripple styles
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';

        // Ensure parent has proper positioning
        button.style.position = 'relative';
        button.style.overflow = 'hidden';

        button.appendChild(ripple);

        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    },

    // ========== TOAST NOTIFICATIONS ==========
    showToast(message, type = 'success', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type} toast-enter`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('toast-enter');
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    getToastIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '📢';
        }
    },

    // ========== LOADING STATES ==========
    showLoading(text = 'Memuat...') {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            const textEl = overlay.querySelector('.loading-text');
            if (textEl) textEl.textContent = text;
            overlay.classList.remove('hidden');
        }
    },

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    },

    // ========== SKELETON LOADING ==========
    createSkeletonCards(container, count = 6) {
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'item-card skeleton-card';
            skeleton.innerHTML = `
                <div class="skeleton skeleton-circle" style="width: 50px; height: 50px; margin-bottom: 12px;"></div>
                <div class="skeleton skeleton-text" style="width: 80%;"></div>
                <div class="skeleton skeleton-text" style="width: 60%;"></div>
            `;
            container.appendChild(skeleton);
        }
    },

    // ========== PRICE FLASH ANIMATION ==========
    flashPrice(element, isUp = true) {
        element.classList.add(isUp ? 'price-flash-up' : 'price-flash-down');
        setTimeout(() => {
            element.classList.remove('price-flash-up', 'price-flash-down');
        }, 500);
    },

    // ========== SMOOTH SCROLL ==========
    smoothScrollTo(elementOrY, options = {}) {
        const defaultOptions = {
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        };

        if (typeof elementOrY === 'number') {
            window.scrollTo({
                top: elementOrY,
                ...defaultOptions,
                ...options
            });
        } else if (elementOrY instanceof Element) {
            elementOrY.scrollIntoView({
                ...defaultOptions,
                ...options
            });
        }
    },

    // ========== MODAL ANIMATIONS ==========
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            // Force reflow for animation
            modal.offsetHeight;
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.style.animation = 'slideInUp 0.3s ease';
            }
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.style.animation = 'slideOutDown 0.3s ease forwards';
                setTimeout(() => {
                    modal.classList.add('hidden');
                    content.style.animation = '';
                }, 300);
            } else {
                modal.classList.add('hidden');
            }
        }
    },

    // ========== PANEL SLIDE ==========
    openPanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.remove('hidden');
        }
    },

    closePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.add('hidden');
        }
    },

    // ========== COLLAPSE/EXPAND ==========
    toggleCollapse(triggerId, contentId) {
        const trigger = document.getElementById(triggerId);
        const content = document.getElementById(contentId);

        if (!trigger || !content) return;

        const isExpanded = !content.classList.contains('hidden');

        if (isExpanded) {
            content.classList.add('hidden');
            trigger.setAttribute('aria-expanded', 'false');
        } else {
            content.classList.remove('hidden');
            trigger.setAttribute('aria-expanded', 'true');
        }
    },

    // ========== TYPING ANIMATION ==========
    typeText(element, text, speed = 50) {
        return new Promise((resolve) => {
            element.textContent = '';
            let i = 0;

            const type = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            };

            type();
        });
    },

    // ========== CHART ANIMATION ==========
    animateChartEntry(chart) {
        if (chart && chart.data && chart.data.datasets) {
            chart.data.datasets.forEach((dataset, i) => {
                dataset.borderWidth = 0;
            });
            chart.update();

            setTimeout(() => {
                chart.data.datasets.forEach((dataset, i) => {
                    dataset.borderWidth = 2;
                });
                chart.update();
            }, 100);
        }
    },

    // ========== MUSIC VISUALIZER ==========
    createMusicVisualizer(container) {
        container.innerHTML = '';
        container.className = 'music-visualizer';

        for (let i = 0; i < 5; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            container.appendChild(bar);
        }
    },

    // ========== INITIALIZATION ==========
    init() {
        // Initialize scroll reveal
        this.initScrollReveal();

        // Add ripple effect to buttons with .ripple class
        document.querySelectorAll('.ripple').forEach(btn => {
            btn.addEventListener('click', (e) => this.createRipple(e));
        });

        // Setup modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.dataset.close;
                if (modalId) this.closeModal(modalId);
            });
        });

        // Close modal when clicking backdrop
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        console.log('🎨 Animation Engine initialized');
    }
};

// Export for use in other modules
window.AnimationEngine = AnimationEngine;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AnimationEngine.init();
});

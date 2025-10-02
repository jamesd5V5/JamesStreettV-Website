document.addEventListener('DOMContentLoaded', function () {
    initPortfolio();
    addInteractions();
    initAudioPreviews();
    initStaticGallery();
});

function initPortfolio() {
    const blocks = document.querySelectorAll('.block');
    blocks.forEach((block, index) => {
        block.style.opacity = '0';
        block.style.transform = 'translateY(30px)';

        setTimeout(() => {
            block.style.transition = 'all 0.6s ease';
            block.style.opacity = '1';
            block.style.transform = 'translateY(0)';
        }, index * 200);
    });

    const skillBars = document.querySelectorAll('.skill-fill');
    skillBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';

        setTimeout(() => {
            bar.style.width = width;
        }, 1000);
    });
}

function addInteractions() {
    const blocks = document.querySelectorAll('.block');

    blocks.forEach(block => {
        const hasNavigation = block.querySelector('.nav-tabs');
        if (hasNavigation) return;

        block.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });

        block.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });

        block.addEventListener('click', function (e) {
            // Don't interfere with link clicks
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }

            this.style.transform = 'translateY(-8px) scale(1.02)';
            setTimeout(() => {
                this.style.transform = 'translateY(0) scale(1)';
            }, 150);
        });
    });

    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.addEventListener('click', function () {
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(0, 212, 255, 0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.marginLeft = '-10px';
            ripple.style.marginTop = '-10px';

            this.style.position = 'relative';
            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

function initStaticGallery() {
    const gallery = document.querySelector('.gallery-block .scroll-content');
    if (!gallery) return;

    const slides = gallery.querySelectorAll(':scope > .gallery-slide');
    if (slides.length === 0) return;

    slides.forEach((s, i) => {
        if (i === 0) s.classList.add('active');
        else s.classList.remove('active', 'sliding-out');
    });

    if (gallery.cyclingInterval) {
        clearInterval(gallery.cyclingInterval);
        gallery.cyclingInterval = null;
    }

    let currentIndex = 0;
    function cycleSlides() {
        const nextIndex = (currentIndex + 1) % slides.length;
        const current = slides[currentIndex];
        const next = slides[nextIndex];
        current.classList.remove('active');
        current.classList.add('sliding-out');
        next.classList.add('active');
        next.classList.remove('sliding-out');
        setTimeout(() => current.classList.remove('sliding-out'), 800);
        currentIndex = nextIndex;

        const dots = gallery.querySelectorAll('.nav-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    gallery.classList.add('auto-cycle');
    gallery.cyclingInterval = setInterval(cycleSlides, 4000);
}

function initAudioPreviews() {
    const audioPreviews = document.querySelectorAll('.audio-preview');
    let currentlyPlaying = null;
    let currentEmbed = null;

    audioPreviews.forEach(preview => {
        preview.addEventListener('click', function (e) {
            e.preventDefault();

            const icon = this.querySelector('i');
            const text = this.querySelector('span');
            const embedType = this.getAttribute('data-embed');
            const embedContainer = this.parentElement.querySelector('.embed-container');

            if (currentlyPlaying && currentlyPlaying !== this) {
                const prevIcon = currentlyPlaying.querySelector('i');
                const prevText = currentlyPlaying.querySelector('span');
                const prevEmbed = currentlyPlaying.parentElement.querySelector('.embed-container');

                prevIcon.classList.remove('fa-pause');
                prevIcon.classList.add('fa-play');
                prevText.textContent = 'Listen';
                currentlyPlaying.style.color = '#4ecdc4';
                currentlyPlaying.style.transform = 'scale(1)';
                currentlyPlaying.classList.remove('playing');

                if (prevEmbed) {
                    prevEmbed.style.display = 'none';
                }
            }

            if (icon.classList.contains('fa-play')) {
                // Show embed container
                if (embedContainer) {
                    embedContainer.style.display = 'block';
                    embedContainer.style.marginTop = '15px';
                }

                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
                text.textContent = 'Hide';

                this.style.color = '#ff6b6b';
                this.style.transform = 'scale(1.05)';
                this.classList.add('playing');
                currentlyPlaying = this;
                currentEmbed = embedContainer;

                pauseScrollingForBlock(this);

                console.log('Showing embed player:', embedType);

            } else {
                // Hide embed container
                if (embedContainer) {
                    embedContainer.style.display = 'none';
                }

                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
                text.textContent = 'Listen';

                this.style.color = '#4ecdc4';
                this.style.transform = 'scale(1)';
                this.classList.remove('playing');
                currentlyPlaying = null;
                currentEmbed = null;

                resumeScrollingForBlock(this);

                console.log('Hiding embed player');
            }
        });
    });
}

function pauseScrollingForBlock(audioPreview) {
    const scrollContent = audioPreview.closest('.scroll-content');
    if (scrollContent && scrollContent.cyclingInterval) {
        clearInterval(scrollContent.cyclingInterval);
        scrollContent.cyclingInterval = null;
    }
}

function resumeScrollingForBlock(audioPreview) {
    const scrollContent = audioPreview.closest('.scroll-content');
    if (scrollContent && !scrollContent.cyclingInterval && scrollContent.classList.contains('auto-cycle')) {
        startCycling(scrollContent);
    }
}

function startCycling(content) {
    const isSplitLayout = content.classList.contains('split-layout');
    const isHybridLayout = content.classList.contains('hybrid-layout');

    let items;
    if (isSplitLayout) {
        items = content.querySelectorAll(':scope > .content-pair');
    } else if (isHybridLayout) {
        items = content.querySelectorAll(':scope > .single-item, :scope > .content-pair');
    } else {
        items = content.querySelectorAll(':scope > div:not(.nav-tabs)');
    }

    let currentIndex = 0;

    items.forEach((item, index) => {
        if (item.classList.contains('active')) {
            currentIndex = index;
        }
    });

    function cycleItems() {
        const currentItem = items[currentIndex];
        const nextIndex = (currentIndex + 1) % items.length;
        const nextItem = items[nextIndex];

        currentItem.classList.remove('active');
        currentItem.classList.add('sliding-out');

        nextItem.classList.add('active');
        nextItem.classList.remove('sliding-out');

        setTimeout(() => {
            currentItem.classList.remove('sliding-out');
        }, 1000);

        currentIndex = nextIndex;
    }

    content.cyclingInterval = setInterval(cycleItems, 4000);
}

function enhanceAutoScroll() {
    const scrollContents = document.querySelectorAll('.scroll-content');

    scrollContents.forEach(content => {
        const isSplitLayout = content.classList.contains('split-layout');
        const isHybridLayout = content.classList.contains('hybrid-layout');

        let items;
        if (isSplitLayout) {
            items = content.querySelectorAll(':scope > .content-pair');
        } else if (isHybridLayout) {
            items = content.querySelectorAll(':scope > .single-item, :scope > .content-pair');
        } else {
            items = content.querySelectorAll(':scope > div:not(.nav-tabs)');
        }

        let currentIndex = 0;

        items.forEach((item, index) => {
            if (index === 0) {
                item.classList.add('active');
            } else {
                item.classList.remove('active', 'sliding-out');
            }
        });

        function cycleItems() {
            const currentItem = items[currentIndex];
            const nextIndex = (currentIndex + 1) % items.length;
            const nextItem = items[nextIndex];

            currentItem.classList.remove('active');
            currentItem.classList.add('sliding-out');

            nextItem.classList.add('active');
            nextItem.classList.remove('sliding-out');

            setTimeout(() => {
                currentItem.classList.remove('sliding-out');
            }, 1000);

            currentIndex = nextIndex;

            const dots = content.querySelectorAll('.nav-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        content.cyclingInterval = setInterval(cycleItems, 4000);
        content.classList.add('auto-cycle');

        content.addEventListener('mouseenter', function () {
            if (this.cyclingInterval) {
                clearInterval(this.cyclingInterval);
                this.cyclingInterval = null;
            }
        });

        content.addEventListener('mouseleave', function () {
            if (!this.cyclingInterval) {
                this.cyclingInterval = setInterval(cycleItems, 4000);
            }
        });
    });
}

const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .scroll-content > div {
        transition: all 0.8s ease-in-out;
    }
    
    .scroll-content > div.active {
        left: 0 !important;
        opacity: 1 !important;
        transform: translateX(0) !important;
    }
    
    .scroll-content > div.sliding-out {
        left: 0 !important;
        opacity: 1 !important;
        transform: translateX(-100%) !important;
    }
    
    .scroll-content.hybrid-layout .single-item,
    .scroll-content.hybrid-layout .content-pair {
        transition: all 0.8s ease-in-out;
    }
    
    .scroll-content.hybrid-layout .single-item.active,
    .scroll-content.hybrid-layout .content-pair.active {
        left: 0 !important;
        opacity: 1 !important;
        transform: translateX(0) !important;
    }
    
    .scroll-content.hybrid-layout .single-item.sliding-out,
    .scroll-content.hybrid-layout .content-pair.sliding-out {
        left: 0 !important;
        opacity: 1 !important;
        transform: translateX(-100%) !important;
    }
`;
document.head.appendChild(style);

enhanceAutoScroll();
initNavigationTabs();

function initNavigationTabs() {
    const scrollContents = document.querySelectorAll('.scroll-content');

    scrollContents.forEach((content, contentIndex) => {
        const prevBtn = content.querySelector('.nav-prev');
        const nextBtn = content.querySelector('.nav-next');
        const indicators = content.querySelector('.nav-indicators');

        if (!prevBtn || !nextBtn || !indicators) return;

        const isSplitLayout = content.classList.contains('split-layout');
        const isHybridLayout = content.classList.contains('hybrid-layout');

        let items;
        if (isSplitLayout) {
            items = content.querySelectorAll(':scope > .content-pair');
        } else if (isHybridLayout) {
            items = content.querySelectorAll(':scope > .single-item, :scope > .content-pair');
        } else {
            items = content.querySelectorAll(':scope > div:not(.nav-tabs)');
        }

        indicators.innerHTML = '';
        items.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'nav-dot' + (index === 0 ? ' active' : '');
            dot.dataset.index = String(index);
            indicators.appendChild(dot);
        });
        const dots = indicators.querySelectorAll('.nav-dot');

        let currentIndex = 0;

        function updateActiveDot() {
            indicators.querySelectorAll('.nav-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        function goToItem(index) {
            if (index < 0) index = items.length - 1;
            if (index >= items.length) index = 0;

            items[currentIndex].classList.remove('active');
            items[index].classList.add('active');

            currentIndex = index;
            updateActiveDot();
        }

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            goToItem(currentIndex - 1);
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            goToItem(currentIndex + 1);
        });

        indicators.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.classList && target.classList.contains('nav-dot')) {
                const index = parseInt(target.dataset.index || '0', 10);
                goToItem(index);
            }
        });

        updateActiveDot();
    });
}

document.addEventListener('keydown', function (e) {
    const blocks = document.querySelectorAll('.block');
    let currentIndex = 0;

    blocks.forEach((block, index) => {
        if (block.style.transform.includes('scale(1.02)')) {
            currentIndex = index;
        }
    });

    switch (e.key) {
        case 'ArrowRight':
            e.preventDefault();
            if (currentIndex < blocks.length - 1) {
                blocks[currentIndex + 1].click();
            }
            break;
        case 'ArrowLeft':
            e.preventDefault();
            if (currentIndex > 0) {
                blocks[currentIndex - 1].click();
            }
            break;
        case 'Enter':
            e.preventDefault();
            blocks[currentIndex].click();
            break;
    }
});

document.documentElement.style.scrollBehavior = 'smooth';

function smoothAnimation(callback) {
    let ticking = false;

    return function () {
        if (!ticking) {
            requestAnimationFrame(function () {
                callback();
                ticking = false;
            });
            ticking = true;
        }
    };
}

window.addEventListener('scroll', smoothAnimation(function () {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('body');
    const speed = scrolled * 0.5;

    parallax.style.transform = `translateY(${speed}px)`;
}));

window.addEventListener('load', function () {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        const blocks = document.querySelectorAll('.block');
        let currentIndex = 0;

        blocks.forEach((block, index) => {
            if (block.style.transform.includes('scale(1.02)')) {
                currentIndex = index;
            }
        });

        if (diff > 0 && currentIndex < blocks.length - 1) {
            blocks[currentIndex + 1].click();
        } else if (diff < 0 && currentIndex > 0) {
            blocks[currentIndex - 1].click();
        }
    }
}


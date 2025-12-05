document.addEventListener('DOMContentLoaded', () => {
    
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // --- Hero Typing Animation ---
    const heroTitleText = "Hello. I'm Aniket.";
    const heroDescText = "I design and build exceptional digital experiences that are intuitive, efficient, and beautiful.";
    const titleEl = document.getElementById('hero-title');
    const descEl = document.getElementById('hero-desc');

    function typeWriter(element, text, speed = 100, callback) {
        let i = 0;
        element.innerHTML = '';
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        element.appendChild(cursor);

        function type() {
            if (i < text.length) {
                element.innerHTML = text.slice(0, i + 1);
                element.appendChild(cursor);
                i++;
                setTimeout(type, speed);
            } else {
                cursor.remove();
                if (callback) callback();
            }
        }
        type();
    }

    // Start typing title
    typeWriter(titleEl, heroTitleText, 150, () => {
        // Delay before starting description
        setTimeout(() => {
            typeWriter(descEl, heroDescText, 30);
        }, 500);
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.querySelector('button[aria-controls="mobile-menu"]');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = document.querySelector('.hamburger');
    const closeIcon = document.querySelector('.close');
    const mobileNavLinks = document.querySelectorAll('#mobile-menu a.nav-link');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('hidden');
            hamburgerIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        });

        // Close menu when a link is clicked
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                hamburgerIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            });
        });
    }

    // --- LLM API Constants ---
    const API_KEY = ""; // Using canvas provided key
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;

    // --- Elements ---
    const briefInput = document.getElementById('brief');
    const messageTextarea = document.getElementById('message');
    const draftButton = document.getElementById('draft-message-btn');
    const llmStatus = document.getElementById('llm-status');
    const llmMessage = document.getElementById('llm-message');
    const contactForm = document.getElementById('contact-form');
    const formSuccessMessage = document.getElementById('form-success');
    
    // --- Gemini LLM Function: Draft Message ---
    async function draftMessageWithGemini(brief) {
        if (!brief.trim()) {
            llmMessage.textContent = "Please enter a brief project idea first.";
            llmStatus.classList.remove('hidden');
            llmStatus.classList.remove('bg-blue-100', 'text-blue-800');
            llmStatus.classList.add('bg-yellow-100', 'text-yellow-800');
            draftButton.disabled = false;
            setTimeout(() => llmStatus.classList.add('hidden'), 3000);
            return;
        }

        llmMessage.textContent = "Drafting your professional message...";
        llmStatus.classList.remove('hidden');
        llmStatus.classList.add('bg-blue-100', 'text-blue-800');
        draftButton.disabled = true;

        const systemPrompt = "You are a professional project drafting assistant. Your goal is to take a user's brief project idea and turn it into a concise, professional, and engaging message suitable for an initial contact email to a developer. The tone should be formal yet enthusiastic. Start with a greeting, but do not include a final sign-off (e.g., 'Sincerely,' or 'Best,').";
        
        const userQuery = `Draft an introductory message for a project based on this brief idea: "${brief.trim()}"`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };
        
        let maxRetries = 3;
        let delay = 1000;

        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (text) {
                    messageTextarea.value = text.trim();
                    llmMessage.textContent = "Draft complete! Feel free to edit and send.";
                    llmStatus.classList.remove('bg-blue-100', 'text-blue-800');
                    llmStatus.classList.add('bg-green-100', 'text-green-800');
                    draftButton.disabled = false;
                    setTimeout(() => llmStatus.classList.add('hidden'), 5000);
                    return; // Success
                }
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff
                } else {
                    llmMessage.textContent = "Sorry, the AI drafting service is currently unavailable. Please write your message manually.";
                    llmStatus.classList.remove('bg-blue-100', 'text-blue-800');
                    llmStatus.classList.add('bg-red-100', 'text-red-800');
                    draftButton.disabled = false;
                    setTimeout(() => llmStatus.classList.add('hidden'), 5000);
                }
            }
        }
    }

    // --- Event Listeners ---

    draftButton.addEventListener('click', () => {
        draftMessageWithGemini(briefInput.value);
    });

    // Contact Form Submission (Placeholder)
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        console.log('Form submitted:', data);
        
        formSuccessMessage.classList.remove('hidden');
        this.reset();
        
        setTimeout(() => {
            formSuccessMessage.classList.add('hidden');
        }, 5000);
    });
    
    // Testimonials Carousel
    let currentSlide = 0;
    const slides = document.querySelectorAll('.testimonial-slide');
    const totalSlides = slides.length;

    document.getElementById('next-testimonial').addEventListener('click', () => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % totalSlides;
        slides[currentSlide].classList.add('active');
    });

    document.getElementById('prev-testimonial').addEventListener('click', () => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        slides[currentSlide].classList.add('active');
    });

    // Auto-advance carousel every 5 seconds
    setInterval(() => {
        document.getElementById('next-testimonial').click();
    }, 5000);
    
    // Gallery Modal & Lightbox Logic (from previous request)
    const galleryStack = document.getElementById('gallery-stack');
    const galleryModal = document.getElementById('gallery-modal');
    const closeModal = document.getElementById('close-modal');
    const gridImages = document.querySelectorAll('.gallery-grid-item');
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightbox = document.getElementById('close-lightbox');
    
    // 1. Open Gallery Modal (the grid)
    galleryStack.addEventListener('click', () => {
        galleryModal.classList.remove('modal-hidden');
        galleryModal.classList.add('modal-visible');
        document.body.classList.add('body-no-scroll'); // Prevent background scrolling

        // Stagger animation for grid items
        setTimeout(() => {
            gridImages.forEach((img, index) => {
                setTimeout(() => {
                    img.classList.add('is-visible');
                }, index * 150);
            });
        }, 150);
    });
    
    // 2. Close Gallery Modal
    closeModal.addEventListener('click', () => {
        // Reset animations before closing
        gridImages.forEach(img => {
            img.classList.remove('is-visible');
        });
        galleryModal.classList.add('modal-hidden');
        galleryModal.classList.remove('modal-visible');
        document.body.classList.remove('body-no-scroll');
    });
    
    // 3. Open Lightbox (full image)
    gridImages.forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            const imgSrc = img.getAttribute('src');
            
            // Close gallery modal immediately
            gridImages.forEach(gImg => gImg.classList.remove('is-visible'));
            galleryModal.classList.add('modal-hidden');
            galleryModal.classList.remove('modal-visible');
            document.body.classList.remove('body-no-scroll');
            
            // Open lightbox
            lightboxImg.setAttribute('src', imgSrc);
            lightboxImg.classList.remove('is-visible'); // Reset for animation
            lightbox.classList.remove('modal-hidden');
            lightbox.classList.add('modal-visible');
            // Trigger lightbox image animation
            setTimeout(() => {
                lightboxImg.classList.add('is-visible');
            }, 50);
            
            // Re-apply no-scroll for lightbox
            document.body.classList.add('body-no-scroll');
        });
    });
    
    // 4. Close Lightbox
    function hideLightbox() {
        lightboxImg.classList.remove('is-visible');
        lightbox.classList.add('modal-hidden');
        lightbox.classList.remove('modal-visible');
        document.body.classList.remove('body-no-scroll');
    }
    
    closeLightbox.addEventListener('click', hideLightbox);
    // Also close lightbox if background is clicked
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            hideLightbox();
        }
    });

    // --- Toolkit Tab Functionality ---
    const tabButtons = document.querySelectorAll('.toolkit-tab-btn');
    const tabContents = document.querySelectorAll('.toolkit-tab-content');

    function showTabContent(tabId) {
        // 1. Deactivate all content and buttons
        tabContents.forEach(content => {
            content.classList.remove('active-content');
            content.classList.add('hidden'); 
        });
        tabButtons.forEach(btn => {
            btn.classList.remove('active-tab-btn');
        });

        // 2. Activate the selected content
        const activeContent = document.querySelector(`[data-tab-content="${tabId}"]`);
        const activeButton = document.querySelector(`[data-tab="${tabId}"]`);

        if (activeContent) {
            // Remove 'hidden' immediately to allow transition
            activeContent.classList.remove('hidden'); 
            // Trigger the transition with a small delay for smooth animation
            setTimeout(() => {
                activeContent.classList.add('active-content');
            }, 50); 
        }
        
        // 3. Activate the selected button
        if (activeButton) {
            activeButton.classList.add('active-tab-btn');
        }
    }

    // Set initial active tab
    showTabContent('frontend');

    // Add event listeners to buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            showTabContent(tabId);
        });
    });

    // Smooth Scrolling for Nav Links
    const navLinks = document.querySelectorAll('header a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = document.querySelector('header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active Nav Link Highlighting on Scroll
    const sections = document.querySelectorAll('section[id]');
    const allNavLinks = document.querySelectorAll('nav a.nav-link');
    
    const observerOptions = {
        root: null,
        rootMargin: '-80px 0px -50% 0px',
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                allNavLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    const homeLink = document.querySelector('nav a[href="#home"]');
    if (homeLink) homeLink.classList.add('active');

    // Scroll-triggered Fade-in Animations
    const animatedElements = document.querySelectorAll('.scroll-animate');
    
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0
    });

    animatedElements.forEach(el => {
        animationObserver.observe(el);
    });

});
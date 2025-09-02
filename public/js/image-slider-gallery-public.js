(function($) {
    'use strict';

    // Default slider configuration
    const defaultConfig = {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        speed: 500,
        autoplay: false, // Will be overridden by sliderConfig
        autoplaySpeed: 3000, // Will be overridden by sliderConfig
        arrows: true,
        dots: true,
        fade: false,
        cssEase: 'ease',
        adaptiveHeight: true,
        prevArrow: '<button type="button" class="slick-prev">Previous</button>',
        nextArrow: '<button type="button" class="slick-next">Next</button>',
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                    dots: true
                }
            }
        ]
    };

    // Initialize parallax effect with mouse movement
    function initParallaxEffect($slider) {
        $slider.on('mousemove', function(e) {
            if ($slider.hasClass('effect-parallax')) {
                const $activeSlide = $slider.find('.slick-slide.slick-active');
                if ($activeSlide.length) {
                    const $container = $activeSlide.find('.slider-image-container');
                    const containerWidth = $container.width();
                    const containerHeight = $container.height();
                    const containerOffset = $container.offset();
                    
                    // Calculate mouse position relative to container
                    const mouseX = e.pageX - containerOffset.left;
                    const mouseY = e.pageY - containerOffset.top;
                    
                    // Calculate percentage from center (-1 to 1)
                    const percentX = (mouseX / containerWidth) * 2 - 1;
                    const percentY = (mouseY / containerHeight) * 2 - 1;
                    
                    // Apply transforms to each layer
                    $activeSlide.find('.slider-parallax-layer').each(function(index) {
                        const depth = (index + 1) * 0.1; // Different depth for each layer
                        const moveX = percentX * 30 * depth;
                        const moveY = percentY * 30 * depth;
                        
                        $(this).css({
                            'transform': `translate3d(${moveX}px, ${moveY}px, 0)`,
                            'transition': 'transform 0.1s ease-out'
                        });
                    });
                }
            }
        });
        
        // Reset on mouse leave
        $slider.on('mouseleave', function() {
            $slider.find('.slider-parallax-layer').css({
                'transform': 'translate3d(0, 0, 0)',
                'transition': 'transform 0.5s ease-out'
            });
        });
    }

    // Effect configurations - each effect should be defined only once
    const effectConfigs = {
        // Coverflow Effect
        'coverflow': {
            slidesToShow: 3,
            centerMode: true,
            centerPadding: '0',
            speed: 600,
            cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
            onInit: function(slick) {
                const $slider = $(slick.$slider).addClass('effect-coverflow');
                updateCoverflowSlides(slick);
            },
            beforeChange: function(event, slick, currentSlide, nextSlide) {
                $(slick.$slides).removeClass('slick-center');
                $(slick.$slides[nextSlide]).addClass('slick-center');
                updateCoverflowSlides(slick);
            },
            afterChange: updateCoverflowSlides,
            onSwipe: updateCoverflowSlides
        },
        
        // Parallax Effect
        'parallax': {
            speed: 1000,
            cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
            onInit: function(slick) {
                const $slider = $(slick.$slider).addClass('effect-parallax');
                initParallaxEffect($slider);
            }
        },
        
        // Slice/Strip Effect
        'slice': {
            speed: 1000,
            cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
            onInit: function(slick) {
                const $slider = $(slick.$slider).addClass('effect-slice');
                initSliceEffect($slider);
            },
            beforeChange: function(event, slick, currentSlide, nextSlide) {
                // Animate out current slide
                const $currentSlide = $(slick.$slides[currentSlide]);
                animateSliceOut($currentSlide);
                
                // Prepare next slide
                const $nextSlide = $(slick.$slides[nextSlide]);
                prepareSliceIn($nextSlide);
            },
            afterChange: function(slick, currentSlide) {
                // Animate in current slide
                const $currentSlide = $(slick.$slides[currentSlide]);
                animateSliceIn($currentSlide);
            }
        },
        
        // Bounce/Elastic Effect
        'bounce': {
            speed: 1000,
            cssEase: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            onInit: function(slick) {
                const $slider = $(slick.$slider).addClass('effect-bounce');
                $slider.find('.slick-slide').css('opacity', '0');
                $slider.find('.slick-active').css('opacity', '1');
            },
            beforeChange: function(event, slick, currentSlide, nextSlide) {
                const $current = $(slick.$slides[currentSlide]);
                $current.css({
                    'animation': 'bounceOut 0.8s forwards',
                    'z-index': 1
                });
                
                const $next = $(slick.$slides[nextSlide]);
                $next.css({
                    'opacity': '1',
                    'animation': 'none',
                    'transform': 'scale(0.8)'
                });
            },
            afterChange: function(slick, currentSlide) {
                const $current = $(slick.$slides[currentSlide]);
                $current.css({
                    'animation': 'bounceIn 0.8s forwards',
                    'z-index': 2
                });
            }
        },
        // Fade / Dissolve
        'fade': {
            fade: true,
            speed: 800,
            cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
            onInit: function(slick) {
                $(slick.$slider).addClass('effect-fade');
            }
        },
        
        // Slide (Horizontal)
        'slide': {
            fade: false,
            speed: 500,
            cssEase: 'ease',
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
            adaptiveHeight: true,
            vertical: false,
            swipe: true,
            touchMove: true,
            draggable: true,
            swipeToSlide: true,
            onInit: function(slick) {
                const $slider = $(slick.$slider);
                // Check if vertical mode is enabled
                const isVertical = $slider.hasClass('vertical');
                if (isVertical) {
                    $slider.addClass('vertical-mode');
                    // Update slick settings for vertical mode
                    slick.slick('slickSetOption', 'vertical', true, true);
                    slick.slick('slickSetOption', 'verticalSwiping', true, true);
                    // Adjust slide height to fit content
                    $slider.find('.slick-slide').css('height', 'auto');
                }
            }
        },
        
        // Zoom / Ken Burns
        'zoom': {
            fade: true,
            speed: 1000,
            cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
            onInit: function(slick) {
                const $slider = $(slick.$slider).addClass('effect-zoom');
                $slider.find('.slick-slide:first-child img').addClass('slick-zoom-active');
            },
            beforeChange: function(event, slick, currentSlide, nextSlide) {
                $(slick.$slider).find('.slick-zoom-active').removeClass('slick-zoom-active');
            },
            afterChange: function(slick, currentSlide) {
                $(slick.$slider).find(`.slick-slide[data-slick-index="${currentSlide}"] img`).addClass('slick-zoom-active');
            }
        },
        
        // 3D Cube
        'cube': {
            slidesToShow: 1,
            slidesToScroll: 1,
            speed: 1000,
            cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
            onInit: function(slick) {
                const $slider = $(slick.$slider).addClass('effect-cube');
                $slider.find('.slick-track').wrap('<div class="cube-container"></div>');
                $slider.find('.slick-list').wrap('<div class="cube"></div>');
            },
            beforeChange: function(event, slick, currentSlide, nextSlide) {
                const direction = currentSlide < nextSlide ? 1 : -1;
                const angle = (nextSlide * 90 * direction) + 'deg';
                updateCubeRotation(slick, angle);
            }
        },
        
        // Flip / Card
        'flip': {
            speed: 800,
            cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
            onInit: function(slick) {
                $(slick.$slider).addClass('effect-flip');
                $(slick.$slides).addClass('flip-slide');
            },
            beforeChange: function(event, slick, currentSlide, nextSlide) {
                $(slick.$slides).removeClass('flipping');
                $(slick.$slides[nextSlide]).addClass('flipping');
            }
        },
        
        // Coverflow
        'coverflow': {
            slidesToShow: 3,
            centerMode: true,
            centerPadding: '0',
            focusOnSelect: true,
            speed: 500,
            cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
            infinite: true,
            infinite: false,
            touchThreshold: 15,
            onInit: function(slick) {
                const $slider = $(slick.$slider);
                $slider.addClass('vertical-mode');
                
                // Initial height update
                updateVerticalSliderHeight(slick);
                
                // Handle window resize with debounce
                let resizeTimer;
                $(window).on('resize.verticalSlider', function() {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(function() {
                        updateVerticalSliderHeight(slick);
                    }, 250);
                });
            },
            onAfterChange: function() {
                updateVerticalSliderHeight(this);
            },
            onSetPosition: function() {
                const $slider = $(this);
                $slider.find('.slick-slide, .slick-track, .slick-list').css('max-height', '');
            },
            onDestroy: function() {
                $(window).off('resize.verticalSlider');
            },
            onReInit: function(slick) {
                updateVerticalSliderHeight(slick);
            },
            onBeforeChange: function() {
                // Reset track position before change to prevent jumps
                $('.slick-track', this).css('transform', 'translate3d(0, 0, 0)');
            }
        },
        // Ken Burns Effect
        'kenburns': {
            fade: true,
            speed: 1000,
            autoplaySpeed: 8000, // 8 seconds per slide
            cssEase: 'ease-in-out',
            pauseOnHover: true,
            pauseOnFocus: false,
            touchThreshold: 10,
            swipeToSlide: true,
            adaptiveHeight: false,
            lazyLoad: 'ondemand',
            onInit: function(slick) {
                console.log('Initializing Ken Burns effect');
                const $slider = $(slick.$slider).addClass('effect-kenburns');
                
                // Set slider container styles
                $slider.css({
                    'position': 'relative',
                    'width': '100%',
                    'height': '100%',
                    'overflow': 'hidden'
                });
                
                // Initialize Ken Burns effect for all slides
                $(slick.$slides).each(function(index) {
                    const $slide = $(this);
                    console.log('Initializing slide', index, $slide);
                    
                    // Ensure slide has proper styles
                    $slide.css({
                        'position': 'relative',
                        'width': '100%',
                        'height': '100%',
                        'overflow': 'hidden'
                    });
                    
                    initKenBurnsEffect($slider, slick, $slide);
                });
                
                // Pause animation when not in viewport
                if (typeof IntersectionObserver !== 'undefined') {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            const $slide = $(entry.target);
                            const $img = $slide.find('.slider-image');
                            
                            if (entry.isIntersecting) {
                                $img.css('animation-play-state', 'running');
                            } else {
                                $img.css('animation-play-state', 'paused');
                            }
                        });
                    }, { 
                        threshold: 0.1,
                        rootMargin: '20% 0%'
                    });
                    
                    // Observe each slide
                    $(slick.$slides).each((i, slide) => {
                        observer.observe(slide);
                    });
                    
                    // Store observer for cleanup
                    $slider.data('kenburns-observer', observer);
                }
            },
            beforeChange: function(event, slick, currentSlide, nextSlide) {
                // Clean up previous slide
                if (slick.$slides[currentSlide]) {
                    const $slide = $(slick.$slides[currentSlide]);
                    const $img = $slide.find('.slider-image');
                    
                    // Pause the animation
                    $img.css('animation-play-state', 'paused');
                    
                    // Reset transform for smooth transition
                    $img.css('transform', 'scale(1) translate(0, 0)');
                }
            },
            afterChange: function(slick, currentSlide) {
                const $slider = $(slick.$slider);
                const $currentSlide = $(slick.$slides[currentSlide]);
                
                // Initialize Ken Burns effect for the new slide
                initKenBurnsEffect($slider, slick, $currentSlide);
                
                // Ensure the image is visible and animating
                $currentSlide.find('.slider-image')
                    .css('opacity', '1')
                    .css('animation-play-state', 'running');
            },
            onDestroy: function(slick) {
                const $slider = $(slick.$slider);
                
                // Clean up IntersectionObserver
                const observer = $slider.data('kenburns-observer');
                if (observer && typeof observer.disconnect === 'function') {
                    observer.disconnect();
                }
                
                // Clean up styles and classes
                $('.kenburns-style').remove();
                $('.slider-image', slick.$slider)
                    .removeClass('kenburns-zoom-in kenburns-pan-left kenburns-pan-right kenburns-pan-up kenburns-pan-down')
                    .css({
                        'animation': 'none',
                        'transform': 'scale(1) translate(0, 0)',
                        'opacity': '1',
                        'animation-play-state': 'paused'
                    });
            }
        },
        
        // Zoom Effect with performance optimizations
        'zoom': {
            fade: true,
            speed: 800,
            autoplaySpeed: 8000, // 8 seconds per slide
            cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pauseOnHover: false,
            pauseOnFocus: false,
            onInit: function(slick) {
                const $slider = $(slick.$slider).addClass('effect-zoom');
                initZoomEffect($slider, slick);
                
                // Optimize performance with IntersectionObserver
                if (typeof IntersectionObserver !== 'undefined') {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            const $img = $(entry.target).find('img');
                            if (entry.isIntersecting) {
                                $img.css('transform', $img.data('end-scale') || 'scale(1.15)');
                            } else {
                                $img.css('transform', $img.data('start-scale') || 'scale(1)');
                            }
                        });
                    }, { 
                        threshold: 0.1,
                        rootMargin: '20% 0px'
                    });
                    
                    // Observe each slide
                    $(slick.$slides).each((i, slide) => {
                        observer.observe(slide);
                    });
                    
                    // Store observer for cleanup
                    $slider.data('zoom-observer', observer);
                }
            },
            beforeChange: function(event, slick, currentSlide, nextSlide) {
                // Reset zoom on previous slide
                if (slick.$slides[currentSlide]) {
                    const $img = $(slick.$slides[currentSlide]).find('img');
                    $img.css({
                        'transform': $img.data('start-scale') || 'scale(1)',
                        'transition': 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                    });
                }
            },
            afterChange: function(slick, currentSlide) {
                // Start zoom effect on current slide
                const $currentSlide = $(slick.$slides[currentSlide]);
                const $img = $currentSlide.find('img');
                
                // Store the target scale for the IntersectionObserver
                const startScale = $img.data('start-scale') || '1';
                const endScale = $img.data('end-scale') || '1.15';
                
                $img.css({
                    'transform': endScale,
                    'transition': 'transform 8s cubic-bezier(0.2, 0.8, 0.2, 1)'
                });
            },
            onDestroy: function(slick) {
                // Clean up IntersectionObserver
                const $slider = $(slick.$slider);
                const observer = $slider.data('zoom-observer');
                if (observer && typeof observer.disconnect === 'function') {
                    observer.disconnect();
                }
                
                // Reset all zoom transforms
                $slider.find('.slick-slide img').css({
                    'transform': '',
                    'transition': '',
                    'will-change': ''
                });
            }
        },
        // 3D Cube
        'cube': {
            slidesToShow: 1,
            slidesToScroll: 1,
            speed: 1000,
            cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
            onInit: function(slick) {
                const $slider = $(slick.$slider).addClass('cube-effect');
                
                // Initialize cube faces
                $slider.find('.slick-slide').each(function() {
                    const $slide = $(this);
                    const $img = $slide.find('img');
                    const imgSrc = $img.attr('src');
                    
                    if ($slide.find('.cube-container').length === 0) {
                        const $container = $('<div class="cube-container"></div>');
                        const $cube = $('<div class="cube"></div>');
                        
                        // Create 6 faces for the cube
                        const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
                        faces.forEach((face, index) => {
                            const $face = $(`<div class="cube-face cube-face-${face}"></div>`);
                            $face.css('background-image', `url(${imgSrc})`);
                            $cube.append($face);
                        });
                        
                        $container.append($cube);
                        $img.after($container);
                        $img.hide();
                    }
                });
                
                // Set initial rotation
                updateCubeRotation(slick, 0);
            },
            beforeChange: function(event, slick, currentSlide, nextSlide) {
                // Start rotation animation
                const $currentSlide = $(slick.$slides[currentSlide]);
                $currentSlide.find('.cube').addClass('rotating');
                
                // Determine rotation direction
                const direction = nextSlide > currentSlide ? 1 : -1;
                const rotation = 90 * direction;
                
                // Apply rotation
                $currentSlide.find('.cube').css({
                    'transform': `rotateY(${rotation}deg)`,
                    'transition': 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                });
            },
            afterChange: function(slick, currentSlide) {
                // Reset rotation after animation
                setTimeout(() => {
                    const $currentSlide = $(slick.$slides[currentSlide]);
                    $currentSlide.find('.cube')
                        .removeClass('rotating')
                        .css('transform', 'rotateY(0)');
                }, 800);
            }
        },
        // Flip / Card
        'flip': {
            speed: 800,
            cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
            onInit: function(slick) {
                const $slider = $(slick.$slider).addClass('flip-effect');
                
                // Initialize flip cards
                $slider.find('.slick-slide').each(function() {
                    const $slide = $(this);
                    const $img = $slide.find('img');
                    const imgSrc = $img.attr('src');
                    
                    if ($slide.find('.flip-card').length === 0) {
                        const $flipCard = $('<div class="flip-card"></div>');
                        const $flipCardInner = $('<div class="flip-card-inner"></div>');
                        const $flipCardFront = $('<div class="flip-card-front"></div>');
                        const $flipCardBack = $('<div class="flip-card-back"></div>');
                        
                        $flipCardFront.css('background-image', `url(${imgSrc})`);
                        $flipCardBack.css('background-image', `url(${imgSrc})`);
                        
                        $flipCardInner.append($flipCardFront, $flipCardBack);
                        $flipCard.append($flipCardInner);
                        $img.after($flipCard);
                        $img.hide();
                    }
                });
            },
            beforeChange: function(event, slick, currentSlide, nextSlide) {
                // Add flip animation class to current slide
                const $currentSlide = $(slick.$slides[currentSlide]);
                $currentSlide.find('.flip-card-inner').addClass('flipping');
                
                // Set flip direction based on navigation
                const direction = nextSlide > currentSlide ? 'rotateY(180deg)' : 'rotateY(-180deg)';
                $currentSlide.find('.flip-card-inner').css('transform', direction);
            }
        },
        // Coverflow effect
        'coverflow': {
            slidesToShow: 3,
            centerMode: true,
            centerPadding: '0',
            focusOnSelect: true,
            speed: 500,
            cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
            infinite: true,
            arrows: true,
            dots: false,
            variableWidth: false,
            swipeToSlide: true,
            onInit: function(slick) {
                const $slider = $(slick.$slider);
                $slider.addClass('effect-coverflow');
                
                // Initialize 3D transforms for all slides
                $(slick.$slides).each(function() {
                    const $slide = $(this);
                    const $img = $slide.find('img');
                    
                    // Ensure images have proper styling
                    $img.css({
                        'transform-style': 'preserve-3d',
                        'backface-visibility': 'hidden',
                        'transition': 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    });
                });
                
                // Update positions initially
                updateCoverflowSlides(slick);
            },
            beforeChange: function(event, slick, currentSlide, nextSlide) {
                // Update z-index and other properties before slide change
                $(slick.$slides).removeClass('slick-center');
                $(slick.$slides[nextSlide]).addClass('slick-center');
            },
            afterChange: function(slick) {
                // Update positions after animation completes
                updateCoverflowSlides(slick);
            },
            onSwipe: function(slick) {
                // Update positions during swipe
                updateCoverflowSlides(slick);
            }
        }
    };

    // Check if Slick Slider is loaded
    function isSlickLoaded() {
        return typeof $.fn.slick !== 'undefined';
    }
    
    // Set slider dimensions
    function setSliderDimensions($slider, dimensions) {
        $slider.css({
            'width': dimensions.width > 0 ? dimensions.width + 'px' : '100%',
            'height': dimensions.height > 0 ? dimensions.height + 'px' : 'auto'
        });
    }

    // Initialize all sliders on the page
    function initializeSliders() {
        $('.image-slider-gallery').each(function() {
            const $slider = $(this);
            
            // Skip if already initialized
            if ($slider.hasClass('slick-initialized')) {
                return;
            }
            
            // Get slider settings from data attributes or use defaults
            const settings = {
                autoplay: $slider.data('autoplay') || false,
                autoplaySpeed: parseInt($slider.data('autoplay-speed')) || 3000,
                effect: ($slider.data('effect') || 'fade').toLowerCase(),
                arrows: $slider.data('arrows') !== undefined ? $slider.data('arrows') : true,
                dots: $slider.data('dots') !== undefined ? $slider.data('dots') : true,
                speed: parseInt($slider.data('speed')) || 500,
                dimensions: {
                    width: parseInt($slider.data('width')) || 0,
                    height: parseInt($slider.data('height')) || 0
                }
            };
            
            // Get effect configuration
            let effect = settings.effect;
            
            // Handle slide effect based on settings
            if (effect === 'slide' || effect === 'slide-vertical') {
                // Ensure the effect is properly set for slide transitions
                effect = effect;
                // Force fade to false for slide effects
                defaultConfig.fade = false;
            } else if (!effect || !effectConfigs[effect]) {
                console.warn('Effect not found or invalid, using default:', effect);
                effect = 'fade'; // Default to fade if effect is invalid
            }
            
            // Add effect class to slider wrapper
            $slider.addClass('effect-' + effect);
            
            // Get effect config and merge with default config
            const effectConfig = effectConfigs[effect] || effectConfigs['fade'];
            const sliderConfig = {
                ...defaultConfig,
                ...effectConfig,
                autoplay: settings.autoplay,
                autoplaySpeed: settings.autoplaySpeed,
                arrows: settings.arrows,
                dots: settings.dots,
                speed: settings.speed,
                // Ensure slides are properly initialized
                onInit: function(slick) {
                    if (effectConfig.onInit) {
                        effectConfig.onInit(slick);
                    }
                    // Set initial dimensions after initialization
                    if (settings.dimensions.width > 0 && settings.dimensions.height > 0) {
                        setSliderDimensions($slider, settings.dimensions);
                    }
                },
                // Handle slide changes
                beforeChange: function(event, slick, currentSlide, nextSlide) {
                    if (effectConfig.beforeChange) {
                        effectConfig.beforeChange(event, slick, currentSlide, nextSlide);
                    }
                },
                afterChange: function(slick, currentSlide) {
                    if (effectConfig.afterChange) {
                        effectConfig.afterChange(slick, currentSlide);
                    }
                }
            };
            
            // Initialize the slider if Slick is loaded
            if (isSlickLoaded()) {
                $slider.slick(sliderConfig);
                
                // Set initial dimensions if specified
                if (settings.dimensions.width > 0 && settings.dimensions.height > 0) {
                    setSliderDimensions($slider, settings.dimensions);
                }
                
                // Handle window resize
                let resizeTimer;
                $(window).on('resize', function() {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(function() {
                        if (settings.dimensions.width > 0 && settings.dimensions.height > 0) {
                            setSliderDimensions($slider, settings.dimensions);
                        }
                        // Update effects on resize
                        if (effect === 'coverflow' || effect === 'cube') {
                            updateCoverflowSlides($slider.slick('getSlick'));
                        }
                    }, 250);
                });
            } else {
                console.warn('Slick Slider is not loaded');
            }
        });
    }
    
    // Update cube rotation
    function updateCubeRotation(slick, angle) {
        const $slider = $(slick.$slider);
        const $track = $slider.find('.slick-track');
        const $currentSlide = $slider.find('.slick-slide.slick-active');
        
        // Reset track styles
        $track.css({
            'height': 'auto',
            'transform': 'translate3d(0, 0, 0)'
        });
        
        // Calculate slide height
        const slideHeight = $currentSlide.outerHeight(true);
        
        // Set slider height to match current slide
        $slider.css('height', slideHeight + 'px');
        
        // Update track height to match total slides height
        let totalHeight = 0;
        $slider.find('.slick-slide').each(function() {
            totalHeight += $(this).outerHeight(true);
        });
        
        // Add some buffer for smooth scrolling
        $track.css('height', (totalHeight + 100) + 'px');
        
        // Position the track to show current slide
        let position = 0;
        for (let i = 0; i < slick.currentSlide; i++) {
            position += $(slick.$slides[i]).outerHeight(true);
        }
        
        $track.css('transform', `translate3d(0, -${position}px, 0)`);
    }
    
    // Update vertical slider height to match content
    function updateVerticalSliderHeight(slick) {
        const $slider = $(slick.$slider || slick);
        const $currentSlide = $slider.find('.slick-slide.slick-active');
        
        if ($currentSlide.length) {
            // Reset heights
            $slider.find('.slick-list, .slick-track').css('max-height', '');
            
            // Get height of current slide content
            const slideHeight = $currentSlide.outerHeight(true);
            const viewportHeight = $(window).height();
            const maxHeight = Math.min(slideHeight, viewportHeight * 0.8); // Max 80% of viewport
            
            // Set heights
            $slider.css('height', maxHeight + 'px');
            $slider.find('.slick-list').css('height', maxHeight + 'px');
            
            // Force Slick to recalculate
            if (slick.slick) {
                slick.slick('setPosition');
            }
        }
    }
    
    // Update coverflow slide positions with 3D transforms
    function updateCoverflowSlides(slick) {
        const $slides = $(slick.$slides);
        const centerIndex = slick.currentSlide;
        const totalSlides = $slides.length;
        
        $slides.each(function(index) {
            const $slide = $(this);
            const $img = $slide.find('img');
            
            // Calculate distance from center (-2, -1, 0, 1, 2)
            let distance = index - centerIndex;
            
            // Handle infinite loop
            if (distance > totalSlides / 2) distance -= totalSlides;
            if (distance < -totalSlides / 2) distance += totalSlides;
            
            // Calculate rotation and translation based on distance
            const rotation = -distance * 30; // degrees
            const translateZ = -Math.abs(distance) * 50; // push back based on distance
            const translateX = distance * 80; // horizontal position
            const scale = 1 - Math.abs(distance) * 0.2; // scale down based on distance
            const opacity = 1 - Math.abs(distance) * 0.3; // fade out based on distance
            
            // Apply 3D transforms
            $img.css({
                'transform': `perspective(1000px) rotateY(${rotation}deg) translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale})`,
                'opacity': opacity,
                'z-index': 100 - Math.abs(distance) * 10,
                'transition': 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease'
            });
            
            // Center slide gets special treatment
            if (distance === 0) {
                $slide.addClass('slick-center');
                $img.css({
                    'transform': 'perspective(1000px) rotateY(0) translateZ(50px) scale(1.2)',
                    'opacity': 1,
                    'z-index': 200
                });
            } else {
                $slide.removeClass('slick-center');
            }
        });
    }
    
    // Slice Effect Helper Functions
    function initSliceEffect($slider) {
        $slider.find('.slick-slide').each(function() {
            const $slide = $(this);
            const $img = $slide.find('img');
            const imgSrc = $img.attr('src');
            
            // Create strip container if it doesn't exist
            if ($slide.find('.strip-container').length === 0) {
                $img.wrap('<div class="slider-image-container"></div>');
                $slide.find('.slider-image-container').append('<div class="strip-container"></div>');
                
                // Create strips (10 vertical strips)
                const stripContainer = $slide.find('.strip-container')[0];
                for (let i = 0; i < 10; i++) {
                    const strip = document.createElement('div');
                    strip.className = 'strip';
                    strip.style.backgroundImage = `url(${imgSrc})`;
                    strip.style.backgroundPosition = `${-i * 10}% 0`;
                    strip.style.width = '10%';
                    strip.style.left = `${i * 10}%`;
                    stripContainer.appendChild(strip);
                }
                
                // Hide original image
                $img.hide();
            }
        });
    }
    
    function prepareSliceIn($slide) {
        const $strips = $slide.find('.strip');
        $strips.css({
            'transform': 'translateY(-100%)',
            'opacity': '0'
        });
    }
    
    function animateSliceIn($slide) {
        const $strips = $slide.find('.strip');
        $strips.each(function(index) {
            $(this).css({
                'transition': `transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s, opacity 0.5s ease ${index * 0.05}s`,
                'transform': 'translateY(0)',
                'opacity': '1'
            });
        });
    }
    
    function animateSliceOut($slide) {
        const $strips = $slide.find('.strip');
        $strips.each(function(index) {
            $(this).css({
                'transition': `transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${(9 - index) * 0.05}s, opacity 0.5s ease ${(9 - index) * 0.05}s`,
                'transform': 'translateY(100%)',
                'opacity': '0'
            });
        });
    }

    // Initialize Ken Burns effect for a slide with dynamic animations
    function initKenBurnsEffect($slider, slick, $slide = null) {
        if (!$slide) {
            $slide = $(slick.$slides[slick.currentSlide]);
        }
        
        console.log('Initializing Ken Burns effect for slide', $slide.index());
        
        // Ensure slide has required structure and styles
        if (!$slide.hasClass('slick-slide')) {
            $slide.addClass('slick-slide');
        }
        
        // Set slide styles
        $slide.css({
            'position': 'relative',
            'width': '100%',
            'height': '100%',
            'min-height': '300px',
            'overflow': 'hidden',
            'background': '#000' // Add background for debugging
        });
        
        // Find or create image container
        let $imgContainer = $slide.find('.slider-image-container');
        if (!$imgContainer.length) {
            $imgContainer = $('<div class="slider-image-container"></div>').css({
                'position': 'absolute',
                'top': '0',
                'left': '0',
                'width': '100%',
                'height': '100%',
                'overflow': 'hidden',
                'z-index': '1'
            });
            $slide.prepend($imgContainer);
        }
        
        // Find or create image
        let $img = $imgContainer.find('.slider-image');
        if (!$img.length) {
            // Try to find an image in the slide
            let imgSrc = $slide.find('img').attr('src') || 
                        $slide.find('img').data('src') || 
                        $slide.data('src');
                        
            if (imgSrc) {
                $img = $('<img>', {
                    'class': 'slider-image',
                    'src': imgSrc,
                    'alt': $slide.find('img').attr('alt') || ''
                });
                $imgContainer.html($img);
            } else {
                console.warn('No image source found for slide');
                return; // Exit if no image source found
            }
        }
            
            if (imgSrc) {
                $img = $('<img>', {
                    'class': 'slider-image',
                    'src': imgSrc,
                    'alt': $slide.find('img').attr('alt') || ''
                });
                $imgContainer.html($img);
                console.log('Created new image element');
            } else {
                console.warn('Ken Burns: No image source found in slide');
                console.warn('Available images in slide:', $slide.find('img'));
                return;
            }
        }
        
        // Make sure the image is loaded before applying effects
        const imgElement = $img[0];
        
        // Set image styles
        $img.css({
            'position': 'absolute',
            'top': '0',
            'left': '0',
            'width': '100%',
            'height': '100%',
            'object-fit': 'cover',
            'opacity': '1',
            'visibility': 'visible',
            'display': 'block',
            'z-index': '1',
            'will-change': 'transform',
            'transform-origin': 'center center',
            'backface-visibility': 'hidden',
            'transform-style': 'preserve-3d',
            'animation-duration': '15s',
            'animation-timing-function': 'ease-in-out',
            'animation-iteration-count': 'infinite',
            'animation-fill-mode': 'both'
        });
        
        // Choose a random animation
        const kbAnimations = ['kenburns-zoom-in', 'kenburns-pan-left', 'kenburns-pan-right', 'kenburns-pan-up', 'kenburns-pan-down'];
        const kbAnimation = kbAnimations[Math.floor(Math.random() * kbAnimations.length)];
        
        // Remove any existing animation classes
        $img.removeClass('kenburns-zoom-in kenburns-pan-left kenburns-pan-right kenburns-pan-up kenburns-pan-down');
        
        // Add the selected animation class
        $img.addClass(kbAnimation);
        console.log('Applied animation:', kbAnimation);
        
        // Ensure container has proper styling
        $imgContainer.css({
            'position': 'relative',
            'width': '100%',
            'height': '100%',
            'overflow': 'hidden',
            'min-height': '300px',
            'display': 'block'
            });
            
            // Set image styles
            $img.css({
                'position': 'absolute',
                'top': '0',
                'left': '0',
                'width': '100%',
                'height': '100%',
                'object-fit': 'cover',
                'opacity': '1',
                'display': 'block',
                'visibility': 'visible',
                'will-change': 'transform',
                'transform-origin': 'center center',
                'backface-visibility': 'hidden',
                'transform-style': 'preserve-3d',
                'z-index': '1'
            });
            
            // Choose a random animation direction
            const animations = ['kenburns-zoom-in', 'kenburns-pan-left', 'kenburns-pan-right', 'kenburns-pan-up', 'kenburns-pan-down'];
            const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
            
            // Remove any existing animation classes
            $img.removeClass('kenburns-zoom-in kenburns-pan-left kenburns-pan-right kenburns-pan-up kenburns-pan-down');
            
            // Add the selected animation class
            setTimeout(() => {
                $img.addClass(randomAnimation);
                console.log('Applied animation class:', randomAnimation);
            }, 50);
        };
        
        // Start checking image load
        checkImageLoad();
        
        // Ensure container has proper positioning and overflow
        $imgContainer.css({
            'position': 'relative',
            'width': '100%',
            'height': '100%',
            'overflow': 'hidden',
            'min-height': '200px' // Ensure container has a minimum height
        });
        
        // Remove any existing animation classes
        $img.removeClass('kenburns-zoom-in kenburns-pan-left kenburns-pan-right kenburns-pan-up kenburns-pan-down');
        
        // Choose a random animation direction
        const animations = ['kenburns-zoom-in', 'kenburns-pan-left', 'kenburns-pan-right', 'kenburns-pan-up', 'kenburns-pan-down'];
        const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
        
        // Add the selected animation class after a small delay to ensure styles are applied
        setTimeout(() => {
            $img.addClass(randomAnimation);
            
            // Debug output
            if (window.console && window.console.log) {
                console.log('Ken Burns effect initialized for slide', $slide.index(), {
                    animation: randomAnimation
                });
            }
        }, 50);
    }
    
    // Initialize Zoom effect with smooth transitions
    function initZoomEffect($slider, slick, $slide = null) {
        if (!$slide) {
            $slide = $(slick.$slides[slick.currentSlide]);
        }
        
        const $img = $slide.find('img');
        if (!$img.length) return;
        
        // Reset any existing transitions
        $img.css({
            'transition': 'none',
            'transform': 'scale(1)'
        });
        
        // Force reflow
        void $img[0].offsetWidth;
        
        // Generate random zoom parameters for variety
        const startScale = 1.0 + (Math.random() * 0.05); // 1.0 to 1.05
        const endScale = 1.15 + (Math.random() * 0.1);   // 1.15 to 1.25
        const duration = 10 + (Math.random() * 5);       // 10-15 seconds
        
        // Apply initial styles
        $img.css({
            'transform': `scale(${startScale})`,
            'will-change': 'transform',
            'backface-visibility': 'hidden',
            'transform-style': 'preserve-3d'
        });
        
        // Force reflow
        void $img[0].offsetWidth;
        
        // Apply the zoom animation
        $img.css({
            'transform': `scale(${endScale})`,
            'transition': `transform ${duration}s cubic-bezier(0.2, 0.8, 0.2, 1)`
        });
    }

    // Initialize sliders when document is ready
    $(document).ready(function() {
        // Initialize sliders
        initializeSliders();
        
        // Re-initialize sliders after AJAX content load (for compatibility with page builders)
        $(document).ajaxComplete(initializeSliders);
    });
    
    // Make functions available globally
    window.imageSliderGallery = window.imageSliderGallery || {
        init: initializeSliders,
        updateCoverflow: updateCoverflowSlides
    };
    
})(jQuery);

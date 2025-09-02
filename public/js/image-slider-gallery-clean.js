(function($) {
    'use strict';

    // Default slider configuration
    const defaultConfig = {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: false,
        speed: 500,
        autoplay: false,
        autoplaySpeed: 3000,
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

    // Effect configurations
    const effectConfigs = {
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
                $(slick.$slider).addClass('effect-slide');
            }
        },
        // Slide (Vertical)
        'slide-vertical': {
            fade: false,
            vertical: true,
            verticalSwiping: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
            adaptiveHeight: true,
            swipe: true,
            touchMove: true,
            draggable: true,
            swipeToSlide: true,
            onInit: function(slick) {
                $(slick.$slider).addClass('effect-slide-vertical');
            }
        },
        // Slice / Strip effect
        'slice': {
            fade: false,
            speed: 1000,
            cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: false,
            adaptiveHeight: true,
            arrows: true,
            dots: true,
            useTransform: true,
            css: false, // Disable default Slick CSS transforms
            onInit: function(slick) {
                const $slider = $(slick.$slider);
                $slider.addClass('slice-effect');
                
                // Prepare all slides
                $slider.find('.slick-slide').each(function() {
                    prepareSlide($(this));
                });
                
                // Initialize first slide
                const $firstSlide = $slider.find('.slick-slide').eq(0);
                $firstSlide.addClass('slick-active');
                animateSlideIn($firstSlide);
            },
            beforeChange: function(event, slick, currentSlide, nextSlide) {
                const $slider = $(slick.$slider);
                const $currentSlide = $slider.find('.slick-slide').eq(currentSlide);
                const $nextSlide = $slider.find('.slick-slide').eq(nextSlide);
                
                // Prepare next slide
                prepareSlide($nextSlide);
                
                // Animate out current slide
                animateSlideOut($currentSlide);
                
                // Set up next slide
                $nextSlide.find('.slice-strip').css({
                    'opacity': '1',
                    'transform': (index) => index % 2 === 0 ? 'translateY(100%)' : 'translateY(-100%)'
                });
            },
            afterChange: function(slick, currentSlide) {
                const $slider = $(slick.$slider);
                const $currentSlide = $slider.find('.slick-slide').eq(currentSlide);
                
                // Animate in current slide
                animateSlideIn($currentSlide);
            },
            onDestroy: function() {
                // Clean up
                $(this).find('.slice-strips').contents().unwrap();
                $(this).find('img').show();
            }
        },
        'vertical-fade': {
            vertical: true,
            verticalSwiping: true,
            fade: false, // Disable fade for vertical slide
            speed: 800,
            cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: false,
            adaptiveHeight: true,
            touchThreshold: 15,
            waitForAnimate: true,
            useTransform: true,
            arrows: true,
            dots: true,
            rtl: false,
            css: false, // Disable default Slick CSS
            initialSlide: 0, // Start from the first slide
            // Initialize vertical slider
            onInit: function(slick) {
                const $slider = $(slick.$slider);
                $slider.addClass('vertical-slider');
                
                // Set initial styles for list
                $slider.find('.slick-list').css({
                    'height': '100%',
                    'max-height': '100%',
                    'overflow': 'hidden',
                    'transform': 'translate3d(0, 0, 0)',
                    'position': 'relative',
                    'display': 'block',
                    'backface-visibility': 'hidden',
                    'perspective': '1000px',
                    'transform-style': 'preserve-3d'
                });
                
                // Set track styles for vertical sliding (top to bottom)
                $slider.find('.slick-track').css({
                    'display': 'block !important',
                    'width': '100% !important',
                    'height': '100% !important',
                    'transform': 'translate3d(0, 0, 0) !important',
                    'transition': 'none !important',
                    'transform-style': 'flat',
                    'position': 'relative',
                    'top': '0',
                    'left': '0',
                    'margin': '0',
                    'padding': '0',
                    'backface-visibility': 'hidden',
                    'perspective': '1000px'
                });
                
                // Set initial position for slides (top to bottom)
                $slider.find('.slick-slide').each(function(index) {
                    const $slide = $(this);
                    $slide.css({
                        'position': 'absolute',
                        'top': '0',
                        'left': '0',
                        'width': '100%',
                        'height': '100%',
                        'margin': '0',
                        'padding': '0',
                        'transform': index === 0 ? 'translateY(0)' : 'translateY(100%)',
                        'opacity': index === 0 ? 1 : 0,
                        'transition': 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease'
                    });
                });
                
                // Style slides for vertical layout
                $slider.find('.slick-slide').css({
                    'display': 'block',
                    'float': 'none',
                    'width': '100% !important',
                    'height': '100% !important',
                    'margin': '0 !important',
                    'position': 'relative',
                    'top': 'auto',
                    'left': 'auto',
                    'opacity': 0,
                    'transition': 'opacity 0.3s ease',
                    'transform': 'none',
                    'backface-visibility': 'hidden'
                });
                
                $slider.find('.slick-slide.slick-active').css('opacity', 1);
                
                // Update slider height
                updateSliderHeight(slick);
                
                // Handle slide changes (top to bottom)
                $slider.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
                    const $currentSlide = $slider.find('.slick-slide[data-slick-index="' + currentSlide + '"]');
                    const $nextSlide = $slider.find('.slick-slide[data-slick-index="' + nextSlide + '"]');
                    
                    // Disable transitions temporarily
                    $currentSlide.add($nextSlide).css({
                        'transition': 'none',
                        'backface-visibility': 'hidden',
                        'transform-style': 'preserve-3d'
                    });
                    
                    // Position slides
                    $currentSlide.css({
                        'transform': 'translateY(0)',
                        'opacity': 1,
                        'z-index': 2,
                        'visibility': 'visible'
                    });
                    
                    $nextSlide.css({
                        'transform': 'translateY(100%)',
                        'opacity': 1,
                        'z-index': 1,
                        'display': 'block',
                        'visibility': 'visible'
                    });
                    
                    // Force reflow
                    $slider[0].offsetHeight;
                    
                    // Re-enable transitions with hardware acceleration
                    $currentSlide.add($nextSlide).css({
                        'transition': 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease',
                        'backface-visibility': 'hidden',
                        'transform-style': 'preserve-3d'
                    });
                    
                    // Animate slides
                    $currentSlide.css({
                        'transform': 'translateY(-100%)',
                        'opacity': 0
                    });
                    
                    $nextSlide.css({
                        'transform': 'translateY(0)',
                        'opacity': 1
                    });
                });
                
                // Set initial height
                updateSliderHeight(slick);
                
                // Handle window resize with debounce
                let resizeTimer;
                $(window).on('resize.verticalSlider', function() {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(function() {
                        updateSliderHeight(slick);
                        slick.slick('setPosition');
                    }, 250);
                });
            },
            onAfterChange: function() {
                const $slider = $(this);
                $slider.find('.slick-slide').css('opacity', '0');
                $slider.find('.slick-slide.slick-active').css('opacity', '1');
                updateSliderHeight(this);
            },
            onBeforeChange: function() {
                $(this).find('.slick-slide').css('opacity', '0');
            },
            onSetPosition: function() {
                const $slider = $(this);
                $slider.find('.slick-track').css({
                    'transform': 'translate3d(0, 0, 0) !important',
                    'width': '100% !important',
                    'max-height': '100% !important'
                });
                
                $slider.find('.slick-slide').css({
                    'width': '100% !important',
                    'height': 'auto !important'
                });
            },
            onDestroy: function() {
                $(window).off('resize.verticalSlider');
                $(this).find('.slick-slide').css({
                    'opacity': '1',
                    'width': '',
                    'height': ''
                });
            },
            onReInit: function(slick) {
                const $slider = $(slick.$slider);
                $slider.find('.slick-list, .slick-track').css({
                    'max-height': '100% !important',
                    'transform': 'translate3d(0, 0, 0) !important',
                    'width': '100% !important'
                });
                
                $slider.find('.slick-slide').css({
                    'width': '100% !important',
                    'height': 'auto !important'
                });
                
                // Show active slide
                $slider.find('.slick-slide').css('opacity', '0');
                $slider.find('.slick-slide.slick-active').css('opacity', '1');
                
                updateSliderHeight(slick);
            },
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        vertical: false,
                        verticalSwiping: false,
                        fade: true,
                        dots: true,
                        arrows: true
                    }
                }
            ]
        }
    };

    // Update slider height based on active slide
    function updateSliderHeight(slick) {
        const $slider = $(slick.$slider || slick);
        const $currentSlide = $slider.find('.slick-slide.slick-active');
        
        if ($currentSlide.length) {
            // First, temporarily make all slides visible to get accurate height
            $slider.find('.slick-slide').css({
                'position': 'absolute',
                'top': 0,
                'left': 0,
                'opacity': '0',
                'visibility': 'hidden',
                'height': 'auto',
                'width': '100%',
                'transform': 'none',
                'transition': 'none'
            });
            
            // Make current slide visible for measurement
            $currentSlide.css({
                'position': 'relative',
                'opacity': '1',
                'visibility': 'visible'
            });
            
            // Get the natural height of the current slide's content
            const slideContentHeight = $currentSlide.find('.slide-inner').outerHeight(true) || $currentSlide.outerHeight(true);
            const viewportHeight = $(window).height();
            const maxHeight = Math.min(slideContentHeight, viewportHeight * 0.8); // Max 80% of viewport
            
            // Set fixed heights for vertical slider
            if ($slider.hasClass('vertical-slider')) {
                // Set slider container height
                $slider.css({
                    'max-height': maxHeight + 'px',
                    'min-height': maxHeight + 'px',
                    'overflow': 'hidden',
                    'position': 'relative'
                });
                
                // Set list container height
                $slider.find('.slick-list').css({
                    // 'height': maxHeight + 'px',
                    'max-height': maxHeight + 'px',
                    'min-height': maxHeight + 'px',
                    'overflow': 'hidden',
                    'position': 'relative'
                });
                
                // Set track container
                $slider.find('.slick-track').css({
                    'height': maxHeight + 'px',
                    'transform': 'translate3d(0, 0, 0) !important',
                    'width': '100% !important',
                    'position': 'relative',
                    'top': 0,
                    'left': 0,
                    'display': 'block'
                });
                
                // Set slide dimensions
                $slider.find('.slick-slide').css({
                    'height': maxHeight + 'px',
                    'width': '100%',
                    'position': 'absolute',
                    'top': 0,
                    'left': 0,
                    'opacity': '0',
                    'transition': 'opacity 0.3s ease',
                    'transform': 'none',
                    'float': 'none',
                    'display': 'block'
                });
                
                // Make current slide visible
                $currentSlide.css('opacity', '1');
            } else {
                // Horizontal slider
                $slider.css('height', maxHeight + 'px');
                $slider.find('.slick-list').css('height', maxHeight + 'px');
            }
            
            // Force Slick to recalculate with fixed heights
            if (slick.slick) {
                // Prevent Slick from recalculating heights
                const originalSetPosition = slick.slick.setPosition;
                slick.slick.setPosition = function() {
                    // Temporarily disable transitions
                    $slider.find('.slick-track, .slick-slide').css('transition', 'none');
                    
                    // Call original setPosition
                    originalSetPosition.apply(this, arguments);
                    
                    // Re-enable transitions after a small delay
                    setTimeout(() => {
                        $slider.find('.slick-track, .slick-slide').css('transition', '');
                    }, 10);
                };

                // Force update
                setTimeout(() => {
                    // Set fixed dimensions before refresh
                    $slider.find('.slick-track').css({
                        'height': maxHeight + 'px !important',
                        'transform': 'translate3d(0, 0, 0) !important',
                        'width': '100% !important'
                    });
                    
                    // Force a reflow
                    $slider.hide().show(0);
                    
                    // Reset setPosition to original
                    setTimeout(() => {
                        if (slick.slick) {
                            slick.slick.setPosition = originalSetPosition;
                            slick.slick.setPosition();
                        }
                    }, 50);
                }, 10);
            }
        }
    }

    // Check if Slick Slider is loaded
    function isSlickLoaded() {
        return typeof $.fn.slick !== 'undefined';
    }

    // Initialize all sliders on the page
    function initializeSliders() {
        // Wait for Slick to be loaded
        if (!isSlickLoaded()) {
            console.error('Slick Slider is not loaded!');
            return;
        }

        // Initialize each slider
        $('.image-slider-gallery').each(function() {
            const $slider = $(this);
            const sliderId = $slider.attr('id') || 'slider-' + Math.random().toString(36).substr(2, 9);
            
            // Generate a default config if none is found
            let sliderConfig = window['sliderConfig_' + sliderId] || {
                autoplay: image_slider_gallery?.autoplay || false,
                autoplaySpeed: image_slider_gallery?.autoplay_speed || 3000,
                speed: image_slider_gallery?.speed || 500,
                effect: image_slider_gallery?.effect || 'slide',
                arrows: image_slider_gallery?.arrows !== false,
                dots: image_slider_gallery?.dots !== false,
                vertical: image_slider_gallery?.effect === 'vertical-fade',
                verticalSwiping: image_slider_gallery?.effect === 'vertical-fade',
                fade: image_slider_gallery?.effect !== 'vertical-fade',
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: false,
                adaptiveHeight: true,
                touchThreshold: 15,
                waitForAnimate: true,
                useTransform: true
            };

            // Merge with default config and effect config if specified
            let config = $.extend({}, defaultConfig, sliderConfig);
            
            // Apply effect config if specified
            if (sliderConfig.effect && effectConfigs[sliderConfig.effect]) {
                config = $.extend({}, config, effectConfigs[sliderConfig.effect]);
                
                // Force vertical mode for vertical-fade effect
                if (sliderConfig.effect === 'vertical-fade') {
                    config.vertical = true;
                    config.verticalSwiping = true;
                    config.fade = false;
                    $slider.addClass('vertical-slider');
                }
            }
            
            // Initialize Slick
            try {
                // Add necessary classes
                if (config.effect === 'vertical-fade') {
                    $slider.addClass('vertical-slider');
                    
                    // Wrap slides in a container for better control
                    $slider.find('.slick-slide').each(function() {
                        if (!$(this).find('.slide-inner').length) {
                            $(this).wrapInner('<div class="slide-inner"></div>');
                        }
                    });
                }
                
                $slider.slick(config);
                
                // Handle window resize with debounce
                let resizeTimer;
                $(window).on('resize.sliderResize', function() {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(function() {
                        if ($slider.hasClass('slick-initialized')) {
                            $slider.slick('resize');
                            if (config.effect === 'vertical-fade') {
                                updateSliderHeight($slider.slick('getSlick'));
                            }
                        }
                    }, 250);
                });
            } catch (error) {
                console.error('Error initializing slider:', error);
            }
        });
    }
    
    function animateSlideIn($slide) {
        $slide.find('.slice-strip').each(function(index) {
            const delay = index * 50;
            $(this).css({
                'transition': `transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, opacity 0.3s ease ${delay}ms`,
                'transform': 'translateY(0)',
                'opacity': '1'
            });
        });
    }
    
    function animateSlideOut($slide) {
        $slide.find('.slice-strip').each(function(index) {
            const delay = index * 30;
            const direction = index % 2 === 0 ? '-100%' : '100%';
            $(this).css({
                'transition': `transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, opacity 0.3s ease ${delay}ms`,
                'transform': `translateY(${direction})`,
                'opacity': '0'
            });
        });
    }

    // Initialize sliders when document is ready
    $(document).ready(function() {
        initializeSliders();
    });

})(jQuery);

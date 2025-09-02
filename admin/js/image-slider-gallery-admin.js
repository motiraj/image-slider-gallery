(function($) {
    'use strict';
    
    // Main plugin object
    var ImageSliderAdmin = {
        init: function() {
            console.log('Image Slider Admin JS loaded');
            this.pluginData = typeof image_slider_gallery_admin !== 'undefined' ? image_slider_gallery_admin : {};
            this.pluginName = this.pluginData.plugin_name || 'image_slider_gallery';
            this.debugMode = this.pluginData.debug || false;
            
            this.bindEvents();
            this.initSortable();
            this.checkEmptyState();
        },
        
        bindEvents: function() {
            var self = this;
            
            // Image upload
            $('.add-slider-image').on('click', $.proxy(this.handleImageUpload, this));
            
            // Image removal
            $(document).on('click', '.remove-image', $.proxy(this.handleRemoveImage, this));
            
            // Form submission
            $('form#image-slider-gallery-form').on('submit', $.proxy(this.handleFormSubmit, this));
            
            // Window load
            $(window).on('load', $.proxy(this.handleWindowLoad, this));
        },
        
        // Initialize sortable
        initSortable: function() {
            $('.slider-images-list').sortable({
                placeholder: 'ui-state-highlight',
                update: $.proxy(this.handleSortUpdate, this)
            }).disableSelection();
        },
        
        // Check for empty state
        checkEmptyState: function() {
            if ($('.slider-images-list li').length === 0) {
                $('.slider-images-list').addClass('is-empty');
            } else {
                $('.slider-images-list').removeClass('is-empty');
            }
        },
        
        // Log current image inputs
        logImageInputs: function() {
            var inputs = $('input[name^="' + this.pluginName + '[slider_images]"]');
            if (this.debugMode) {
                console.log('Current image inputs:', inputs.length);
                inputs.each(function(index) {
                    console.log('Input ' + index + ':', $(this).val());
                });
            }
        },
        
        // Event handlers
        handleSortUpdate: function() {
            if (this.debugMode) {
                console.log('Updating sort order...');
                this.logImageInputs();
            }
        },
        
        handleImageUpload: function(e) {
            e.preventDefault();
            if (this.debugMode) console.log('Add image button clicked');
            
            var self = this;
            var container = $('.slider-images-list');
            
            // Check if the media frame already exists
            if (typeof wp.media.frames.image_slider_frame !== 'undefined') {
                if (this.debugMode) console.log('Reusing existing media frame');
                wp.media.frames.image_slider_frame.open();
                return;
            }
            
            // Create a new media frame
            var frame = wp.media({
                title: 'Add Images to Slider',
                button: { text: 'Add to Slider' },
                multiple: true,
                library: { type: 'image' }
            });
            
            // When an image is selected
            frame.on('select', function() {
                if (self.debugMode) console.log('Image selected in media frame');
                
                var attachments = frame.state().get('selection').map(function(attachment) {
                    return attachment.toJSON();
                });
                
                if (self.debugMode) console.log('Selected attachments:', attachments);
                
                // Add each selected image
                attachments.forEach(function(attachment) {
                    if (attachment.type === 'image') {
                        var imageUrl = attachment.sizes && attachment.sizes.thumbnail ? 
                            attachment.sizes.thumbnail.url : 
                            attachment.url;
                        
                        if (self.debugMode) {
                            console.log('Adding image:', {
                                id: attachment.id,
                                url: imageUrl,
                                title: attachment.title
                            });
                        }
                        
                        // Create list item with image and hidden input
                        var item = $(
                            '<li class="image-preview ui-sortable-handle" data-id="' + attachment.id + '">' +
                            '<img src="' + imageUrl + '" alt="' + (attachment.alt || '') + '" />' +
                            '<a href="#" class="remove-image" title="Remove image">×</a>' +
                            '<input type="hidden" name="' + self.pluginName + '[slider_images][]" value="' + attachment.id + '">' +
                            '</li>'
                        );
                        
                        container.append(item);
                        if (self.debugMode) console.log('Image added to container with ID:', attachment.id);
                    }
                });
                
                // Update UI
                self.initSortable();
                self.checkEmptyState();
                self.logImageInputs();
                
                if (self.debugMode) {
                    console.log('Form data:', $('form#image-slider-gallery-form').serialize());
                }
            });
            
            // Store frame for reuse
            wp.media.frames.image_slider_frame = frame;
            frame.open();
        },
        
        handleRemoveImage: function(e) {
            e.preventDefault();
            if (this.debugMode) console.log('Remove image clicked');
            
            var listItem = $(e.target).closest('li');
            var imageId = listItem.data('id');
            
            if (this.debugMode) console.log('Removing image ID:', imageId);
            
            var self = this;
            listItem.fadeOut(300, function() {
                listItem.remove();
                self.checkEmptyState();
                if (self.debugMode) {
                    console.log('Updated container state. Total images:', $('.slider-images-list li').length);
                }
            });
        },
        
        handleFormSubmit: function(e) {
            if (this.debugMode) console.log('Form submitting...');
            
            // Log form data if in debug mode
            if (this.debugMode) {
                var formData = $(e.target).serializeArray();
                console.log('Form data array:', formData);
                
                var imageInputs = $('input[name^="' + this.pluginName + '[slider_images]"]');
                console.log('Found ' + imageInputs.length + ' image inputs in form');
                
                if (imageInputs.length === 0) {
                    console.warn('No image inputs found in form!');
                }
            }
            
            return true; // Allow form submission
        },
        
        handleWindowLoad: function() {
            if (this.debugMode) {
                console.log('Page fully loaded');
                this.logImageInputs();
                
                if ($('.slider-images-list li').length > 0) {
                    console.log('Found existing images in the list');
                } else {
                    console.log('No images found in the list');
                }
            }
        }
    };
    
    // Initialize the slider preview
    initSliderPreview: function() {
        var self = this;
        var $preview = $('.slider-preview');
        
        // Only initialize if preview exists
        if ($preview.length === 0) return;
        
        // Get current settings
        var autoplay = $('input[name="' + this.pluginName + '[autoplay]"]:checked').val() === 'yes';
        var effect = $('select[name="' + this.pluginName + '[effect]"]').val();
        var speed = parseInt($('input[name="' + this.pluginName + '[speed]"]').val()) || 500;
        var autoplaySpeed = parseInt($('input[name="' + this.pluginName + '[autoplay_speed]"]').val()) || 3000;
        
        // Initialize Slick slider if not already initialized
        if (typeof $.fn.slick === 'function' && !$preview.hasClass('slick-initialized')) {
            $preview.slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                fade: effect === 'fade',
                vertical: effect === 'slide-vertical',
                verticalSwiping: effect === 'slide-vertical',
                speed: speed,
                autoplay: autoplay,
                autoplaySpeed: autoplaySpeed,
                dots: true,
                arrows: true,
                adaptiveHeight: true
            });
        }
        
        // Update effect when changed
        $('select[name="' + this.pluginName + '[effect]"]').on('change', function() {
            var newEffect = $(this).val();
            
            // Update Slick options
            $preview.slick('slickSetOption', 'fade', newEffect === 'fade', true);
            $preview.slick('slickSetOption', 'vertical', newEffect === 'slide-vertical', true);
            $preview.slick('slickSetOption', 'verticalSwiping', newEffect === 'slide-vertical', true);
            
            // Force refresh
            $preview.slick('slickSetOption', null, null, true);
        });
    },
    
    // Initialize the plugin when the DOM is ready
    $(document).ready(function() {
        ImageSliderAdmin.init();
        ImageSliderAdmin.initSliderPreview();
    });
    
})(jQuery);

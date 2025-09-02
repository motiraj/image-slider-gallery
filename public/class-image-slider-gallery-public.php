<?php
/**
 * The public-facing functionality of the plugin.
 */
class Image_Slider_Gallery_Public {

    private $plugin_name;
    private $version;

    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }

    public function enqueue_styles() {
        if (!is_admin()) {
            wp_enqueue_style(
                'slick-carousel', 
                'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css', 
                array(), 
                '1.8.1'
            );
            
            wp_enqueue_style(
                'slick-carousel-theme', 
                'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css', 
                array('slick-carousel'), 
                '1.8.1'
            );
            
            wp_enqueue_style(
                $this->plugin_name, 
                plugin_dir_url(__FILE__) . 'css/image-slider-gallery-public.css', 
                array('slick-carousel'), 
                $this->version, 
                'all'
            );
        }
    }

    public function enqueue_scripts() {
        if (!is_admin()) {
            // Enqueue Slick Carousel JS
            wp_enqueue_script('slick-carousel', 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js', array('jquery'), '1.8.1', true);
            
            // Enqueue Slick Lightbox if needed
            wp_enqueue_script('slick-lightbox', 'https://cdn.jsdelivr.net/npm/slick-lightbox@0.2.12/dist/slick-lightbox.min.js', array('jquery', 'slick-carousel'), '0.2.12', true);
            
            // Get slider settings
            $options = get_option('image-slider-gallery', array(
                'slider_size' => 'full-width',
                'custom_width' => '1920',
                'custom_height' => '1080'
            ));

            // Define slider dimensions based on settings
            $dimensions = array(
                'full-width' => array('width' => 1920, 'height' => 1080),
                'content' => array('width' => 1200, 'height' => 600),
                'thumbnail' => array('width' => 800, 'height' => 600),
                'mobile' => array('width' => 375, 'height' => 667),
                'custom' => array(
                    'width' => isset($options['custom_width']) ? intval($options['custom_width']) : 1920,
                    'height' => isset($options['custom_height']) ? intval($options['custom_height']) : 1080
                )
            );

            $slider_size = isset($options['slider_size']) ? $options['slider_size'] : 'full-width';
            $slider_dimensions = isset($dimensions[$slider_size]) ? $dimensions[$slider_size] : $dimensions['full-width'];

            // Enqueue public script - using clean version without vertical slider code
            wp_enqueue_script(
                $this->plugin_name,
                plugin_dir_url(__FILE__) . 'js/image-slider-gallery-clean.js',
                array('jquery', 'slick-carousel'),
                $this->version,
                true
            );

            // Get plugin options
            $options = get_option('image-slider-gallery', array());
            
            // Debug: Log the raw options
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Raw plugin options: ' . print_r($options, true));
            }
            
            // Get autoplay setting (default to false if not set)
            $autoplay = isset($options['autoplay']) ? $options['autoplay'] === 'yes' : false;
            $autoplay_speed = isset($options['autoplay_speed']) ? intval($options['autoplay_speed']) : 3000;
            
            // Prepare settings
            $settings = array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('image_slider_gallery_nonce'),
                'debug' => defined('WP_DEBUG') && WP_DEBUG,
                'dimensions' => $slider_dimensions,
                'size' => $slider_size,
                'effect' => isset($options['effect']) ? $options['effect'] : 'fade',
                'speed' => isset($options['speed']) ? intval($options['speed']) : 500,
                'autoplay' => $autoplay,
                'autoplay_speed' => $autoplay_speed,
                'arrows' => !isset($options['arrows']) || $options['arrows'] === 'yes',
                'dots' => !isset($options['dots']) || $options['dots'] === 'yes'
            );
            
            // Debug output
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Slider Settings: ' . print_r($settings, true));
            }
            
            // Localize script with all settings
            wp_localize_script(
                $this->plugin_name,
                'image_slider_gallery',
                $settings
            );

            // Add inline styles for effects
            $custom_css = ".image-slider-gallery {
                    position: relative;
                    margin: 0 auto;
                    max-width: 100%;
                    overflow: hidden;
                }
                
                .image-slider-gallery .slick-slide {
                    position: relative;
                    outline: none;
                }
                
                .image-slider-gallery .slick-slide img {
                    width: 100%;
                    height: auto;
                    display: block;
                    margin: 0 auto;
                }
                
                /* Navigation Arrows */
                .slick-prev, .slick-next {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 10;
                    background: rgba(0,0,0,0.5);
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    cursor: pointer;
                    border-radius: 4px;
                }
                
                .slick-prev {
                    left: 15px;
                }
                
                .slick-next {
                    right: 15px;
                }
                
                /* Dots */
                .slick-dots {
                    position: absolute;
                    bottom: 20px;
                    width: 100%;
                    padding: 0;
                    margin: 0;
                    list-style: none;
                    text-align: center;
                }
                
                .slick-dots li {
                    display: inline-block;
                    margin: 0 5px;
                }
                
                .slick-dots li button {
                    font-size: 0;
                    width: 12px;
                    height: 12px;
                    padding: 0;
                    border: 2px solid white;
                    border-radius: 50%;
                    background: transparent;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: all 0.3s ease;
                }
                
                .slick-dots li.slick-active button {
                    background: white;
                    opacity: 1;
                }
                
                /* Effect-specific styles */
                .effect-zoom .slick-slide:not(.slick-active) img {
                    transform: scale(0.9);
                    opacity: 0.7 !important;
                    transition: all 0.3s ease;
                }
                
                .effect-zoom .slick-active img {
                    transform: scale(1);
                    opacity: 1 !important;
                }
                
                .effect-parallax .slick-slide {
                    height: 500px;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                }
                
                .effect-parallax .slick-slide img {
                    display: none !important;
                }
                
                .effect-bounce .slick-slide {
                    transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
                }
                
                .effect-flip .slick-slide {
                    perspective: 1000px;
                }
                
                .effect-flip .slick-slide > div {
                    transition: transform 0.8s;
                    transform-style: preserve-3d;
                }
                
                .effect-flip .slick-slide.slick-active > div {
                    transform: rotateY(0deg);
                }
                
                .effect-flip .slick-slide:not(.slick-active) > div {
                    transform: rotateY(180deg);
                }
                
                /* Ensure slides maintain proper dimensions */
                .slick-slide {
                    height: auto;
                    min-height: 200px;
                }
                
                /* Fix for slide transitions */
                .slick-slide:not(.slick-active) {
                    opacity: 0.7;
                    transition: opacity 0.3s ease;
                }
                
                .slick-slide.slick-active {
                    opacity: 1;
                    z-index: 1;
                }
                
                /* Fix for slider container */
                .image-slider-gallery {
                    position: relative;
                    margin: 0 auto;
                    overflow: hidden;
                    transform: translate3d(0,0,0);
                    -webkit-transform: translate3d(0,0,0);
                }
                
                @media (max-width: 768px) {
                    .effect-parallax .slick-slide {
                        height: 300px;
                    }
                    
                    .slick-dots {
                        bottom: 10px;
                    }
                }";
            
            wp_add_inline_style($this->plugin_name, $custom_css);
        }
    }

    public function render_slider($atts) {
        // Get plugin options
        $options = get_option($this->plugin_name, array());
        
        // Get slider size settings
        $slider_size = isset($options['slider_size']) ? $options['slider_size'] : 'full-width';
        $custom_width = isset($options['custom_width']) ? intval($options['custom_width']) : 1920;
        $custom_height = isset($options['custom_height']) ? intval($options['custom_height']) : 1080;
        
        // Set dimensions based on slider size
        $dimensions = array(
            'full-width' => array('width' => '100%', 'height' => '56.25vw', 'max-height' => '80vh'),
            'content' => array('width' => '1200px', 'height' => '600px'),
            'thumbnail' => array('width' => '800px', 'height' => '600px'),
            'mobile' => array('width' => '375px', 'height' => '667px'),
            'custom' => array('width' => $custom_width . 'px', 'height' => $custom_height . 'px')
        );
        
        $slider_dimensions = isset($dimensions[$slider_size]) ? $dimensions[$slider_size] : $dimensions['full-width'];
        
        // Default values
        $defaults = array(
            'autoplay' => isset($options['autoplay']) && $options['autoplay'] === 'yes' ? 'true' : 'false',
            'interval' => isset($options['autoplay_speed']) ? intval($options['autoplay_speed']) : 5000,
            'arrows' => 'true',
            'dots' => 'true',
            'size' => $slider_size,
            'effect' => isset($options['effect']) ? $options['effect'] : 'fade',
            'speed' => isset($options['speed']) ? intval($options['speed']) : 500,
        );
        
        // Merge with default values
        $atts = shortcode_atts($defaults, $atts, 'image_slider_gallery');
        
        // Debug shortcode attributes
        error_log('Shortcode attributes: ' . print_r($atts, true));
        
        // Get and validate image IDs
        $image_ids = isset($options['slider_images']) ? (array) $options['slider_images'] : array();
        $image_ids = array_filter(array_map('absint', $image_ids));
        
        // Debug information
        error_log('Image Slider Debug - Options: ' . print_r($options, true));
        error_log('Image Slider Debug - Image IDs: ' . print_r($image_ids, true));
        
        // Check if we have any valid images
        if (empty($image_ids)) {
            if (current_user_can('edit_theme_options')) {
                return sprintf(
                    '<div class="image-slider-notice">%s <a href="%s">%s</a></div>',
                    esc_html__('No images found in the slider. Please add images from the', 'image-slider-gallery'),
                    esc_url(admin_url('admin.php?page=image-slider-gallery')),
                    esc_html__('Image Slider settings page', 'image-slider-gallery')
                );
            }
            return '';
        }
        
        ob_start();
        ?>
        <div class="image-slider-gallery-wrapper" style="max-width: <?php echo esc_attr($slider_dimensions['width']); ?>; margin: 0 auto;">
            <?php if (!empty($image_ids)) : ?>
                <div class="image-slider-gallery size-<?php echo esc_attr($slider_size); ?> effect-<?php echo esc_attr($atts['effect']); ?>" 
                     data-autoplay="<?php echo esc_attr($atts['autoplay']); ?>" 
                     data-interval="<?php echo esc_attr($atts['interval']); ?>"
                     data-arrows="<?php echo esc_attr($atts['arrows']); ?>"
                     data-dots="<?php echo esc_attr($atts['dots']); ?>"
                     data-effect="<?php echo esc_attr($atts['effect']); ?>"
                     data-speed="<?php echo esc_attr($atts['speed']); ?>"
                     style="width: 100%; height: <?php echo esc_attr($slider_dimensions['height']); ?>; max-width: 100%; overflow: hidden; position: relative;">
                    
                    <?php foreach ($image_ids as $image_id) : ?>
                        <?php 
                        // Get image data
                        $image_data = wp_get_attachment_image_src($image_id, $atts['size']);
                        if (!$image_data) continue;
                        
                        $image_url = $image_data[0];
                        $image_alt = get_post_meta($image_id, '_wp_attachment_image_alt', true);
                        $image_caption = wp_get_attachment_caption($image_id);
                        ?>
                        
                        <div class="slider-item" style="height: 100%;">
                            <div class="slider-image-container" style="width: 100%; height: 100%;">
                                <?php
                                // Get appropriate image size based on slider size
                                $image_size = 'full';
                                if ($slider_size === 'thumbnail') {
                                    $image_size = 'large';
                                } elseif ($slider_size === 'mobile') {
                                    $image_size = 'medium_large';
                                }
                                
                                $image_src = wp_get_attachment_image_src($image_id, $image_size);
                                $image_srcset = wp_get_attachment_image_srcset($image_id, $image_size);
                                $sizes = '(max-width: 100%) 100vw, 100%';
                                
                                if (!$image_src) continue;
                                
                                // For parallax effect, we need multiple layers
                                if ($atts['effect'] === 'parallax') {
                                    // Background layer (moves slower)
                                    echo '<div class="slider-parallax-layer" data-depth="0.1">';
                                    echo '<img src="' . esc_url($image_src[0]) . '" ';
                                    echo 'alt="' . esc_attr($image_alt) . '" ';
                                    echo 'class="slider-image" loading="lazy" ';
                                    echo 'width="' . esc_attr($image_src[1]) . '" ';
                                    echo 'height="' . esc_attr($image_src[2]) . '" ';
                                    echo 'style="width: 110%; height: 110%; object-fit: cover; position: absolute; top: -5%; left: -5%;">';
                                    echo '</div>';
                                    
                                    // Foreground layer (moves faster)
                                    echo '<div class="slider-parallax-layer" data-depth="0.3">';
                                    echo '<img src="' . esc_url($image_src[0]) . '" ';
                                    echo 'alt="' . esc_attr($image_alt) . '" ';
                                    echo 'class="slider-image" loading="lazy" ';
                                    echo 'width="' . esc_attr($image_src[1]) . '" ';
                                    echo 'height="' . esc_attr($image_src[2]) . '" ';
                                    echo 'style="width: 100%; height: 100%; object-fit: cover; position: relative; z-index: 2;">';
                                    echo '</div>';
                                } else {
                                    // Regular image for other effects
                                    echo '<img src="' . esc_url($image_src[0]) . '" ';
                                    echo 'alt="' . esc_attr($image_alt) . '" ';
                                    echo 'class="slider-image" loading="lazy" ';
                                    echo 'width="' . esc_attr($image_src[1]) . '" ';
                                    echo 'height="' . esc_attr($image_src[2]) . '" ';
                                    echo 'style="width: 100%; height: 100%; object-fit: cover;"';
                                    if ($image_srcset) {
                                        echo ' srcset="' . esc_attr($image_srcset) . '" sizes="' . esc_attr($sizes) . '"';
                                    }
                                    echo '>';
                                }
                                ?>
                            </div>
                            
                            <?php if (!empty($image_caption)) : ?>
                                <div class="slider-caption">
                                    <?php echo esc_html($image_caption); ?>
                                </div>
                            <?php endif; ?>
                        </div>
                        
                    <?php endforeach; ?>
                    
                </div>
                
                <?php 
                // Debug output for admins
                if (current_user_can('edit_theme_options')) : 
                    $debug_info = sprintf(
                        '<!-- Image Slider Debug: %d images found. Shortcode: [image_slider_gallery] -->',
                        count($image_ids)
                    );
                    echo $debug_info;
                    error_log($debug_info);
                endif; 
                ?>
                
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }
}

<?php
/**
 * The admin-specific functionality of the plugin.
 */
class Image_Slider_Gallery_Admin {

    private $plugin_name;
    private $version;

    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }

    public function enqueue_styles($hook) {
        if ('toplevel_page_image-slider-gallery' !== $hook) {
            return;
        }
        
        wp_enqueue_style(
            $this->plugin_name, 
            plugin_dir_url(__FILE__) . 'css/image-slider-gallery-admin.css', 
            array(), 
            $this->version, 
            'all'
        );
    }

    public function enqueue_scripts() {
        // Only load on our plugin page
        $screen = get_current_screen();
        if (!isset($screen->id) || strpos($screen->id, $this->plugin_name) === false) {
            return;
        }

        // Enqueue WordPress media scripts
        wp_enqueue_media();

        // Enqueue admin styles
        wp_enqueue_style(
            $this->plugin_name . '-admin',
            plugin_dir_url(__FILE__) . 'css/image-slider-gallery-admin.css',
            array(),
            $this->version,
            'all'
        );

        // Enqueue admin scripts
        wp_enqueue_script(
            $this->plugin_name . '-admin',
            plugin_dir_url(__FILE__) . 'js/image-slider-gallery-admin.js',
            array('jquery', 'jquery-ui-sortable'),
            $this->version,
            true
        );

        // Get current options for debugging
        $options = get_option($this->plugin_name, array());
        $images = isset($options['slider_images']) ? (array) $options['slider_images'] : array();

        // Localize script with plugin data
        wp_localize_script(
            $this->plugin_name . '-admin',
            'image_slider_gallery_admin',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('image_slider_gallery_nonce'),
                'plugin_name' => $this->plugin_name, // Ensure this matches the PHP plugin name
                'images' => $images,
                'debug' => defined('WP_DEBUG') && WP_DEBUG,
                'i18n' => array(
                    'remove' => __('Remove', 'image-slider-gallery'),
                    'add_images' => __('Add Images', 'image-slider-gallery'),
                    'no_images' => __('No images added yet.', 'image-slider-gallery')
                )
            )
        );
        
        // Add inline script to help with debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            wp_add_inline_script(
                $this->plugin_name . '-admin',
                'console.log("Image Slider Admin Script Initialized");'
            );
        }
    }

    public function add_plugin_admin_menu() {
        add_menu_page(
            'Image Slider Gallery',
            'Image Slider',
            'manage_options',
            $this->plugin_name,
            array($this, 'display_plugin_setup_page'),
            'dashicons-format-gallery',
            26
        );
    }

    public function register_settings() {
        // Register the main settings
        register_setting(
            $this->plugin_name, // option_group
            $this->plugin_name, // option_name
            array(
                'type' => 'array',
                'sanitize_callback' => array($this, 'validate'),
                'default' => array(
                    'slider_images' => array(),
                    'autoplay' => 'no',
                    'effect' => 'fade',
                    'speed' => '500',
                    'autoplay_speed' => '3000',
                    'slider_size' => 'full-width',
                    'custom_width' => '1920',
                    'custom_height' => '1080'
                )
            )
        );

        // Add settings section
        add_settings_section(
            $this->plugin_name . '_settings_section',
            __('Slider Settings', 'image-slider-gallery'),
            array($this, 'settings_section_callback'),
            $this->plugin_name
        );

        // Add settings fields
        add_settings_field(
            'slider_images',
            __('Slider Images', 'image-slider-gallery'),
            array($this, 'slider_images_callback'),
            $this->plugin_name,
            $this->plugin_name . '_settings_section',
            array(
                'label_for' => 'slider_images',
                'class' => 'slider-images-row'
            )
        );

        add_settings_field(
            'autoplay',
            __('Autoplay', 'image-slider-gallery'),
            array($this, 'autoplay_callback'),
            $this->plugin_name,
            $this->plugin_name . '_settings_section',
            array(
                'label_for' => 'autoplay',
                'class' => 'autoplay-row'
            )
        );

        // Add effect type field
        add_settings_field(
            'effect',
            __('Transition Effect', 'image-slider-gallery'),
            array($this, 'effect_callback'),
            $this->plugin_name,
            $this->plugin_name . '_settings_section',
            array(
                'label_for' => 'effect',
                'class' => 'effect-row'
            )
        );

        // Add transition speed field
        add_settings_field(
            'speed',
            __('Transition Speed (ms)', 'image-slider-gallery'),
            array($this, 'speed_callback'),
            $this->plugin_name,
            $this->plugin_name . '_settings_section',
            array(
                'label_for' => 'speed',
                'class' => 'speed-row'
            )
        );

        // Add autoplay speed field
        add_settings_field(
            'autoplay_speed',
            __('Autoplay Speed (ms)', 'image-slider-gallery'),
            array($this, 'autoplay_speed_callback'),
            $this->plugin_name,
            $this->plugin_name . '_settings_section',
            array(
                'label_for' => 'autoplay_speed',
                'class' => 'autoplay-speed-row'
            )
        );

        // Add slider size field
        add_settings_field(
            'slider_size',
            __('Slider Size', 'image-slider-gallery'),
            array($this, 'slider_size_callback'),
            $this->plugin_name,
            $this->plugin_name . '_settings_section',
            array(
                'label_for' => 'slider_size',
                'class' => 'slider-size-row'
            )
        );

        // Add custom dimensions fields
        add_settings_field(
            'custom_dimensions',
            __('Custom Dimensions', 'image-slider-gallery'),
            array($this, 'custom_dimensions_callback'),
            $this->plugin_name,
            $this->plugin_name . '_settings_section',
            array(
                'class' => 'custom-dimensions-row'
            )
        );
    }

    public function settings_section_callback() {
        echo '<p>Configure the slider settings for your image slider gallery. Choose from various transition effects and customize their behavior.</p>';
    }
    
    /**
     * Render the autoplay setting field
     */
    public function autoplay_callback() {
        $options = get_option($this->plugin_name, array('autoplay' => 'no'));
        $autoplay = isset($options['autoplay']) ? $options['autoplay'] : 'no';
        ?>
        <label class="switch">
            <input type="checkbox" 
                   id="autoplay" 
                   name="<?php echo esc_attr($this->plugin_name); ?>[autoplay]" 
                   value="yes" 
                   <?php checked($autoplay, 'yes'); ?>>
            <span class="slider round"></span>
        </label>
        <p class="description">
            <?php esc_html_e('Enable autoplay for the slider', 'image-slider-gallery'); ?>
        </p>
        <?php
    }

    /**
     * Render the effect type setting field
     */
    public function effect_callback() {
        $options = get_option($this->plugin_name, array('effect' => 'fade'));
        $effect = isset($options['effect']) ? $options['effect'] : 'fade';
        
        $effects = array(
            'fade' => __('Fade / Dissolve', 'image-slider-gallery'),
            'slide' => __('Slide (Horizontal)', 'image-slider-gallery'),
            'slide-vertical' => __('Slide (Vertical)', 'image-slider-gallery'),
            'zoom' => __('Zoom / Ken Burns', 'image-slider-gallery'),
            'cube' => __('3D Cube', 'image-slider-gallery'),
            'flip' => __('Flip / Card', 'image-slider-gallery'),
            'coverflow' => __('Coverflow', 'image-slider-gallery'),
            'parallax' => __('Parallax', 'image-slider-gallery'),
            'slice' => __('Slice / Strip', 'image-slider-gallery'),
            'bounce' => __('Bounce / Elastic', 'image-slider-gallery')
        );
        ?>
        <select id="effect" name="<?php echo esc_attr($this->plugin_name); ?>[effect]" class="regular-text">
            <?php foreach ($effects as $value => $label) : ?>
                <option value="<?php echo esc_attr($value); ?>" <?php selected($effect, $value); ?>>
                    <?php echo esc_html($label); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <p class="description">
            <?php esc_html_e('Choose the transition effect between slides', 'image-slider-gallery'); ?>
        </p>
        <div class="effect-descriptions">
            <p><strong>Fade / Dissolve:</strong> Smooth cross-fade between images</p>
            <p><strong>Slide:</strong> Horizontal or vertical sliding transitions</p>
            <p><strong>Zoom / Ken Burns:</strong> Cinematic zoom and pan effects</p>
            <p><strong>3D Cube:</strong> Rotating cube effect</p>
            <p><strong>Flip / Card:</strong> Card-flipping animation</p>
            <p><strong>Coverflow:</strong> Gallery-style angled previews</p>
            <p><strong>Parallax:</strong> Depth effect with layered movement</p>
            <p><strong>Slice / Strip:</strong> Image splits into strips during transition</p>
            <p><strong>Bounce / Elastic:</strong> Playful, springy transitions</p>
        </div>
        <?php
    }

    /**
     * Render the transition speed setting field
     */
    public function speed_callback() {
        $options = get_option($this->plugin_name, array('speed' => '500'));
        $speed = isset($options['speed']) ? $options['speed'] : '500';
        ?>
        <input type="number" 
               id="speed" 
               name="<?php echo esc_attr($this->plugin_name); ?>[speed]" 
               value="<?php echo esc_attr($speed); ?>" 
               min="0" 
               step="50" 
               class="small-text"> ms
        <p class="description">
            <?php esc_html_e('Duration of the transition effect in milliseconds', 'image-slider-gallery'); ?>
        </p>
        <?php
    }

    /**
     * Render the autoplay speed setting field
     */
    public function autoplay_speed_callback() {
        $options = get_option($this->plugin_name, array('autoplay_speed' => '3000'));
        $autoplay_speed = isset($options['autoplay_speed']) ? $options['autoplay_speed'] : '3000';
        ?>
        <input type="number" 
               id="autoplay_speed" 
               name="<?php echo esc_attr($this->plugin_name); ?>[autoplay_speed]" 
               value="<?php echo esc_attr($autoplay_speed); ?>" 
               min="1000" 
               step="500" 
               class="small-text"> ms
        <p class="description">
            <?php esc_html_e('Delay between transitions in autoplay mode', 'image-slider-gallery'); ?>
        </p>
        <?php
    }

    /**
     * Render the slider size setting field
     */
    public function slider_size_callback() {
        $options = get_option($this->plugin_name, array('slider_size' => 'full-width'));
        $slider_size = isset($options['slider_size']) ? $options['slider_size'] : 'full-width';
        $sizes = array(
            'full-width'  => __('Full-Width (1920×1080px) - Hero Slider', 'image-slider-gallery'),
            'content'     => __('Content Width (1200×600px) - Inner Pages', 'image-slider-gallery'),
            'thumbnail'   => __('Thumbnail (800×600px) - Gallery', 'image-slider-gallery'),
            'mobile'      => __('Mobile (375×667px) - Mobile Optimized', 'image-slider-gallery'),
            'custom'      => __('Custom Size', 'image-slider-gallery')
        );
        ?>
        <select id="slider_size" name="<?php echo $this->plugin_name; ?>[slider_size]" class="slider-size-select">
            <?php foreach ($sizes as $value => $label) : ?>
                <option value="<?php echo esc_attr($value); ?>" <?php selected($slider_size, $value); ?>>
                    <?php echo esc_html($label); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <p class="description"><?php _e('Select the size preset for your slider', 'image-slider-gallery'); ?></p>
        <?php
    }

    /**
     * Render the custom dimensions fields
     */
    public function custom_dimensions_callback() {
        $options = get_option($this->plugin_name, array(
            'custom_width' => '1920',
            'custom_height' => '1080'
        ));
        $custom_width = isset($options['custom_width']) ? $options['custom_width'] : '1920';
        $custom_height = isset($options['custom_height']) ? $options['custom_height'] : '1080';
        $slider_size = isset($options['slider_size']) ? $options['slider_size'] : 'full-width';
        $display_style = ($slider_size === 'custom') ? '' : 'style="display: none;"';
        ?>
        <div id="custom-dimensions-fields" <?php echo $display_style; ?>>
            <input type="number" id="custom_width" 
                   name="<?php echo $this->plugin_name; ?>[custom_width]" 
                   value="<?php echo esc_attr($custom_width); ?>" 
                   min="100" step="1" placeholder="Width">
            <span> × </span>
            <input type="number" id="custom_height" 
                   name="<?php echo $this->plugin_name; ?>[custom_height]" 
                   value="<?php echo esc_attr($custom_height); ?>" 
                   min="100" step="1" placeholder="Height">
            <span>px</span>
            <p class="description"><?php _e('Enter custom width and height in pixels', 'image-slider-gallery'); ?></p>
        </div>
        <script>
        jQuery(document).ready(function($) {
            $('.slider-size-select').on('change', function() {
                if ($(this).val() === 'custom') {
                    $('#custom-dimensions-fields').show();
                } else {
                    $('#custom-dimensions-fields').hide();
                    // Set default values based on selection
                    var sizes = {
                        'full-width': {width: 1920, height: 1080},
                        'content': {width: 1200, height: 600},
                        'thumbnail': {width: 800, height: 600},
                        'mobile': {width: 375, height: 667}
                    };
                    var selected = $(this).val();
                    if (sizes[selected]) {
                        $('#custom_width').val(sizes[selected].width);
                        $('#custom_height').val(sizes[selected].height);
                    }
                }
            });
        });
        </script>
        <?php
    }

    public function slider_images_callback() {
        $options = get_option($this->plugin_name);
        $images = isset($options['slider_images']) ? (array) $options['slider_images'] : array();
        
        // Debug info for admins
        // if (current_user_can('manage_options') && (defined('WP_DEBUG') && WP_DEBUG)) {
        //     echo '<div class="notice notice-info">';
        //     echo '<p><strong>Debug Info:</strong> Found ' . count($images) . ' images in slider (Plugin: ' . esc_html($this->plugin_name) . ').</p>';
            
        //     // Check if options are being saved
        //     if (isset($_POST['option_page']) && $_POST['option_page'] === $this->plugin_name) {
        //         echo '<div class="notice notice-info">';
        //         echo '<p><strong>Form Data:</strong></p>';
        //         echo '<pre>' . esc_html(print_r($_POST, true)) . '</pre>';
        //         echo '</div>';
        //     }
            
        //     if (!empty($images)) {
        //         echo '<p>Image IDs: ' . esc_html(implode(', ', $images)) . '</p>';
                
        //         // Verify each image exists
        //         $missing = array();
        //         foreach ($images as $img_id) {
        //             if (!wp_get_attachment_url($img_id)) {
        //                 $missing[] = $img_id;
        //             }
        //         }
                
        //         if (!empty($missing)) {
        //             echo '<div class="notice notice-warning">';
        //             echo '<p><strong>Warning:</strong> The following image IDs could not be found: ' . esc_html(implode(', ', $missing)) . '</p>';
        //             echo '<p>These images will be automatically removed when you save the settings.</p>';
        //             echo '</div>';
        //         }
        //     }
            
        //     echo '<pre>Options: ' . esc_html(print_r($options, true)) . '</pre>';
        //     echo '<pre>POST Data: ' . esc_html(print_r($_POST, true)) . '</pre>';
        //     echo '</div>';
        // }
        
        ?>
        <div class="slider-images-container">
            <ul class="slider-images-list <?php echo empty($images) ? 'is-empty' : ''; ?>">
                <?php 
                if (!empty($images)) : 
                    foreach ($images as $index => $image_id) : 
                        $image_url = wp_get_attachment_image_url($image_id, 'thumbnail');
                        if (!$image_url) continue;
                        
                        // Get image details for debugging
                        $image_details = wp_get_attachment_metadata($image_id);
                        $image_title = get_the_title($image_id);
                ?>
                        <li class="image-preview ui-sortable-handle" data-id="<?php echo esc_attr($image_id); ?>">
                            <img src="<?php echo esc_url($image_url); ?>" 
                                 alt="<?php echo esc_attr($image_title); ?>"
                                 title="<?php echo esc_attr($image_title); ?> (ID: <?php echo esc_attr($image_id); ?>)" />
                            <a href="#" class="remove-image" title="<?php esc_attr_e('Remove image', 'image-slider-gallery'); ?>">×</a>
                            <input type="hidden" 
                                   name="<?php echo esc_attr($this->plugin_name); ?>[slider_images][]" 
                                   value="<?php echo esc_attr($image_id); ?>">
                        </li>
                <?php 
                    endforeach; 
                endif; 
                ?>
            </ul>
            <p class="description">
                <?php esc_html_e('Drag and drop to reorder images. Click the × to remove an image.', 'image-slider-gallery'); ?>
            </p>
            <button type="button" class="button button-primary add-slider-image">
                <?php esc_html_e('Add Images', 'image-slider-gallery'); ?>
            </button>
            
            <?php if (empty($images)) : ?>
                <div class="no-images-notice">
                    <p><?php esc_html_e('No images have been added to the slider yet.', 'image-slider-gallery'); ?></p>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }

    public function slider_autoplay_callback() {
        $options = get_option($this->plugin_name);
        $autoplay = isset($options['autoplay']) ? $options['autoplay'] : 'yes';
        ?>
        <label>
            <input type="checkbox" name="<?php echo $this->plugin_name; ?>[autoplay]" value="yes" <?php checked($autoplay, 'yes'); ?>>
            Enable autoplay
        </label>
        <?php
    }

    public function display_plugin_setup_page() {
        include_once 'partials/image-slider-gallery-admin-display.php';
    }
    
    /**
     * Validate slider images
     *
     * @param mixed $value The input value to validate
     * @return bool Whether the value is valid
     */
    private function validate_slider_image($value) {
        // Only keep non-zero, numeric values where the attachment exists
        return !empty($value) && is_numeric($value) && wp_get_attachment_url($value);
    }
    
    /**
     * Validate plugin settings
     *
     * @param array $input The input array to validate
     * @return array Validated input
     */
    public function validate($input) {
        $valid = array();
        
        // Validate slider images
        if (isset($input['slider_images']) && is_array($input['slider_images'])) {
            $valid['slider_images'] = array_filter($input['slider_images'], array($this, 'validate_slider_image'));
            error_log('Image Slider - Processed ' . count($valid['slider_images']) . ' valid images');
        }
        
        // Validate autoplay setting
        $valid['autoplay'] = (isset($input['autoplay']) && $input['autoplay'] === 'yes') ? 'yes' : 'no';
        
        // Validate effect
        $valid_effects = array('fade', 'slide', 'slide-vertical', 'zoom', 'cube', 'flip', 'coverflow', 'parallax', 'slice', 'bounce');
        error_log('Effect setting before validation: ' . (isset($input['effect']) ? $input['effect'] : 'not set'));
        $valid['effect'] = (isset($input['effect']) && in_array($input['effect'], $valid_effects, true)) 
            ? $input['effect'] 
            : 'fade';
        error_log('Effect setting after validation: ' . $valid['effect']);
            
        // Validate speeds (must be positive integers)
        $valid['speed'] = isset($input['speed']) ? absint($input['speed']) : 500;
        $valid['autoplay_speed'] = isset($input['autoplay_speed']) ? absint($input['autoplay_speed']) : 3000;
        
        // Validate slider size
        $valid_sizes = array('full-width', 'content', 'thumbnail', 'mobile', 'custom');
        $valid['slider_size'] = (isset($input['slider_size']) && in_array($input['slider_size'], $valid_sizes))
            ? $input['slider_size']
            : 'full-width';
            
        // Debug log the slider size
        error_log('Slider size setting - Input: ' . (isset($input['slider_size']) ? $input['slider_size'] : 'not set') . 
                 ', Validated: ' . $valid['slider_size']);
                 
        // Validate custom dimensions if needed
        if ($valid['slider_size'] === 'custom') {
            $valid['custom_width'] = isset($input['custom_width']) ? absint($input['custom_width']) : 1920;
            $valid['custom_height'] = isset($input['custom_height']) ? absint($input['custom_height']) : 1080;
            error_log('Custom dimensions - Width: ' . $valid['custom_width'] . ', Height: ' . $valid['custom_height']);
        }
            
        // Validate custom dimensions
        $valid['custom_width'] = isset($input['custom_width']) ? absint($input['custom_width']) : 1920;
        $valid['custom_height'] = isset($input['custom_height']) ? absint($input['custom_height']) : 1080;
        
        // Debug: Log the final validated data
        error_log('Image Slider - Validation result: ' . print_r($valid, true));
        
        // Merge with existing options to preserve any fields not being updated
        $current_options = get_option($this->plugin_name, array());
        return array_merge($current_options, $valid);
    }
}

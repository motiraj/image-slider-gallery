<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <?php 
    // Check if settings were updated
    if (isset($_GET['settings-updated'])) : 
        $message = $_GET['settings-updated'] === 'true' 
            ? __('Settings saved successfully!', 'image-slider-gallery')
            : '';
        
        if (!empty($message)) : ?>
            <div class="notice notice-success is-dismissible">
                <p><?php echo esc_html($message); ?></p>
            </div>
        <?php endif; 
    endif; 
    ?>
    
    <div class="image-slider-settings">
        <form id="image-slider-gallery-form" method="post" action="options.php" enctype="multipart/form-data">
            <?php
            // Output security fields
            settings_fields($this->plugin_name);
            
            // Output settings sections and their fields
            do_settings_sections($this->plugin_name);
            
            // Output save settings button with a custom class
            submit_button(
                __('Save Settings', 'image-slider-gallery'), 
                'primary', 
                'submit', 
                true,
                array('id' => 'save-slider-settings')
            );
            ?>
            
            <!-- Hidden nonce for AJAX requests -->
            <?php wp_nonce_field('image_slider_gallery_save', 'image_slider_gallery_nonce'); ?>
            
            <!-- Hidden field to track if this is our form -->
            <input type="hidden" name="is_image_slider_gallery" value="1">
        </form>
        
        <div class="shortcode-usage" style="margin-top: 30px; padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px;">
            <h3><?php esc_html_e('Shortcode Usage', 'image-slider-gallery'); ?></h3>
            <p><?php esc_html_e('Use the following shortcode to display the slider:', 'image-slider-gallery'); ?></p>
            <code style="display: block; background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 3px;">[image_slider_gallery]</code>
            
            <h4><?php esc_html_e('Available Attributes:', 'image-slider-gallery'); ?></h4>
            <ul style="list-style-type: disc; margin-left: 20px;">
                <li><code>autoplay</code> - <?php esc_html_e('Enable/disable autoplay (true/false)', 'image-slider-gallery'); ?></li>
                <li><code>interval</code> - <?php esc_html_e('Autoplay interval in milliseconds (default: 5000)', 'image-slider-gallery'); ?></li>
                <li><code>arrows</code> - <?php esc_html_e('Show/hide navigation arrows (true/false)', 'image-slider-gallery'); ?></li>
                <li><code>dots</code> - <?php esc_html_e('Show/hide navigation dots (true/false)', 'image-slider-gallery'); ?></li>
                <li><code>effect</code> - <?php esc_html_e('Transition effect: "fade" or "slide"', 'image-slider-gallery'); ?></li>
                <li><code>speed</code> - <?php esc_html_e('Transition speed in milliseconds (default: 500)', 'image-slider-gallery'); ?></li>
            </ul>
            
            <p><strong><?php esc_html_e('Example:', 'image-slider-gallery'); ?></strong></p>
            <code style="display: block; background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 3px;">[image_slider_gallery autoplay="true" interval="3000" effect="fade"]</code>
        </div>
    </div>
</div>

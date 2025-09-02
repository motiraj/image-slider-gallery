<?php
/**
 * Plugin Name: Image Slider Gallery
 * Plugin URI: https://example.com/plugins/image-slider-gallery
 * Description: A simple and responsive image slider gallery for WordPress.
 * Version: 1.0.0
 * Author: Moti Raj Gautam
 * Author URI: https://example.com
 * Text Domain: image-slider-gallery
 * Domain Path: /languages
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Define plugin constants
define('ISG_VERSION', '1.0.0');
define('ISG_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ISG_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include required files
require_once ISG_PLUGIN_DIR . 'includes/class-image-slider-gallery-loader.php';
require_once ISG_PLUGIN_DIR . 'includes/class-image-slider-gallery.php';
require_once ISG_PLUGIN_DIR . 'admin/class-image-slider-gallery-admin.php';
require_once ISG_PLUGIN_DIR . 'public/class-image-slider-gallery-public.php';

// Initialize the plugin
function run_image_slider_gallery() {
    $plugin = new Image_Slider_Gallery();
    $plugin->run();
}

// Initialize the plugin
add_action('plugins_loaded', 'run_image_slider_gallery');

<?php
/**
 * The core plugin class.
 */
class Image_Slider_Gallery {

    protected $loader;
    protected $plugin_name;
    protected $version;

    public function __construct() {
        if (defined('ISG_VERSION')) {
            $this->version = ISG_VERSION;
        } else {
            $this->version = '1.0.0';
        }
        $this->plugin_name = 'image-slider-gallery';

        $this->load_dependencies();
        $this->set_locale();
        $this->define_admin_hooks();
        $this->define_public_hooks();
    }

    private function load_dependencies() {
        $this->loader = new Image_Slider_Gallery_Loader();
    }

    private function set_locale() {
        load_plugin_textdomain(
            $this->plugin_name,
            false,
            dirname(dirname(plugin_basename(__FILE__))) . '/languages/'
        );
    }

    private function define_admin_hooks() {
        $plugin_admin = new Image_Slider_Gallery_Admin($this->get_plugin_name(), $this->get_version());
        $this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_styles');
        $this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts');
        $this->loader->add_action('admin_menu', $plugin_admin, 'add_plugin_admin_menu');
        $this->loader->add_action('admin_init', $plugin_admin, 'register_settings');
    }

    private function define_public_hooks() {
        $plugin_public = new Image_Slider_Gallery_Public($this->get_plugin_name(), $this->get_version());
        $this->loader->add_action('wp_enqueue_scripts', $plugin_public, 'enqueue_styles');
        $this->loader->add_action('wp_enqueue_scripts', $plugin_public, 'enqueue_scripts');
        $this->loader->add_shortcode('image_slider_gallery', $plugin_public, 'render_slider');
    }

    public function run() {
        $this->loader->run();
    }

    public function get_plugin_name() {
        return $this->plugin_name;
    }

    public function get_loader() {
        return $this->loader;
    }

    public function get_version() {
        return $this->version;
    }
}

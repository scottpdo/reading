<?php get_header(); ?>

<?php if (have_posts()) {
    while (have_posts()) {
        the_post();

        post_script_tag(array(
            'showLink' => true
        ));
    }
}
?>

<div id="archive"></div>

<?php get_footer(); ?>

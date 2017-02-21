<?php get_header(); ?>

<?php if (have_posts()) {
    while (have_posts()) {
        the_post();

        post_script_tag(array(
            'excerpt' => true,
            'showLink' => true
        ));
    }
}
?>

<div id="archive"></div>

<?php get_footer(); ?>

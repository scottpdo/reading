<?php get_header(); ?>

<?php if (have_posts()) {
    while (have_posts()) {
        the_post(); ?>

        <script>
        if (!window.POSTS) window.POSTS = [];
        POSTS.push({
            id: '<?php the_ID(); ?>',
            permalink: '<?php the_permalink(); ?>',
            title: '<?php the_title(); ?>'
        });
        </script>
    <?php }
}
?>

<div id="archive"></div>

<?php get_footer(); ?>

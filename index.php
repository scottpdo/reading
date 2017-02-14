<?php get_header(); ?>

<?php if (have_posts()) {
    while (have_posts()) {
        the_post();

        $content = get_the_content();
        $content = wpautop($content, "");
        $content = str_replace("\n", "", $content);
        ?>

        <script>
        if (!window.POSTS) window.POSTS = [];
        POSTS.push({
            id: '<?php the_ID(); ?>',
            permalink: '<?php the_permalink(); ?>',
            title: '<?php the_title(); ?>',
            content: '<?= $content; ?>',
            opts: {
                showLink: true
            }
        });
        </script>
    <?php }
}
?>

<div id="archive"></div>

<?php get_footer(); ?>

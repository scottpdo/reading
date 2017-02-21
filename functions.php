<?php

register_nav_menu('primary', 'Primary');

function reading_filter_text($text) {
    $text = wpautop($text, "");
    $text = str_replace("\n", "", $text);
    return $text;
}

function post_script_tag($opts = array()) {
    $content = get_the_content();
    $content = reading_filter_text($content);

    $excerpt = reading_filter_text(get_the_excerpt());
    ?>

    <script>
    if (!window.POSTS) window.POSTS = [];
    POSTS.push({
        id: '<?php the_ID(); ?>',
        permalink: '<?php the_permalink(); ?>',
        editLink: '<?= get_edit_post_link(get_the_ID(), ""); ?>',
        title: '<?php the_title(); ?>',
        author: <?= json_encode(get_post_meta(get_the_ID(), 'author')); ?>,
        year: <?= json_encode(intval(get_post_meta(get_the_ID(), 'year', true))); ?>,
        content: '<?= $content; ?>',
        excerpt: '<?= $excerpt; ?>',
        tags: <?= json_encode(get_post_meta(get_the_ID(), 'tags')); ?>,
        opts: <?= json_encode($opts); ?>
    });
    </script>
<?php
}

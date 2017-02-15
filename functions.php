<?php
function check_logged_in() {
    if (!is_user_logged_in() ) {
        echo "</body></html>";
        exit;
    }
}

function post_script_tag($opts = array()) {
    $content = get_the_content();
    $content = wpautop($content, "");
    $content = str_replace("\n", "", $content);
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
        tags: <?= json_encode(get_post_meta(get_the_ID(), 'tags')); ?>,
        opts: <?= json_encode($opts); ?>
    });
    </script>
<?php
}

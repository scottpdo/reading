<?php
if (isset($_GET['request']) && $_GET['request'] == 'json') {
    echo json_encode(array(
        'hi'
    ));
    exit;
}

get_header();
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
        showLink: false
    }
});
</script>

<p><a href="<?= home_url(); ?>">Home</a></p>

<div id="archive"></div>

<?php get_footer(); ?>

<?php
if (isset($_GET['request']) && $_GET['request'] == 'json') {
    echo json_encode(array(
        'hi'
    ));
    exit;
}

get_header();
the_post();

post_script_tag(array(
    'showLink' => false
));

?>

<p><a href="<?= home_url(); ?>">Home</a></p>

<div id="archive"></div>

<?php get_footer(); ?>

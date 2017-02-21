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

<div id="archive"></div>

<?php get_footer(); ?>

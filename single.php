<?php
if (isset($_GET['request'] && $_GET['request'] == 'json')) {
    echo json_encode(array(
        'hi'
    ));
    exit;
}

get_header();

?>

<h1><?php the_title(); ?></h1>
<?php the_content(); ?>

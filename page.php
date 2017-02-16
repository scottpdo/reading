<?php
get_header();
the_post();

?>

<p><a href="<?= home_url(); ?>">Home</a></p>

<h1><?php the_title(); ?></h1>

<?php the_content(); ?>

<?php get_footer(); ?>

<?php
get_header();
the_post();

?>

<p><a href="<?= home_url(); ?>">Home</a></p>

<?php the_content(); ?>

<?php get_footer(); ?>

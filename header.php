<!doctype html>

<html lang="en">

<head>
    <link rel="stylesheet" href="<?php echo bloginfo('stylesheet_url'); ?>">

    <script>
    window.CONFIG = {
        user: {
            loggedIn: '<?= is_user_logged_in(); ?>'
        }
    };
    </script>
</head>

<body>
    <div id="main">

    <h1><a href="<?php echo home_url(); ?>"><?php bloginfo('site_title'); ?></a></h1>
    <?php if (is_home()) : wp_nav_menu('Primary'); endif; ?>

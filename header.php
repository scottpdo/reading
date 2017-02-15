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

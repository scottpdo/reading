<?php
function check_logged_in() {
    if (!is_user_logged_in() ) {
        echo "</body></html>";
        exit;
    }
}

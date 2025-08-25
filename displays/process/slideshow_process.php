<?php
// Check if the 'access_granted' cookie isn't set or is incorrect
if (!isset($_COOKIE['access_granted']) || $_COOKIE['access_granted'] !== '1') {
    // Figure out where we’re trying to go (this page), so we can redirect back
    $currentPage = basename(__FILE__);
    // OR if the file can appear in subfolders, do something like:
    // $currentPage = $_SERVER['REQUEST_URI'];

    // Send them to login.php with a redirect parameter
    header('Location: login.php?redirect=' . urlencode($currentPage));
    exit;
}
?>

<?php
// process/slideshow_process.php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die("Invalid request method.");
}

if (!isset($_POST['slideshows'])) {
    die("No slideshow data provided.");
}

$slideshows = $_POST['slideshows'];
$data = array("slideshows" => array_values($slideshows)); // re-index the array

$file = '../json/slideshows.json';

if (file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT))) {
    echo "Slideshows updated successfully!";
} else {
    echo "Failed to update slideshows.";
}
?>

<?php
// process/group_process.php

// Set header for plain text response.
header("Content-Type: text/plain");

// Only process POST requests.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['jsonData'])) {
        $jsonData = $_POST['jsonData'];
        if (json_decode($jsonData) === null) {
            echo "Invalid JSON data. Please check your input.";
            exit;
        }
        // Update the displays.json file.
        $file = '../json/displays.json';
        if (file_put_contents($file, $jsonData)) {
            echo "Display groups updated successfully!";
        } else {
            echo "Failed to update display groups.";
        }
        exit;
    }
}

echo "No data received.";
?>

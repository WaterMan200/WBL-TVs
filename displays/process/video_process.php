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
// video_process.php

// Define the path to the videos JSON file.
$json_file = '../json/videos.json';

// Load current data.
$data = json_decode(file_get_contents($json_file), true);
if (!$data) {
  die("Error loading videos data.");
}

$action = $_POST['action'] ?? '';

switch ($action) {
  case 'add_category':
    $new_category = trim($_POST['new_category'] ?? '');
    if ($new_category && !in_array($new_category, $data['categories'])) {
      $data['categories'][] = $new_category;
    }
    break;

  case 'delete_category':
    $category = trim($_POST['category'] ?? '');
    // Remove the category.
    $data['categories'] = array_values(array_filter($data['categories'], function ($cat) use ($category) {
      return $cat !== $category;
    }));
    // Optionally, update videos that belong to this category.
    foreach ($data['videos'] as &$video) {
      if ($video['category'] === $category) {
        $video['category'] = ''; // or assign a default category
      }
    }
    break;

  case 'add_video':
    $title = trim($_POST['title'] ?? '');
    $url = trim($_POST['url'] ?? '');
    $category = trim($_POST['category'] ?? '');
    if ($title && $url && $category) {
      $data['videos'][] = [
        'title'    => $title,
        'url'      => $url,
        'category' => $category
      ];
    }
    break;

  case 'edit_video':
    $index = $_POST['video_index'] ?? null;
    $title = trim($_POST['title'] ?? '');
    $url = trim($_POST['url'] ?? '');
    $category = trim($_POST['category'] ?? '');
    if ($index !== null && isset($data['videos'][$index])) {
      $data['videos'][$index]['title'] = $title;
      $data['videos'][$index]['url'] = $url;
      $data['videos'][$index]['category'] = $category;
    }
    break;

  case 'delete_video':
    $index = $_POST['video_index'] ?? null;
    if ($index !== null && isset($data['videos'][$index])) {
      array_splice($data['videos'], $index, 1);
    }
    break;

  default:
    // Handle any unknown actions.
    break;
}

// Save updated data back to the JSON file.
file_put_contents($json_file, json_encode($data, JSON_PRETTY_PRINT));

// Redirect back to the setup page.
header("Location: ../video_setup.php");
exit();
?>

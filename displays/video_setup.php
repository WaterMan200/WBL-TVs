<?php
// video_setup.php

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


// Load the videos JSON data.
$json_file = 'json/videos.json';
$data = json_decode(file_get_contents($json_file), true);
if (!$data) {
  die("Error loading videos data.");
}
$categories = $data['categories'];
$videos = $data['videos'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Video Management</title>
  <style>
    /* Basic styling for the modal */
    #videoPreviewModal {
      display: none;
      position: fixed;
      z-index: 9999;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    }
    #videoPreviewModal .modal-content {
      position: relative;
      width: 80%;
      max-width: 800px;
      margin: 5% auto;
      background: #fff;
      padding: 20px;
    }
    #videoPreviewModal button {
      position: absolute;
      top: 10px;
      right: 10px;
    }
  </style>
</head>
<body>
  <h1>Manage Videos and Categories</h1>
	<nav style="background: #eee; padding: 10px; text-align: center; margin-bottom: 20px;">
	  <a href="display_setup.php" style="margin: 0 15px; text-decoration: none; font-weight: bold; color: #333;">Display Setup</a>
	  <a href="video_setup.php" style="margin: 0 15px; text-decoration: none; font-weight: bold; color: #333;">Video Setup</a>
	  <a href="slideshow_setup.php" style="margin: 0 15px; text-decoration: none; font-weight: bold; color: #333;">Slideshow Setup</a>
	  <a href="image_setup.php" style="margin: 0 15px; text-decoration: none; font-weight: bold; color: #333;">Image Setup</a>
	</nav>
  <h2>Categories</h2>
  <ul>
    <?php foreach ($categories as $cat): ?>
      <li>
        <?php echo htmlspecialchars($cat); ?>
        <!-- Delete category form -->
        <form action="process/video_process.php" method="post" style="display:inline;">
          <input type="hidden" name="action" value="delete_category">
          <input type="hidden" name="category" value="<?php echo htmlspecialchars($cat); ?>">
          <button type="submit">Delete</button>
        </form>
      </li>
    <?php endforeach; ?>
  </ul>

  <h3>Add New Category</h3>
  <form action="process/video_process.php" method="post">
    <input type="hidden" name="action" value="add_category">
    <input type="text" name="new_category" required>
    <button type="submit">Add Category</button>
  </form>

  <h2>Videos</h2>
  <table border="1" cellpadding="5">
    <tr>
      <th>Title</th>
      <th>URL</th>
      <th>Category</th>
      <th>Actions</th>
    </tr>
    <?php foreach ($videos as $index => $video): ?>
    <tr>
      <td><?php echo htmlspecialchars($video['title']); ?></td>
      <td>
        <a href="#" onclick="previewVideo('<?php echo htmlspecialchars($video['url']); ?>'); return false;">
          <?php echo htmlspecialchars($video['url']); ?>
        </a>
      </td>
      <td><?php echo htmlspecialchars($video['category']); ?></td>
      <td>
        <!-- Delete video form -->
        <form action="process/video_process.php" method="post" style="display:inline;">
          <input type="hidden" name="action" value="delete_video">
          <input type="hidden" name="video_index" value="<?php echo $index; ?>">
          <button type="submit">Delete</button>
        </form>
        <!-- Edit video form -->
        <form action="process/video_process.php" method="post" style="display:inline;">
          <input type="hidden" name="action" value="edit_video">
          <input type="hidden" name="video_index" value="<?php echo $index; ?>">
          Title: <input type="text" name="title" value="<?php echo htmlspecialchars($video['title']); ?>">
          URL: <input type="text" name="url" value="<?php echo htmlspecialchars($video['url']); ?>">
          Category: 
          <select name="category">
            <?php foreach ($categories as $cat): ?>
              <option value="<?php echo htmlspecialchars($cat); ?>" <?php if ($cat == $video['category']) echo "selected"; ?>>
                <?php echo htmlspecialchars($cat); ?>
              </option>
            <?php endforeach; ?>
          </select>
          <button type="submit">Update</button>
        </form>
      </td>
    </tr>
    <?php endforeach; ?>
  </table>

  <h3>Add New Video</h3>
  <form action="process/video_process.php" method="post">
    <input type="hidden" name="action" value="add_video">
    Title: <input type="text" name="title" required><br>
    URL: <input type="text" name="url" required><br>
    Category: 
    <select name="category" required>
      <?php foreach ($categories as $cat): ?>
         <option value="<?php echo htmlspecialchars($cat); ?>">
           <?php echo htmlspecialchars($cat); ?>
         </option>
      <?php endforeach; ?>
    </select>
    <button type="submit">Add Video</button>
  </form>

  <!-- Modal for video preview -->
  <div id="videoPreviewModal">
    <div class="modal-content">
      <button onclick="closeModal()">Close</button>
      <div id="videoPreviewContent">
        <!-- Video iframe gets injected here -->
      </div>
    </div>
  </div>

  <script>
    // Function to open the preview modal and load the video
    function previewVideo(url) {
      // Convert the video URL to an embeddable URL if it’s a YouTube link.
      if (url.includes("watch?v=")) {
        url = url.replace("watch?v=", "embed/");
      } else if (url.includes("youtu.be/")) {
        const videoId = url.split("/").pop();
        url = "https://www.youtube.com/embed/" + videoId;
      }
      
      // Insert an iframe with autoplay enabled into the modal content.
      document.getElementById('videoPreviewContent').innerHTML = 
        `<iframe src="${url}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="width:100%; height:450px;"></iframe>`;
      
      // Show the modal.
      document.getElementById('videoPreviewModal').style.display = "block";
    }

    // Function to close the modal
    function closeModal() {
      document.getElementById('videoPreviewModal').style.display = "none";
      // Clear the iframe content to stop the video playback.
      document.getElementById('videoPreviewContent').innerHTML = "";
    }
  </script>

</body>
</html>

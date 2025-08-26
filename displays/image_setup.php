<?php
// =======================
// image_setup.php
// =======================

// Authentication check
if (!isset($_COOKIE['access_granted']) || $_COOKIE['access_granted'] !== '1') {
    $currentPage = basename(__FILE__);
    header('Location: login.php?redirect=' . urlencode($currentPage));
    exit;
}

// Load existing images & categories from JSON
$jsonFile   = __DIR__ . '/json/images.json';
$data       = file_exists($jsonFile) ? json_decode(file_get_contents($jsonFile), true) : [];
$categories = $data['categories'] ?? [];
$images     = $data['images']     ?? [];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Image Setup</title>
  <style>
    .edit-form { background: #f9f9f9; padding: 10px; margin-top: 5px; }
  </style>
</head>
<body>
  <h1>Manage Images &amp; Categories</h1>
  <nav>
    <a href="display_setup.php">Display Setup</a> |
    <a href="video_setup.php">Video Setup</a> |
    <a href="slideshow_setup.php">Slideshow Setup</a> |
    <strong>Image Setup</strong>
  </nav>

  <h2>Categories</h2>
  <ul>
    <?php foreach ($categories as $cat): ?>
      <li>
        <?= htmlspecialchars($cat) ?>
        <form action="process/image_process.php" method="post" style="display:inline;">
          <input type="hidden" name="action" value="delete_category">
          <input type="hidden" name="category" value="<?= htmlspecialchars($cat) ?>">
          <button type="submit">Delete</button>
        </form>
      </li>
    <?php endforeach; ?>
  </ul>
  <form action="process/image_process.php" method="post">
    <input type="hidden" name="action" value="add_category">
    <input type="text" name="new_category" placeholder="New category" required>
    <button type="submit">Add Category</button>
  </form>

  <h2>Existing Images</h2>
  <table border="1" cellpadding="5">
    <tr>
      <th>Title</th>
      <th>Description</th>
      <th>Preview</th>
      <th>Category</th>
      <th>Actions</th>
    </tr>
    <?php foreach ($images as $idx => $img): ?>
      <tr>
        <td><?= htmlspecialchars($img['title'] ?? basename($img['url'])) ?></td>
        <td><?= htmlspecialchars($img['description'] ?? '') ?></td>
        <td><img src="<?= htmlspecialchars($img['url']) ?>" style="max-width:100px;"></td>
        <td><?= htmlspecialchars($img['category'] ?? '') ?></td>
        <td>
          <form action="process/image_process.php" method="post" style="display:inline;">
            <input type="hidden" name="action" value="delete_image">
            <input type="hidden" name="image_index" value="<?= $idx ?>">
            <button type="submit">Delete</button>
          </form>

          <button type="button" onclick="document.getElementById('editForm<?= $idx ?>').style.display='block'">Edit</button>
          <form id="editForm<?= $idx ?>" action="process/image_process.php" method="post" enctype="multipart/form-data" class="edit-form" style="display:none;">
            <input type="hidden" name="action" value="edit_image">
            <input type="hidden" name="image_index" value="<?= $idx ?>">

            <label>
              Title:<br>
              <input type="text" name="title" value="<?= htmlspecialchars($img['title'] ?? '') ?>" required>
            </label><br>

            <label>
              Description:<br>
              <textarea name="description"><?= htmlspecialchars($img['description'] ?? '') ?></textarea>
            </label><br>

            <label>
              Category:<br>
              <select name="category" required>
                <?php foreach ($categories as $cat): ?>
                  <option value="<?= htmlspecialchars($cat) ?>" <?php if ($cat === ($img['category'] ?? '')) echo 'selected'; ?>>
                    <?= htmlspecialchars($cat) ?>
                  </option>
                <?php endforeach; ?>
              </select>
            </label><br>

            <label>
              Replace File:<br>
              <input type="file" name="image_file" accept="image/*">
            </label><br><br>

            <button type="submit">Update</button>
            <button type="button" onclick="document.getElementById('editForm<?= $idx ?>').style.display='none'">Cancel</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
  </table>

  <h2>Upload Images</h2>
  <form action="process/image_process.php" method="post" enctype="multipart/form-data">
    <input type="hidden" name="action" value="upload_images">
    <input type="file" name="images[]" accept="image/*" multiple required><br><br>
    <label>
      Category:
      <select name="category" required>
        <option value="">-- Select Category --</option>
        <?php foreach ($categories as $cat): ?>
          <option value="<?= htmlspecialchars($cat) ?>"><?= htmlspecialchars($cat) ?></option>
        <?php endforeach; ?>
      </select>
    </label><br><br>
    <button type="submit">Upload</button>
  </form>
</body>
</html>

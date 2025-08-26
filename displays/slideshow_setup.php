<?php
// slideshow_setup.php

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

// Load slideshows JSON data.
$json_file = 'json/slideshows.json';
$jsonContent = file_get_contents($json_file);
$data = json_decode($jsonContent, true);
if ($data === null) {
    $data = ["slideshows" => []];
}
$slideshows = $data['slideshows'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Slideshow Setup</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #eee; }
        .navbar {
            background: #eee;
            padding: 10px;
            text-align: center;
            margin-bottom: 20px;
        }
        .navbar a {
            margin: 0 15px;
            text-decoration: none;
            font-weight: bold;
            color: #333;
        }
        button { margin: 5px; }
    </style>
</head>
<body>
    <div class="navbar">
        <a href="display_setup.php">Display Setup</a>
        <a href="video_setup.php">Video Setup</a>
        <a href="slideshow_setup.php">Slideshow Setup</a>
        <a href="image_setup.php">Image Setup</a>
    </div>
    <h1>Slideshow Setup</h1>
    <form action="process/slideshow_process.php" method="post" id="slideshowForm">
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>URL</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="slideshowsTable">
                <?php foreach ($slideshows as $index => $slide): ?>
                <tr>
                    <td>
                        <input type="text" name="slideshows[<?php echo $index; ?>][title]" value="<?php echo htmlspecialchars($slide['title']); ?>">
                    </td>
                    <td>
                        <input type="text" name="slideshows[<?php echo $index; ?>][url]" value="<?php echo htmlspecialchars($slide['url']); ?>">
                    </td>
                    <td>
                        <input type="text" name="slideshows[<?php echo $index; ?>][description]" value="<?php echo htmlspecialchars($slide['description']); ?>">
                    </td>
                    <td>
                        <button type="button" onclick="removeSlide(<?php echo $index; ?>)">Remove</button>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <br>
        <button type="button" onclick="addSlide()">Add New Slideshow</button>
        <br><br>
        <button type="submit">Save Slideshows</button>
    </form>
    
    <script>
        let slideCount = <?php echo count($slideshows); ?>;
        function addSlide() {
            const table = document.getElementById('slideshowsTable');
            const row = document.createElement('tr');
            row.innerHTML = `<td><input type="text" name="slideshows[${slideCount}][title]" value=""></td>
                             <td><input type="text" name="slideshows[${slideCount}][url]" value=""></td>
                             <td><input type="text" name="slideshows[${slideCount}][description]" value=""></td>
                             <td><button type="button" onclick="removeSlide(${slideCount})">Remove</button></td>`;
            table.appendChild(row);
            slideCount++;
        }
        function removeSlide(index) {
            // This simple function removes the corresponding row.
            // A more robust solution might re-index all rows.
            const table = document.getElementById('slideshowsTable');
            const rows = table.getElementsByTagName('tr');
            if (rows[index]) {
                rows[index].remove();
            }
        }
    </script>
</body>
</html>

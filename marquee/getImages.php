<?php
$dir = 'img/ia-in-pixels';
$images = array_diff(scandir($dir), array('..', '.'));
$imageList = [];

foreach ($images as $file) {
    $filePath = $dir . '/' . $file;
    // Optionally, check file type here.
    $size = @getimagesize($filePath);
    if ($size !== false) {
        $imageList[] = array(
            "url"    => $filePath,
            "width"  => $size[0],
            "height" => $size[1]
        );
    } else {
        // Fallback if getimagesize fails
        $imageList[] = array(
            "url"    => $filePath,
            "width"  => 0,
            "height" => 0
        );
    }
}

header('Content-Type: application/json');
echo json_encode($imageList);
?>

<?php
// =============================
// process/image_process.php
// =============================

// Authentication check
if (!isset($_COOKIE['access_granted']) || $_COOKIE['access_granted'] !== '1') {
    $currentPage = basename(__FILE__);
    header('Location: ../login.php?redirect=' . urlencode($currentPage));
    exit;
}

// Load and initialize data
$jsonFile = __DIR__ . '/../json/images.json';
$data     = file_exists($jsonFile) ? json_decode(file_get_contents($jsonFile), true) : [];
$data['categories'] = $data['categories'] ?? [];
$data['images']     = $data['images'] ?? [];

// Ensure each image has description key
foreach ($data['images'] as &$img) {
    if (!isset($img['description'])) {
        $img['description'] = '';
    }
}

$action = $_POST['action'] ?? '';
switch ($action) {
    case 'add_category':
        $newCat = trim($_POST['new_category'] ?? '');
        if ($newCat && !in_array($newCat, $data['categories'])) {
            $data['categories'][] = $newCat;
        }
        break;

    case 'delete_category':
        $delCat = trim($_POST['category'] ?? '');
        $data['categories'] = array_values(array_filter($data['categories'], fn($c) => $c !== $delCat));
        foreach ($data['images'] as &$img) {
            if ($img['category'] === $delCat) {
                $img['category'] = '';
            }
        }
        break;

    case 'upload_images':
        $cat = trim($_POST['category'] ?? '');
        if ($cat) {
            $uploadDir = __DIR__ . '/../uploads/images/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
            foreach ($_FILES['images']['error'] as $i => $err) {
                if ($err === UPLOAD_ERR_OK) {
                    $tmp   = $_FILES['images']['tmp_name'][$i];
                    $name  = $_FILES['images']['name'][$i];
                    $ext   = pathinfo($name, PATHINFO_EXTENSION);
                    $base  = pathinfo($name, PATHINFO_FILENAME);
                    $safeBase = preg_replace('/[^A-Za-z0-9_-]/', '_', $base);
                    $newName  = "$safeBase.$ext";
                    $dest     = $uploadDir . $newName;
                    $count = 1;
                    while (file_exists($dest)) {
                        $newName = "{$safeBase}_{$count}.$ext";
                        $dest    = $uploadDir . $newName;
                        $count++;
                    }
                    move_uploaded_file($tmp, $dest);
                    $relUrl = "uploads/images/{$newName}";
                    $data['images'][] = [
                        'url'         => $relUrl,
                        'category'    => $cat,
                        'title'       => $safeBase,
                        'description' => ''
                    ];
                }
            }
        }
        break;

    case 'edit_image':
        $idx = intval($_POST['image_index'] ?? -1);
        if (isset($data['images'][$idx])) {
            $img = &$data['images'][$idx];
            $img['title']       = trim($_POST['title'] ?? $img['title']);
            $img['description'] = trim($_POST['description'] ?? $img['description']);
            $img['category']    = trim($_POST['category'] ?? $img['category']);
            if (isset($_FILES['image_file']['error']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
                $tmp   = $_FILES['image_file']['tmp_name'];
                $name  = $_FILES['image_file']['name'];
                $ext   = pathinfo($name, PATHINFO_EXTENSION);
                $base  = pathinfo($name, PATHINFO_FILENAME);
                $safeBase = preg_replace('/[^A-Za-z0-9_-]/', '_', $base);
                $newName  = "$safeBase.$ext";
                $uploadDir = __DIR__ . '/../uploads/images/';
                $dest = $uploadDir . $newName;
                $count = 1;
                while (file_exists($dest)) {
                    $newName = "{$safeBase}_{$count}.$ext";
                    $dest    = $uploadDir . $newName;
                    $count++;
                }
                move_uploaded_file($tmp, $dest);
                $oldPath = __DIR__ . '/../' . $img['url'];
                if (file_exists($oldPath)) unlink($oldPath);
                $img['url'] = "uploads/images/{$newName}";
            }
        }
        break;

    case 'delete_image':
        $idx = intval($_POST['image_index'] ?? -1);
        if (isset($data['images'][$idx])) {
            $filePath = __DIR__ . '/../' . $data['images'][$idx]['url'];
            if (file_exists($filePath)) unlink($filePath);
            array_splice($data['images'], $idx, 1);
        }
        break;

    default:
        break;
}

file_put_contents($jsonFile, json_encode($data, JSON_PRETTY_PRINT));
header('Location: ../image_setup.php');
exit;
?>

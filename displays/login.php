<?php
// If the user is submitting the form...
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    // Check credentials
    if ($username === '' && $password === '') {
        // Set a cookie to indicate the user is "logged in"
        // 86400 = 1 day (in seconds). Adjust if you want a different expiration.
        setcookie('access_granted', '1', time() + 86400, '/');

        // If we have a redirect page in the URL, use that; otherwise go somewhere default
        $redirect = $_GET['redirect'] ?? 'display_setup.php';
        header('Location: ' . $redirect);
        exit;
    } else {
        $error = "Invalid username or password.";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
</head>
<body>
    <?php if (isset($error)): ?>
        <p style="color: red;"><?php echo $error; ?></p>
    <?php endif; ?>
    
    <form method="post" action="login.php<?php 
        // Preserve the ?redirect=... if present
        if (isset($_GET['redirect'])) {
            echo '?redirect=' . urlencode($_GET['redirect']); 
        }
    ?>">
        <p>
            <label for="username">Username:</label>
            <input type="text" id="username" name="username">
        </p>
        <p>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password">
        </p>
        <button type="submit">Log In</button>
    </form>
</body>
</html>

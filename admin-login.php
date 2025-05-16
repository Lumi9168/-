<?php
session_start();
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['admin-id'] ?? '';
    $pw = $_POST['admin-password'] ?? '';
    // 本番ではDBやより安全な方法で管理してください
    if ($id === 'NLkagoshima' && $pw === 'NLkagoshima01') {
        $_SESSION['admin_logged_in'] = true;
        header('Location: admin.html');
        exit;
    } else {
        $error = 'IDまたはパスワードが違います';
    }
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理者用ログイン</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>管理者用ログイン</h1>
    </header>
    <main>
        <form method="post" class="admin-form">
            <label for="admin-id">ID:</label>
            <input type="text" id="admin-id" name="admin-id" required>
            <label for="admin-password">パスワード:</label>
            <input type="password" id="admin-password" name="admin-password" required>
            <button type="submit">ログイン</button>
        </form>
        <?php if ($error): ?>
            <p style="color:red; text-align:center;">IDまたはパスワードが違います</p>
        <?php endif; ?>
    </main>
    <footer>
        <p>&copy; 2025 荷受け予約システム</p>
    </footer>
</body>
</html>

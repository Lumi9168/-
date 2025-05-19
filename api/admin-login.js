// 管理者ログインAPI（Vercel Functions用）
// ユーザーID・パスワードはここで管理（本番は環境変数やDB推奨）
const users = [
  { id: 'admin1', password: 'pass1' },
  { id: 'admin2', password: 'pass2' }
];

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id, password } = req.body;
  const found = users.find(u => u.id === id && u.password === password);
  if (found) {
    // 認証OK: セッション用の簡易トークンを返す（本番はJWT推奨）
    res.status(200).json({ success: true, token: 'dummy-token', user: id });
  } else {
    res.status(401).json({ success: false, message: 'IDまたはパスワードが違います' });
  }
}

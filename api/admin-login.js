// 管理者ログインAPI（Vercel Functions用）
// 鹿児島の認証ID/PWをサーバー側で管理
const users = [
  { id: 'NLkagoshima', password: 'NLkagoshima01' }
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

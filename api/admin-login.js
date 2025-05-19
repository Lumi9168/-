// 管理者ログインAPI（Vercel Functions用）
// 鹿児島の認証ID/PWをサーバー側で管理
let users = [
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

// 管理者ユーザー追加・削除・パスワード変更用API（簡易実装例）
// 本番は認証・権限チェック必須
export function updateUsers(newUsers) {
  users.length = 0;
  for (const u of newUsers) users.push(u);
}

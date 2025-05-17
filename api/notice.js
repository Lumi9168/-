// Vercel Edge Functionsや無料枠ではファイル書き込みができないため、メモリ上でお知らせを保持する簡易API例
// 本番運用では外部DBやVercel KV等の利用を推奨

let notices = [];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { status, info } = req.body;
    if (!status || !info) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const title = `${month}月${day}日 メール送信${status}`;
    const id = `${now.getTime()}_${Math.floor(Math.random()*10000)}`;
    notices.unshift({ id, title, info, status, date: now.toISOString() });
    if (notices.length > 50) notices = notices.slice(0, 50); // 最大50件保持
    return res.status(200).json({ message: 'お知らせ追加', id });
  } else if (req.method === 'GET') {
    return res.status(200).json({ notices });
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    notices = notices.filter(n => n.id !== id);
    return res.status(200).json({ message: '削除しました' });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

import { kv } from '@vercel/kv';

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
    const notice = { id, title, info, status, date: now.toISOString() };
    // 先頭に追加
    let notices = (await kv.get('notices')) || [];
    notices.unshift(notice);
    if (notices.length > 50) notices = notices.slice(0, 50);
    await kv.set('notices', notices);
    return res.status(200).json({ message: 'お知らせ追加', id });
  } else if (req.method === 'GET') {
    const notices = (await kv.get('notices')) || [];
    return res.status(200).json({ notices });
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    let notices = (await kv.get('notices')) || [];
    notices = notices.filter(n => n.id !== id);
    await kv.set('notices', notices);
    return res.status(200).json({ message: '削除しました' });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

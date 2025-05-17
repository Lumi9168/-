import { Redis } from '@upstash/redis';

// Upstash Redisクライアントを環境変数から初期化
const redis = Redis.fromEnv();

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
    // 既存のお知らせを取得
    let notices = (await redis.get('notices')) || [];
    // Upstash Redisは値をJSON文字列で返す場合があるのでパース
    if (typeof notices === 'string') {
      try { notices = JSON.parse(notices); } catch { notices = []; }
    }
    notices.unshift(notice);
    if (notices.length > 50) notices = notices.slice(0, 50);
    await redis.set('notices', JSON.stringify(notices));
    return res.status(200).json({ message: 'お知らせ追加', id });
  } else if (req.method === 'GET') {
    let notices = (await redis.get('notices')) || [];
    if (typeof notices === 'string') {
      try { notices = JSON.parse(notices); } catch { notices = []; }
    }
    return res.status(200).json({ notices });
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    let notices = (await redis.get('notices')) || [];
    if (typeof notices === 'string') {
      try { notices = JSON.parse(notices); } catch { notices = []; }
    }
    notices = notices.filter(n => n.id !== id);
    await redis.set('notices', JSON.stringify(notices));
    return res.status(200).json({ message: '削除しました' });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

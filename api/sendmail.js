const nodemailer = require('nodemailer');
const { Redis } = require('@upstash/redis');

// Upstash Redisクライアントを環境変数から初期化
const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, image, filename, mimeType, company, cases, product, note } = req.body;

  if (!text || !image || !filename) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // メール送信
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    if (!user || !pass) throw new Error('Mail credentials not set');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
    const attachments = [
      {
        filename: filename,
        content: Buffer.from(image, 'base64'),
        encoding: 'base64',
        contentType: mimeType || 'image/jpeg',
      },
    ];
    await transporter.sendMail({
      from: user,
      to: 'h-hisamatsu@nippon-logi.co.jp',
      subject: '【荷受けシステム】破損品報告',
      text: text,
      attachments,
    });
    // お知らせ掲示板に追加
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const title = `${month}月${day}日 メール送信完了`;
    const id = `${now.getTime()}_${Math.floor(Math.random() * 10000)}`;
    const info = `寄託社名: ${company}\n破損ケース数: ${cases}\n商品名: ${product}\n備考: ${note}`;
    const notice = { id, title, info, status: '完了', date: now.toISOString() };
    let notices = (await redis.get('notices')) || [];
    if (typeof notices === 'string') {
      try { notices = JSON.parse(notices); } catch { notices = []; }
    }
    notices.unshift(notice);
    if (notices.length > 50) notices = notices.slice(0, 50);
    await redis.set('notices', JSON.stringify(notices));
    res.status(200).json({ message: 'メール送信成功' });
  } catch (error) {
    // お知らせ掲示板に失敗通知
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const title = `${month}月${day}日 メール送信失敗`;
      const id = `${now.getTime()}_${Math.floor(Math.random() * 10000)}`;
      const info = `エラー: ${error.message}\n${text}`;
      const notice = { id, title, info, status: '失敗', date: now.toISOString() };
      let notices = (await redis.get('notices')) || [];
      if (typeof notices === 'string') {
        try { notices = JSON.parse(notices); } catch { notices = []; }
      }
      notices.unshift(notice);
      if (notices.length > 50) notices = notices.slice(0, 50);
      await redis.set('notices', JSON.stringify(notices));
    } catch (e) {
      // 何もしない
    }
    res.status(500).json({ error: 'メール送信失敗', details: error.message });
  }
}

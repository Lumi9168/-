const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, image, filename } = req.body;

  if (!text || !image || !filename) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 環境変数からメール認証情報を取得
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!user || !pass) {
    return res.status(500).json({ error: 'Mail credentials not set' });
  }

  // nodemailerトランスポート作成（Gmail例）
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  // 添付ファイル（Base64エンコードされた画像データをバッファに変換）
  const attachments = [
    {
      filename: filename,
      content: Buffer.from(image.split(',')[1], 'base64'),
      encoding: 'base64',
    },
  ];

  try {
    await transporter.sendMail({
      from: user,
      to: 'h-hisamatsu@nippon-logi.co.jp',
      subject: '【荷受けシステム】破損品報告',
      text: text,
      attachments,
    });
    res.status(200).json({ message: 'メール送信成功' });
  } catch (error) {
    res.status(500).json({ error: 'メール送信失敗', details: error.message });
  }
}

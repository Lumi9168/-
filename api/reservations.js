// 予約情報の保存・取得・更新API（Vercel Functions用）
import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();

export default async function handler(req, res) {
  const branch = req.method === 'GET' ? req.query.branch : req.body.branch;
  if (!branch) {
    return res.status(400).json({ error: 'branchが指定されていません' });
  }
  const redisKey = `reservations:${branch}`;
  if (req.method === 'POST') {
    // 新規予約登録
    const { date, driverName, companyName, phoneNumber, cargoSummary } = req.body;
    if (!date || !driverName || !phoneNumber || !cargoSummary) {
      return res.status(400).json({ error: '必須項目が不足しています' });
    }
    let reservations = (await redis.get(redisKey)) || [];
    if (typeof reservations === 'string') {
      try { reservations = JSON.parse(reservations); } catch { reservations = []; }
    }
    reservations.push({ date, driverName, companyName, phoneNumber, cargoSummary });
    await redis.set(redisKey, JSON.stringify(reservations));
    return res.status(200).json({ message: '予約登録完了' });
  } else if (req.method === 'GET') {
    // 予約一覧取得
    let reservations = (await redis.get(redisKey)) || [];
    if (typeof reservations === 'string') {
      try { reservations = JSON.parse(reservations); } catch { reservations = []; }
    }
    return res.status(200).json({ reservations });
  } else if (req.method === 'PUT') {
    // 並び替え・削除等の更新
    const { reservations } = req.body;
    if (!Array.isArray(reservations)) {
      return res.status(400).json({ error: '不正なデータ形式' });
    }
    await redis.set(redisKey, JSON.stringify(reservations));
    return res.status(200).json({ message: '更新完了' });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

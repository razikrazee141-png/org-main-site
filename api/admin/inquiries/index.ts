import { loadInquiries } from '../../../server/inquiryStorage';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const authHeader = req.headers?.authorization;
  const adminKey = process.env.ADMIN_KEY || 'nextgen-admin-secret-2026';

  if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: 'Unauthorized: Valid Admin Authorization Bearer token required.',
    }));
    return;
  }

  if (req.method === 'GET') {
    const inquiries = loadInquiries();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      count: inquiries.length,
      inquiries,
    }));
    return;
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
}

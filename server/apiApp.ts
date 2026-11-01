import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  Inquiry,
  loadInquiries,
  saveInquiry,
  updateInquiryStatus,
  deleteInquiry,
  sendNotificationEmail,
} from './inquiryStorage';

dotenv.config();

export { Inquiry, loadInquiries, saveInquiry, updateInquiryStatus, deleteInquiry, sendNotificationEmail };

const router = Router();

// Health check endpoint
router.get('/contact/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'NextGen Inquiry Gateway',
    timestamp: new Date().toISOString(),
    inquiriesLogged: loadInquiries().length,
  });
});

// Primary Contact submission endpoint
router.post('/contact', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message, bot_check } = req.body || {};

    if (bot_check && String(bot_check).trim().length > 0) {
      res.status(200).json({
        success: true,
        message: 'Your inquiry has been received.',
      });
      return;
    }

    const errors: Record<string, string> = {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.name = 'Full name is required (minimum 2 characters).';
    } else if (name.trim().length > 100) {
      errors.name = 'Full name must not exceed 100 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      errors.email = 'A valid email address is required (e.g. name@domain.com).';
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 2) {
      errors.subject = 'Please specify an inquiry subject.';
    } else if (subject.trim().length > 150) {
      errors.subject = 'Subject must not exceed 150 characters.';
    }

    if (!message || typeof message !== 'string' || message.trim().length < 15) {
      errors.message = 'Please provide a detailed message (minimum 15 characters).';
    } else if (message.trim().length > 5000) {
      errors.message = 'Message must not exceed 5000 characters.';
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
      return;
    }

    const inquiryId = `NG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    const newInquiry: Inquiry = {
      id: inquiryId,
      createdAt: new Date().toISOString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ip,
      userAgent,
      status: 'new',
      emailNotificationSent: false,
    };

    const emailSent = await sendNotificationEmail(newInquiry);
    newInquiry.emailNotificationSent = emailSent;

    saveInquiry(newInquiry);

    res.status(200).json({
      success: true,
      message: 'Thank you for contacting NextGen. Your correspondence has been logged for official review.',
      inquiryId,
      timestamp: newInquiry.createdAt,
    });
  } catch (error) {
    console.error('Server error processing inquiry:', error);
    res.status(500).json({
      success: false,
      error: 'An internal error occurred while logging your message. Please try again shortly.',
    });
  }
});

// Admin Review endpoint
router.get('/admin/inquiries', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const adminKey = process.env.ADMIN_KEY || 'nextgen-admin-secret-2026';

  if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid Admin Authorization Bearer token required.',
    });
    return;
  }

  const inquiries = loadInquiries();
  res.json({
    success: true,
    count: inquiries.length,
    inquiries,
  });
});

// Admin update status
router.patch('/admin/inquiries/:id', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const adminKey = process.env.ADMIN_KEY || 'nextgen-admin-secret-2026';

  if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const { status } = req.body;
  if (!status || !['new', 'reviewed', 'responded'].includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid status' });
    return;
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const target = updateInquiryStatus(id, status);
  if (!target) {
    res.status(404).json({ success: false, error: 'Inquiry not found' });
    return;
  }

  res.json({ success: true, inquiry: target });
});

// Admin delete inquiry
router.delete('/admin/inquiries/:id', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const adminKey = process.env.ADMIN_KEY || 'nextgen-admin-secret-2026';

  if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const success = deleteInquiry(id);
  if (!success) {
    res.status(404).json({ success: false, error: 'Inquiry not found' });
    return;
  }

  res.json({ success: true, message: 'Inquiry deleted' });
});

export const apiApp = express();

apiApp.use(express.json({ limit: '20kb' }));
apiApp.use(cors());

apiApp.use('/api', router);
apiApp.use(router);

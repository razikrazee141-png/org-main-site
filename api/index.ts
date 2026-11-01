import type { Request, Response } from 'express';
import { apiApp } from '../server/apiApp';

export default function handler(req: Request, res: Response) {
  return apiApp(req, res);
}

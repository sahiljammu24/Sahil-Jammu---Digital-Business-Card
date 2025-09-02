import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { oldPassword, newPassword } = req.body;

  const envPath = path.resolve(process.cwd(), '.env');
  const envFile = fs.readFileSync(envPath, 'utf-8');
  const envConfig = Object.fromEntries(envFile.split('\n').map(line => line.split('=')));

  if (envConfig.VITE_ADMIN_PASSWORD !== oldPassword) {
    return res.status(401).json({ message: 'Incorrect old password' });
  }

  envConfig.VITE_ADMIN_PASSWORD = newPassword;

  const newEnvFile = Object.entries(envConfig).map(([key, value]) => `${key}=${value}`).join('\n');
  fs.writeFileSync(envPath, newEnvFile);

  res.status(200).json({ message: 'Password updated successfully' });
}
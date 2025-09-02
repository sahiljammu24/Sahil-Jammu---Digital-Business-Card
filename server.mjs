import express from 'express';
import fs from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/change-password', (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Load existing .env file
  const envConfig = dotenv.parse(fs.readFileSync('.env'));

  // Verify old password
  if (envConfig.VITE_ADMIN_PASSWORD !== oldPassword) {
    return res.status(401).json({ message: 'Incorrect old password' });
  }

  // Update password
  envConfig.VITE_ADMIN_PASSWORD = newPassword;

  // Write updated config to .env file
  const newEnvConfig = Object.entries(envConfig).map(([key, value]) => `${key}=${value}`).join('\n');
  fs.writeFileSync('.env', newEnvConfig);

  res.json({ message: 'Password updated successfully' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
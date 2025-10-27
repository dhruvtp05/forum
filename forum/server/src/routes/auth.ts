// server/src/routes/auth.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

function signAccessToken(userId: string) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES ?? '15m',
  });
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signAccessToken(user._id.toString());

  // Option A: return in JSON
  // return res.json({ token, user: { _id: user._id, username: user.username, email: user.email } });

  // Option B: set httpOnly cookie (recommended for browser apps)
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: true,              // set false only on http://localhost if needed
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,    // 15m
  });
  return res.json({ user: { _id: user._id, username: user.username, email: user.email } });
});

export default router;

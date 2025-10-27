// routes/users.ts
import express from 'express';
import { getAllUsers, createNewUser, updateUser, deleteUser, getUserById } from '../controllers/UsersController';
import requireAuth from '@/middleware/requireAuth';

const router = express.Router();

// Collection
router.get('/users', getAllUsers);
router.post('/users', createNewUser);

// Single resource
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUser); 
router.delete('/users/:id', deleteUser);

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: (req as any).user });
});

export default router;

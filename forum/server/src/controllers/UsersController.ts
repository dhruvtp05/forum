// controllers/UsersController.ts
import { Request, RequestHandler, Response } from 'express';
import User from '../models/User';

// Get all users (no password)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get one user by id (no password)
export const getUserById: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Invalid user id' });
  }
};

// Create new user (return sanitized)
export const createNewUser = async (req: Request, res: Response) => {
  try {
    const created = await new User(req.body).save();
    const safeUser = await User.findById(created._id).select('-password');
    res.status(201).json(safeUser);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user' });
  }
};

// Update a user (validators + setters, hide password)
export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
        context: 'query',
      }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user' });
  }
};

// Delete a user
export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id).select('-password');

    if (!deletedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

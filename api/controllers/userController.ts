import { Request, Response } from 'express';
import { userService } from '../services/userService.js';
import type { UserRole } from '../../shared/types.js';

export const userController = {
  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = userService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' });
      }

      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { phone, role } = req.body;
      let user = userService.getUserByPhone(phone);
      
      if (!user) {
        const name = role === 'employer' ? '新用户' : '新阿姨';
        user = userService.createUser({ name, phone, role: role as UserRole });
      } else if (user.role !== role) {
        return res.status(400).json({ success: false, message: '该手机号已注册其他角色' });
      }

      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getReviews(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = userService.getUserReviews(id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async addReview(req: Request, res: Response) {
    try {
      const { orderId, fromUserId, toUserId, rating, content } = req.body;
      
      const review = userService.addReview({
        orderId,
        fromUserId,
        toUserId,
        rating: Number(rating),
        content,
      });

      res.status(201).json({ success: true, data: review });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};

export default userController;

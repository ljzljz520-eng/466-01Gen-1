import { Request, Response } from 'express';
import { orderService } from '../services/orderService.js';
import type { CancelReason, OrderStatus, ServiceType } from '../../shared/types.js';

export const orderController = {
  async listOrders(req: Request, res: Response) {
    try {
      const { role, userId, status } = req.query;
      
      let orders;
      if (role === 'employer' && userId) {
        orders = orderService.getOrdersByEmployer(userId as string);
      } else if (role === 'aide' && userId) {
        orders = orderService.getOrdersByAide(userId as string);
      } else if (status === 'pending') {
        orders = orderService.getPendingOrders();
      } else {
        orders = orderService.getAllOrders();
      }

      res.json({ success: true, data: orders });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = orderService.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ success: false, message: '订单不存在' });
      }

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async createOrder(req: Request, res: Response) {
    try {
      const { employerId, serviceType, address, date, duration, hasPet, petType, requirements, price } = req.body;
      
      const order = orderService.createOrder({
        employerId,
        serviceType: serviceType as ServiceType,
        address,
        date,
        duration: Number(duration),
        hasPet: Boolean(hasPet),
        petType,
        requirements,
        price: Number(price),
      });

      res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async acceptOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { aideId } = req.body;
      
      const order = orderService.acceptOrder(id, aideId);
      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, aideId } = req.body;
      
      const order = orderService.updateOrderStatus(id, status as OrderStatus, aideId);
      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async addPhotos(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { aideId, photos } = req.body;
      
      const order = orderService.addPhotos(id, aideId, photos);
      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async cancelOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason, operatorId, note } = req.body;
      
      const order = orderService.cancelOrder(id, reason as CancelReason, operatorId, note);
      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};

export default orderController;

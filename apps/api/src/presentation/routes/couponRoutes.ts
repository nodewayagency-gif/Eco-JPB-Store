import { FastifyInstance } from 'fastify';
import { CouponController } from '../controllers/CouponController';

export async function couponRoutes(app: FastifyInstance) {
  const couponController = new CouponController();

  app.get('/coupons', (req, res) => couponController.list(req, res));
  app.post('/coupons', (req, res) => couponController.create(req, res));
  app.put('/coupons/:id', (req, res) => couponController.update(req, res));
  app.delete('/coupons/:id', (req, res) => couponController.delete(req, res));
  app.post('/coupons/validate', (req, res) => couponController.validate(req, res));
}

import { Request, Response, NextFunction } from 'express';
import { BarberosService } from './barberos.service';

export class BarberosController {
  static async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BarberosService.listar();
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  }

  static async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BarberosService.obtener(req.params.id);
      res.json({ status: 'success', data });
    } catch (err: any) {
      res.status(404).json({ status: 'error', message: err.message });
    }
  }

  static async disponibilidad(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { fecha } = req.query as { fecha: string };
      if (!fecha) return res.status(400).json({ status: 'error', message: 'Parámetro fecha requerido.' });
      const slots = await BarberosService.disponibilidad(id, fecha);
      res.json({ status: 'success', data: slots });
    } catch (err) { next(err); }
  }

  static async estadisticas(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BarberosService.estadisticas(req.params.id);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  }
}

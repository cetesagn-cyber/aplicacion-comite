import { Router } from 'express';
import { BarberosController } from './barberos.controller';
import { verificarToken } from '../auth/auth.middleware';

const router = Router();

router.use(verificarToken as any);

router.get('/', BarberosController.listar);
router.get('/:id', BarberosController.obtener);
router.get('/:id/disponibilidad', BarberosController.disponibilidad);
router.get('/:id/estadisticas', BarberosController.estadisticas);

export default router;

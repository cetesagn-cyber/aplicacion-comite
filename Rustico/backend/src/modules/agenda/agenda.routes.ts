import { Router } from 'express';
import { AgendaController } from './agenda.controller';
import { verificarToken } from '../auth/auth.middleware';

const router = Router();

router.use(verificarToken as any);

router.get('/', AgendaController.listarPorFecha);
router.get('/resumen', AgendaController.resumenDia);
router.post('/', AgendaController.crear as any);
router.get('/barbero/:id', AgendaController.listarPorBarbero);
router.get('/:id', AgendaController.obtener);
router.patch('/:id/estado', AgendaController.actualizarEstado);

export default router;

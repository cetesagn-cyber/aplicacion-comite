import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRouter     from './modules/auth/auth.routes';
import agendaRouter   from './modules/agenda/agenda.routes';
import clientesRouter from './modules/clientes/clientes.routes';
import barberosRouter from './modules/barberos/barberos.routes';
import serviciosRouter from './modules/servicios/servicios.routes';
import { errorHandler } from './shared/middlewares/error.handler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/auth',      authRouter);
app.use('/api/v1/agenda',    agendaRouter);
app.use('/api/v1/clientes',  clientesRouter);
app.use('/api/v1/barberos',  barberosRouter);
app.use('/api/v1/servicios', serviciosRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'success',
    message: '💈 Rústico BarberAdmin API — operando',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
});

app.use(errorHandler as any);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('💈 ═══════════════════════════════════════════════ 💈');
    console.log(`🚀 Rústico BarberAdmin API · ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log('💈 ═══════════════════════════════════════════════ 💈');
  });
}

export default app;

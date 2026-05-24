import { db } from '../../shared/database/pg.client';

export class BarberosService {
  static async listar() {
    const res = await db.query(`
      SELECT b.id, b.especialidad, b.porcentaje_comision, b.color_agenda,
             b.horario_inicio, b.horario_fin, b.dias_laborales, b.activo,
             u.nombre, u.email, u.telefono
      FROM barberos b
      JOIN usuarios u ON b.usuario_id = u.id
      WHERE b.activo = TRUE
      ORDER BY u.nombre ASC
    `);
    return res.rows;
  }

  static async obtener(id: string) {
    const res = await db.query(`
      SELECT b.id, b.especialidad, b.porcentaje_comision, b.color_agenda,
             b.horario_inicio, b.horario_fin, b.dias_laborales, b.activo,
             u.nombre, u.email, u.telefono, u.id as usuario_id
      FROM barberos b
      JOIN usuarios u ON b.usuario_id = u.id
      WHERE b.id = $1
    `, [id]);
    if (res.rows.length === 0) throw new Error('Barbero no encontrado.');
    return res.rows[0];
  }

  static async disponibilidad(barberoId: string, fechaStr: string): Promise<string[]> {
    const barbero = await db.query(
      'SELECT horario_inicio, horario_fin, dias_laborales FROM barberos WHERE id = $1',
      [barberoId]
    );
    if (barbero.rows.length === 0) throw new Error('Barbero no encontrado.');

    const { horario_inicio, horario_fin, dias_laborales } = barbero.rows[0];
    const fecha = new Date(fechaStr + 'T00:00:00-05:00');
    const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay();

    if (!dias_laborales.includes(diaSemana)) return [];

    const citasRes = await db.query(`
      SELECT inicio, fin FROM agenda
      WHERE barbero_id = $1
        AND inicio::date = $2::date
        AND estado NOT IN ('cancelada')
    `, [barberoId, fechaStr]);

    const citas = citasRes.rows.map(c => ({
      inicio: new Date(c.inicio),
      fin: new Date(c.fin),
    }));

    const slots: string[] = [];
    const [hI, mI] = (horario_inicio as string).split(':').map(Number);
    const [hF, mF] = (horario_fin as string).split(':').map(Number);

    const slotActual = new Date(fechaStr + 'T00:00:00-05:00');
    slotActual.setHours(hI, mI, 0, 0);
    const limite = new Date(fechaStr + 'T00:00:00-05:00');
    limite.setHours(hF, mF, 0, 0);

    const ahora = new Date();
    const INTERVALO = 30;

    while (slotActual < limite) {
      const slotFin = new Date(slotActual.getTime() + INTERVALO * 60_000);
      const ocupado = citas.some(c =>
        slotActual < c.fin && slotFin > c.inicio
      );
      const pasado = slotActual <= ahora;

      if (!ocupado && !pasado) {
        slots.push(`${String(slotActual.getHours()).padStart(2, '0')}:${String(slotActual.getMinutes()).padStart(2, '0')}`);
      }
      slotActual.setMinutes(slotActual.getMinutes() + INTERVALO);
    }

    return slots;
  }

  static async estadisticas(barberoId: string) {
    const res = await db.query(`
      SELECT
        COUNT(*)                                            AS total_citas,
        COUNT(*) FILTER (WHERE estado = 'completada')       AS completadas,
        COUNT(*) FILTER (WHERE estado = 'no_show')          AS no_shows,
        COALESCE(SUM(precio_cop) FILTER (WHERE estado = 'completada'), 0) AS ingresos_cop,
        COALESCE(AVG(precio_cop) FILTER (WHERE estado = 'completada'), 0) AS ticket_promedio
      FROM agenda
      WHERE barbero_id = $1
        AND inicio >= date_trunc('month', NOW() AT TIME ZONE 'America/Bogota')
    `, [barberoId]);
    return res.rows[0];
  }
}

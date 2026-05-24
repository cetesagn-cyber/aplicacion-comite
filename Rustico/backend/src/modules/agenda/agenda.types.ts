export type EstadoCita = 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'no_show';

export interface CrearCitaBody {
  cliente_id?: string;
  barbero_id: string;
  servicio_id: string;
  inicio: string;
  notas?: string;
  precio_cop?: number;
}

export interface ActualizarEstadoBody {
  estado: EstadoCita;
}

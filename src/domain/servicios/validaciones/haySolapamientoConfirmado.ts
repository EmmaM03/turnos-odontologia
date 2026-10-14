import type { Turno } from '../../entidades/Turno';
import type { IntervaloTiempo } from '../../value-objects/IntervaloTiempo';

export function haySolapamientoConfirmado(
  turnos: readonly Turno[],
  mismoRecurso: (turno: Turno) => boolean,
  intervalo: IntervaloTiempo,
): boolean {
  return turnos.some(
    (turno) => turno.estado === 'confirmado' && mismoRecurso(turno) && turno.intervalo.seSolapaCon(intervalo),
  );
}

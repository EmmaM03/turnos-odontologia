import { SolapamientoError } from '../../errores/SolapamientoError';
import type { RepositorioDeTurnos } from '../../puertos/RepositorioDeTurnos';
import { haySolapamientoConfirmado } from './haySolapamientoConfirmado';
import type { TurnoCandidato, ValidacionDeTurno } from './ValidacionDeTurno';

export class ProfesionalLibre implements ValidacionDeTurno {
  constructor(private readonly repositorio: RepositorioDeTurnos) {}

  validar(candidato: TurnoCandidato): void {
    const ocupado = haySolapamientoConfirmado(
      this.repositorio.todos(),
      (turno) => turno.profesionalId === candidato.profesionalId,
      candidato.intervalo,
    );
    if (ocupado) {
      throw new SolapamientoError('profesional');
    }
  }
}

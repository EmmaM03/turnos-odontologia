import { TurnoEnElPasadoError } from '../../errores/TurnoEnElPasadoError';
import type { Reloj } from '../../puertos/Reloj';
import type { TurnoCandidato, ValidacionDeTurno } from './ValidacionDeTurno';

export class NoEnElPasado implements ValidacionDeTurno {
  constructor(private readonly reloj: Reloj) {}

  validar(candidato: TurnoCandidato): void {
    if (candidato.intervalo.inicio.getTime() <= this.reloj.ahora().getTime()) {
      throw new TurnoEnElPasadoError();
    }
  }
}

import type { IntervaloTiempo } from '../../value-objects/IntervaloTiempo';

export interface TurnoCandidato {
  readonly profesionalId: string;
  readonly sillonId: string;
  readonly intervalo: IntervaloTiempo;
}

export interface ValidacionDeTurno {
  validar(candidato: TurnoCandidato): void;
}

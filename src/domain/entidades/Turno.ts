import type { IntervaloTiempo } from '../value-objects/IntervaloTiempo';

export type EstadoTurno = 'confirmado' | 'cancelado';

export class Turno {
  constructor(
    readonly id: string,
    readonly profesionalId: string,
    readonly sillonId: string,
    readonly pacienteId: string,
    readonly prestacionId: string,
    readonly intervalo: IntervaloTiempo,
    readonly estado: EstadoTurno,
  ) {}

  get inicio(): Date {
    return this.intervalo.inicio;
  }

  get fin(): Date {
    return this.intervalo.fin;
  }
}

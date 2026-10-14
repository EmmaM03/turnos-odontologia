import { IntervaloInvalidoError } from '../errores/IntervaloInvalidoError';

const MS_POR_MINUTO = 60_000;

export class IntervaloTiempo {
  constructor(
    readonly inicio: Date,
    readonly fin: Date,
  ) {
    if (inicio.getTime() >= fin.getTime()) {
      throw new IntervaloInvalidoError();
    }
  }

  static desdeDuracion(inicio: Date, minutos: number): IntervaloTiempo {
    return new IntervaloTiempo(inicio, new Date(inicio.getTime() + minutos * MS_POR_MINUTO));
  }

  seSolapaCon(otro: IntervaloTiempo): boolean {
    return this.inicio.getTime() < otro.fin.getTime() && otro.inicio.getTime() < this.fin.getTime();
  }
}

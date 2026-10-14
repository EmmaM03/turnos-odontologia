import { DuracionInvalidaError } from '../errores/DuracionInvalidaError';

export class Prestacion {
  constructor(
    readonly id: string,
    readonly nombre: string,
    readonly duracionMinutos: number,
  ) {
    if (!Number.isInteger(duracionMinutos) || duracionMinutos <= 0) {
      throw new DuracionInvalidaError(duracionMinutos);
    }
  }
}

import { ErrorDeDominio } from './ErrorDeDominio';

export class DuracionInvalidaError extends ErrorDeDominio {
  constructor(duracionMinutos: number) {
    super(`La duración de la prestación debe ser un número entero de minutos mayor que cero (recibido: ${duracionMinutos})`);
  }
}

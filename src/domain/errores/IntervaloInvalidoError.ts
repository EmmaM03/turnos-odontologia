import { ErrorDeDominio } from './ErrorDeDominio';

export class IntervaloInvalidoError extends ErrorDeDominio {
  constructor() {
    super('El inicio del intervalo debe ser estrictamente anterior a su fin');
  }
}

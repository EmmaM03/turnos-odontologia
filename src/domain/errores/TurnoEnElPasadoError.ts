import { ErrorDeDominio } from './ErrorDeDominio';

export class TurnoEnElPasadoError extends ErrorDeDominio {
  constructor() {
    super('El inicio del turno debe ser estrictamente posterior al momento actual');
  }
}

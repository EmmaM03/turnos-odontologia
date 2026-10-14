import { ErrorDeDominio } from './ErrorDeDominio';

export type RecursoEnConflicto = 'profesional' | 'sillon';

export class SolapamientoError extends ErrorDeDominio {
  constructor(readonly recurso: RecursoEnConflicto) {
    super(`El intervalo solicitado se solapa con otro turno confirmado del mismo ${recurso}`);
  }
}

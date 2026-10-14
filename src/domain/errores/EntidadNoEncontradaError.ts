import { ErrorDeDominio } from './ErrorDeDominio';

export type TipoDeEntidad = 'profesional' | 'sillon' | 'paciente' | 'prestacion';

export class EntidadNoEncontradaError extends ErrorDeDominio {
  constructor(
    readonly entidad: TipoDeEntidad,
    readonly id: string,
  ) {
    super(`No existe ${entidad} con id "${id}"`);
  }
}

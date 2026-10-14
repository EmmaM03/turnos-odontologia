import type { Turno } from '../entidades/Turno';

export interface RepositorioDeTurnos {
  todos(): readonly Turno[];
  guardar(turno: Turno): void;
  proximoId(): string;
}

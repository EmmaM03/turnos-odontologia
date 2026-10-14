import type { Turno } from '../../src/domain/entidades/Turno';
import type { RepositorioDeTurnos } from '../../src/domain/puertos/RepositorioDeTurnos';

export class RepositorioDeTurnosEnMemoria implements RepositorioDeTurnos {
  private readonly turnos: Turno[];
  private secuencia = 0;

  constructor(turnosIniciales: readonly Turno[] = []) {
    this.turnos = [...turnosIniciales];
  }

  todos(): readonly Turno[] {
    return [...this.turnos];
  }

  guardar(turno: Turno): void {
    this.turnos.push(turno);
  }

  proximoId(): string {
    this.secuencia += 1;
    return `turno-${this.secuencia}`;
  }
}

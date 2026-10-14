import type { Reloj } from '../../src/domain/puertos/Reloj';

export class RelojFijo implements Reloj {
  constructor(private readonly instante: Date) {}

  ahora(): Date {
    return this.instante;
  }
}

import type { Paciente } from '../../src/domain/entidades/Paciente';
import type { Prestacion } from '../../src/domain/entidades/Prestacion';
import type { Profesional } from '../../src/domain/entidades/Profesional';
import type { Sillon } from '../../src/domain/entidades/Sillon';
import type { CatalogoDeAgenda } from '../../src/domain/puertos/CatalogoDeAgenda';

export interface ContenidoDelCatalogo {
  readonly profesionales: readonly Profesional[];
  readonly sillones: readonly Sillon[];
  readonly pacientes: readonly Paciente[];
  readonly prestaciones: readonly Prestacion[];
}

export class CatalogoEnMemoria implements CatalogoDeAgenda {
  constructor(private readonly contenido: ContenidoDelCatalogo) {}

  profesional(id: string): Profesional | undefined {
    return this.contenido.profesionales.find((p) => p.id === id);
  }

  sillon(id: string): Sillon | undefined {
    return this.contenido.sillones.find((s) => s.id === id);
  }

  paciente(id: string): Paciente | undefined {
    return this.contenido.pacientes.find((p) => p.id === id);
  }

  prestacion(id: string): Prestacion | undefined {
    return this.contenido.prestaciones.find((p) => p.id === id);
  }
}

import type { Paciente } from '../entidades/Paciente';
import type { Prestacion } from '../entidades/Prestacion';
import type { Profesional } from '../entidades/Profesional';
import type { Sillon } from '../entidades/Sillon';

export interface CatalogoDeAgenda {
  profesional(id: string): Profesional | undefined;
  sillon(id: string): Sillon | undefined;
  paciente(id: string): Paciente | undefined;
  prestacion(id: string): Prestacion | undefined;
}

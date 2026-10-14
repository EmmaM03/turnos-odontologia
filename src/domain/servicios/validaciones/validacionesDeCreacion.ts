import type { Reloj } from '../../puertos/Reloj';
import type { RepositorioDeTurnos } from '../../puertos/RepositorioDeTurnos';
import { NoEnElPasado } from './NoEnElPasado';
import { ProfesionalLibre } from './ProfesionalLibre';
import { SillonLibre } from './SillonLibre';
import type { ValidacionDeTurno } from './ValidacionDeTurno';

export interface DependenciasDeValidacion {
  readonly reloj: Reloj;
  readonly repositorio: RepositorioDeTurnos;
}

export function validacionesDeCreacion(dependencias: DependenciasDeValidacion): readonly ValidacionDeTurno[] {
  return [
    new NoEnElPasado(dependencias.reloj),
    new ProfesionalLibre(dependencias.repositorio),
    new SillonLibre(dependencias.repositorio),
  ];
}

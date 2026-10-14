import { Paciente } from '../../src/domain/entidades/Paciente';
import { Prestacion } from '../../src/domain/entidades/Prestacion';
import { Profesional } from '../../src/domain/entidades/Profesional';
import { Sillon } from '../../src/domain/entidades/Sillon';
import { Turno, type EstadoTurno } from '../../src/domain/entidades/Turno';
import { IntervaloTiempo } from '../../src/domain/value-objects/IntervaloTiempo';
import { CatalogoEnMemoria } from './CatalogoEnMemoria';

export const AHORA = new Date('2026-11-02T08:00:00-03:00');

export const PROF_1 = new Profesional('prof-1', 'Dra. Ficticia Uno');
export const PROF_2 = new Profesional('prof-2', 'Dr. Ficticio Dos');
export const SILLON_1 = new Sillon('sillon-1', 'Box 1');
export const SILLON_2 = new Sillon('sillon-2', 'Box 2');
export const PAC_1 = new Paciente('pac-1', 'Paciente de Prueba 1');
export const PAC_2 = new Paciente('pac-2', 'Paciente de Prueba 2');
export const PREST_CONSULTA = new Prestacion('prest-consulta', 'Consulta', 30);
export const PREST_EXTRACCION = new Prestacion('prest-extraccion', 'Extracción', 60);

export function catalogoDeReferencia(): CatalogoEnMemoria {
  return new CatalogoEnMemoria({
    profesionales: [PROF_1, PROF_2],
    sillones: [SILLON_1, SILLON_2],
    pacientes: [PAC_1, PAC_2],
    prestaciones: [PREST_CONSULTA, PREST_EXTRACCION],
  });
}

export function instante(iso: string): Date {
  return new Date(iso);
}

export interface DatosDeTurnoExistente {
  readonly id?: string;
  readonly profesionalId: string;
  readonly sillonId: string;
  readonly pacienteId?: string;
  readonly inicio: string;
  readonly fin: string;
  readonly estado?: EstadoTurno;
}

export function turnoExistente(datos: DatosDeTurnoExistente): Turno {
  return new Turno(
    datos.id ?? 'turno-existente',
    datos.profesionalId,
    datos.sillonId,
    datos.pacienteId ?? PAC_1.id,
    PREST_CONSULTA.id,
    new IntervaloTiempo(instante(datos.inicio), instante(datos.fin)),
    datos.estado ?? 'confirmado',
  );
}

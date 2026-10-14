import { describe, expect, it } from 'vitest';
import { ServicioDeTurnos, type SolicitudDeTurno } from '../../src/domain/servicios/ServicioDeTurnos';
import { ErrorDeDominio } from '../../src/domain/errores/ErrorDeDominio';
import { EntidadNoEncontradaError } from '../../src/domain/errores/EntidadNoEncontradaError';
import { SolapamientoError } from '../../src/domain/errores/SolapamientoError';
import { TurnoEnElPasadoError } from '../../src/domain/errores/TurnoEnElPasadoError';
import type { EstadoTurno, Turno } from '../../src/domain/entidades/Turno';
import { RelojFijo } from '../soporte/RelojFijo';
import { RepositorioDeTurnosEnMemoria } from '../soporte/RepositorioDeTurnosEnMemoria';
import {
  AHORA,
  PAC_1,
  PAC_2,
  PROF_2,
  SILLON_2,
  turnoExistente,
  PREST_CONSULTA,
  PREST_EXTRACCION,
  PROF_1,
  SILLON_1,
  catalogoDeReferencia,
  instante,
} from '../soporte/datosDeReferencia';

function capturarError(accion: () => unknown): unknown {
  try {
    accion();
  } catch (error) {
    return error;
  }
  throw new Error('Se esperaba que la acción lanzara un error');
}

function consultaDeLas10(profesionalId: string, sillonId: string, estado: EstadoTurno = 'confirmado'): Turno {
  return turnoExistente({
    profesionalId,
    sillonId,
    inicio: '2026-11-02T10:00:00-03:00',
    fin: '2026-11-02T10:30:00-03:00',
    estado,
  });
}

interface Escenario {
  readonly servicio: ServicioDeTurnos;
  readonly repositorio: RepositorioDeTurnosEnMemoria;
}

function armarEscenario(turnosExistentes: readonly Turno[] = [], ahora: Date = AHORA): Escenario {
  const repositorio = new RepositorioDeTurnosEnMemoria(turnosExistentes);
  const servicio = new ServicioDeTurnos({
    reloj: new RelojFijo(ahora),
    repositorio,
    catalogo: catalogoDeReferencia(),
  });
  return { servicio, repositorio };
}

function solicitud(inicioIso: string, cambios: Partial<Omit<SolicitudDeTurno, 'inicio'>> = {}): SolicitudDeTurno {
  return {
    profesionalId: PROF_1.id,
    sillonId: SILLON_1.id,
    pacienteId: PAC_1.id,
    prestacionId: PREST_CONSULTA.id,
    inicio: instante(inicioIso),
    ...cambios,
  };
}

describe('ServicioDeTurnos.crear', () => {
  describe('creación de un turno confirmado con duración definida por la prestación', () => {
    it('crea un turno confirmado de 30 minutos con profesional y sillón libres (CA-1)', () => {
      const { servicio, repositorio } = armarEscenario();

      const turno = servicio.crear(solicitud('2026-11-02T10:00:00-03:00'));

      expect(turno.estado).toBe('confirmado');
      expect(turno.inicio.getTime()).toBe(instante('2026-11-02T10:00:00-03:00').getTime());
      expect(turno.fin.getTime()).toBe(instante('2026-11-02T10:30:00-03:00').getTime());
      expect(repositorio.todos()).toEqual([turno]);
    });

    it('la duración la define la prestación elegida (extracción de 60 minutos)', () => {
      const { servicio } = armarEscenario();

      const turno = servicio.crear(solicitud('2026-11-02T11:00:00-03:00', { prestacionId: PREST_EXTRACCION.id }));

      expect(turno.fin.getTime()).toBe(instante('2026-11-02T12:00:00-03:00').getTime());
    });
  });
  describe('rechazo de turnos en el pasado', () => {
    it('rechaza un turno con inicio en el pasado y no registra nada (CA-5)', () => {
      const { servicio, repositorio } = armarEscenario();

      expect(() => servicio.crear(solicitud('2026-11-01T10:00:00-03:00'))).toThrow(TurnoEnElPasadoError);
      expect(repositorio.todos()).toEqual([]);
    });
  });

  describe('borde del reloj (RN-TU-04)', () => {
    it('rechaza un turno cuyo inicio es exactamente igual a ahora', () => {
      const { servicio } = armarEscenario();

      expect(() => servicio.crear(solicitud('2026-11-02T08:00:00-03:00'))).toThrow(TurnoEnElPasadoError);
    });

    it('acepta un turno que empieza un minuto después de ahora', () => {
      const { servicio } = armarEscenario();

      const turno = servicio.crear(solicitud('2026-11-02T08:01:00-03:00'));

      expect(turno.estado).toBe('confirmado');
    });
  });

  describe('no solapamiento por profesional (RN-TU-01)', () => {
    it('rechaza un solapamiento parcial del mismo profesional en otro sillón y deja solo el turno existente (CA-2)', () => {
      const existente = consultaDeLas10(PROF_1.id, SILLON_1.id);
      const { servicio, repositorio } = armarEscenario([existente]);

      const error = capturarError(() =>
        servicio.crear(solicitud('2026-11-02T10:15:00-03:00', { sillonId: SILLON_2.id, pacienteId: PAC_2.id })),
      );

      expect(error).toBeInstanceOf(SolapamientoError);
      expect((error as SolapamientoError).recurso).toBe('profesional');
      expect(repositorio.todos()).toEqual([existente]);
    });

    it('rechaza un turno nuevo que contiene por completo a uno existente del profesional', () => {
      const existente = turnoExistente({
        profesionalId: PROF_1.id,
        sillonId: SILLON_1.id,
        inicio: '2026-11-02T10:15:00-03:00',
        fin: '2026-11-02T10:45:00-03:00',
      });
      const { servicio } = armarEscenario([existente]);

      const error = capturarError(() =>
        servicio.crear(
          solicitud('2026-11-02T10:00:00-03:00', {
            sillonId: SILLON_2.id,
            pacienteId: PAC_2.id,
            prestacionId: PREST_EXTRACCION.id,
          }),
        ),
      );

      expect(error).toBeInstanceOf(SolapamientoError);
      expect((error as SolapamientoError).recurso).toBe('profesional');
    });

    it('no genera conflicto con otro profesional en otro sillón en el mismo horario', () => {
      const existente = consultaDeLas10(PROF_1.id, SILLON_1.id);
      const { servicio } = armarEscenario([existente]);

      const turno = servicio.crear(
        solicitud('2026-11-02T10:00:00-03:00', { profesionalId: PROF_2.id, sillonId: SILLON_2.id, pacienteId: PAC_2.id }),
      );

      expect(turno.estado).toBe('confirmado');
    });
  });

  describe('no solapamiento por sillón (RN-TU-02)', () => {
    it('rechaza un solapamiento por sillón entre profesionales distintos y deja solo el turno existente (CA-3)', () => {
      const existente = turnoExistente({
        profesionalId: PROF_1.id,
        sillonId: SILLON_1.id,
        inicio: '2026-11-02T10:00:00-03:00',
        fin: '2026-11-02T11:00:00-03:00',
      });
      const { servicio, repositorio } = armarEscenario([existente]);

      const error = capturarError(() =>
        servicio.crear(solicitud('2026-11-02T10:30:00-03:00', { profesionalId: PROF_2.id, pacienteId: PAC_2.id })),
      );

      expect(error).toBeInstanceOf(SolapamientoError);
      expect((error as SolapamientoError).recurso).toBe('sillon');
      expect(repositorio.todos()).toEqual([existente]);
    });
  });

  describe('turnos contiguos (RN-TU-03)', () => {
    it('crea un turno que empieza cuando termina otro del mismo profesional y sillón, y quedan ambos registrados (CA-4)', () => {
      const existente = consultaDeLas10(PROF_1.id, SILLON_1.id);
      const { servicio, repositorio } = armarEscenario([existente]);

      const turno = servicio.crear(solicitud('2026-11-02T10:30:00-03:00', { pacienteId: PAC_2.id }));

      expect(turno.estado).toBe('confirmado');
      expect(turno.inicio.getTime()).toBe(instante('2026-11-02T10:30:00-03:00').getTime());
      expect(turno.fin.getTime()).toBe(instante('2026-11-02T11:00:00-03:00').getTime());
      expect(repositorio.todos()).toEqual([existente, turno]);
    });

    it('crea un turno que termina cuando empieza otro del mismo profesional y sillón', () => {
      const existente = turnoExistente({
        profesionalId: PROF_1.id,
        sillonId: SILLON_1.id,
        inicio: '2026-11-02T10:30:00-03:00',
        fin: '2026-11-02T11:00:00-03:00',
      });
      const { servicio } = armarEscenario([existente]);

      const turno = servicio.crear(solicitud('2026-11-02T10:00:00-03:00', { pacienteId: PAC_2.id }));

      expect(turno.estado).toBe('confirmado');
      expect(turno.fin.getTime()).toBe(instante('2026-11-02T10:30:00-03:00').getTime());
    });
  });

  describe('solo los turnos confirmados bloquean la agenda (SU-02)', () => {
    it('un turno cancelado no bloquea al profesional ni al sillón', () => {
      const cancelado = consultaDeLas10(PROF_1.id, SILLON_1.id, 'cancelado');
      const { servicio } = armarEscenario([cancelado]);

      const turno = servicio.crear(solicitud('2026-11-02T10:00:00-03:00', { pacienteId: PAC_2.id }));

      expect(turno.estado).toBe('confirmado');
    });
  });

  describe('un turno creado bloquea las creaciones posteriores', () => {
    it('rechaza por profesional un segundo turno solapado creado sobre el mismo repositorio', () => {
      const { servicio } = armarEscenario();
      servicio.crear(solicitud('2026-11-02T10:00:00-03:00'));

      const error = capturarError(() =>
        servicio.crear(solicitud('2026-11-02T10:15:00-03:00', { sillonId: SILLON_2.id, pacienteId: PAC_2.id })),
      );

      expect(error).toBeInstanceOf(SolapamientoError);
      expect((error as SolapamientoError).recurso).toBe('profesional');
    });
  });

  describe('orden de validación y primer error', () => {
    const turnoDeProf1EnSillon1 = (): Turno =>
      consultaDeLas10(PROF_1.id, SILLON_1.id);

    it('informa el turno en el pasado antes que el solapamiento', () => {
      const { servicio } = armarEscenario([turnoDeProf1EnSillon1()], instante('2026-11-02T12:00:00-03:00'));

      expect(() => servicio.crear(solicitud('2026-11-02T10:00:00-03:00', { pacienteId: PAC_2.id }))).toThrow(
        TurnoEnElPasadoError,
      );
    });

    it('informa el conflicto de profesional cuando coincide con el de sillón', () => {
      const { servicio } = armarEscenario([turnoDeProf1EnSillon1()]);

      const error = capturarError(() => servicio.crear(solicitud('2026-11-02T10:00:00-03:00', { pacienteId: PAC_2.id })));

      expect(error).toBeInstanceOf(SolapamientoError);
      expect((error as SolapamientoError).recurso).toBe('profesional');
    });

    it('informa el conflicto de profesional cuando además hay otro de sillón contra un turno distinto', () => {
      const { servicio } = armarEscenario([
        turnoExistente({
          id: 'turno-a',
          profesionalId: PROF_1.id,
          sillonId: SILLON_2.id,
          inicio: '2026-11-02T10:00:00-03:00',
          fin: '2026-11-02T10:30:00-03:00',
        }),
        turnoExistente({
          id: 'turno-b',
          profesionalId: PROF_2.id,
          sillonId: SILLON_1.id,
          inicio: '2026-11-02T10:00:00-03:00',
          fin: '2026-11-02T10:30:00-03:00',
        }),
      ]);

      const error = capturarError(() => servicio.crear(solicitud('2026-11-02T10:00:00-03:00')));

      expect(error).toBeInstanceOf(SolapamientoError);
      expect((error as SolapamientoError).recurso).toBe('profesional');
    });
  });

  describe('referencias inexistentes', () => {
    it.each([
      ['Profesional inexistente', 'profesional', { profesionalId: 'prof-999' }, 'prof-999'],
      ['Sillón inexistente', 'sillon', { sillonId: 'sillon-999' }, 'sillon-999'],
      ['Paciente inexistente', 'paciente', { pacienteId: 'pac-999' }, 'pac-999'],
      ['Prestación inexistente', 'prestacion', { prestacionId: 'prest-999' }, 'prest-999'],
    ] as const)('%s: rechaza identificando la entidad y el id, sin registrar nada', (_escenario, entidad, cambios, id) => {
      const { servicio, repositorio } = armarEscenario();

      const error = capturarError(() => servicio.crear(solicitud('2026-11-02T10:00:00-03:00', cambios)));

      expect(error).toBeInstanceOf(EntidadNoEncontradaError);
      expect((error as EntidadNoEncontradaError).entidad).toBe(entidad);
      expect((error as EntidadNoEncontradaError).id).toBe(id);
      expect(repositorio.todos()).toEqual([]);
    });

    it('informa la prestación inexistente antes que el turno en el pasado', () => {
      const { servicio, repositorio } = armarEscenario();

      const error = capturarError(() =>
        servicio.crear(solicitud('2026-11-01T10:00:00-03:00', { prestacionId: 'prest-999' })),
      );

      expect(error).toBeInstanceOf(EntidadNoEncontradaError);
      expect((error as EntidadNoEncontradaError).entidad).toBe('prestacion');
      expect((error as EntidadNoEncontradaError).id).toBe('prest-999');
      expect(repositorio.todos()).toEqual([]);
    });
  });

  describe('errores de dominio tipados', () => {
    it('el error de solapamiento es un SolapamientoError por sillón y también un ErrorDeDominio', () => {
      const { servicio } = armarEscenario([
        consultaDeLas10(PROF_1.id, SILLON_1.id),
      ]);

      const error = capturarError(() =>
        servicio.crear(solicitud('2026-11-02T10:00:00-03:00', { profesionalId: PROF_2.id, pacienteId: PAC_2.id })),
      );

      expect(error).toBeInstanceOf(SolapamientoError);
      expect((error as SolapamientoError).recurso).toBe('sillon');
      expect(error).toBeInstanceOf(ErrorDeDominio);
    });

    it('el error de turno en el pasado es un TurnoEnElPasadoError y también un ErrorDeDominio', () => {
      const { servicio } = armarEscenario();

      const error = capturarError(() => servicio.crear(solicitud('2026-11-01T10:00:00-03:00')));

      expect(error).toBeInstanceOf(TurnoEnElPasadoError);
      expect(error).toBeInstanceOf(ErrorDeDominio);
    });
  });

  describe('sobreturnos no soportados', () => {
    it('rechaza el mismo intervalo del mismo profesional en otro sillón', () => {
      const { servicio } = armarEscenario([
        consultaDeLas10(PROF_1.id, SILLON_1.id),
      ]);

      const error = capturarError(() =>
        servicio.crear(solicitud('2026-11-02T10:00:00-03:00', { sillonId: SILLON_2.id, pacienteId: PAC_2.id })),
      );

      expect(error).toBeInstanceOf(SolapamientoError);
      expect((error as SolapamientoError).recurso).toBe('profesional');
    });
  });

  describe('solapamiento por paciente no cubierto', () => {
    it('crea un turno para un paciente que ya tiene otro superpuesto con recursos distintos', () => {
      const { servicio, repositorio } = armarEscenario([
        turnoExistente({
          profesionalId: PROF_1.id,
          sillonId: SILLON_1.id,
          pacienteId: PAC_1.id,
          inicio: '2026-11-02T10:00:00-03:00',
          fin: '2026-11-02T10:30:00-03:00',
        }),
      ]);

      const turno = servicio.crear(
        solicitud('2026-11-02T10:00:00-03:00', { profesionalId: PROF_2.id, sillonId: SILLON_2.id, pacienteId: PAC_1.id }),
      );

      expect(turno.estado).toBe('confirmado');
      expect(repositorio.todos()).toHaveLength(2);
    });
  });
});

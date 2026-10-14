import { EntidadNoEncontradaError, type TipoDeEntidad } from '../errores/EntidadNoEncontradaError';
import { Turno } from '../entidades/Turno';
import type { CatalogoDeAgenda } from '../puertos/CatalogoDeAgenda';
import type { Reloj } from '../puertos/Reloj';
import type { RepositorioDeTurnos } from '../puertos/RepositorioDeTurnos';
import { validacionesDeCreacion } from './validaciones/validacionesDeCreacion';
import type { ValidacionDeTurno } from './validaciones/ValidacionDeTurno';
import { IntervaloTiempo } from '../value-objects/IntervaloTiempo';

export interface SolicitudDeTurno {
  readonly profesionalId: string;
  readonly sillonId: string;
  readonly pacienteId: string;
  readonly prestacionId: string;
  readonly inicio: Date;
}

export interface DependenciasDelServicio {
  readonly reloj: Reloj;
  readonly repositorio: RepositorioDeTurnos;
  readonly catalogo: CatalogoDeAgenda;
}

export class ServicioDeTurnos {
  private readonly validaciones: readonly ValidacionDeTurno[];

  constructor(private readonly dependencias: DependenciasDelServicio) {
    this.validaciones = validacionesDeCreacion(dependencias);
  }

  crear(solicitud: SolicitudDeTurno): Turno {
    const { repositorio, catalogo } = this.dependencias;
    this.resolverReferenciaDe('profesional', solicitud.profesionalId, catalogo.profesional(solicitud.profesionalId));
    this.resolverReferenciaDe('sillon', solicitud.sillonId, catalogo.sillon(solicitud.sillonId));
    this.resolverReferenciaDe('paciente', solicitud.pacienteId, catalogo.paciente(solicitud.pacienteId));
    const prestacion = this.resolverReferenciaDe(
      'prestacion',
      solicitud.prestacionId,
      catalogo.prestacion(solicitud.prestacionId),
    );
    const intervalo = IntervaloTiempo.desdeDuracion(solicitud.inicio, prestacion.duracionMinutos);
    for (const validacion of this.validaciones) {
      validacion.validar({ profesionalId: solicitud.profesionalId, sillonId: solicitud.sillonId, intervalo });
    }
    const turno = new Turno(
      repositorio.proximoId(),
      solicitud.profesionalId,
      solicitud.sillonId,
      solicitud.pacienteId,
      solicitud.prestacionId,
      intervalo,
      'confirmado',
    );
    repositorio.guardar(turno);
    return turno;
  }

  private resolverReferenciaDe<T>(entidad: TipoDeEntidad, id: string, encontrada: T | undefined): T {
    if (encontrada === undefined) {
      throw new EntidadNoEncontradaError(entidad, id);
    }
    return encontrada;
  }
}

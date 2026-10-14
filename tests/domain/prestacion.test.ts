import { describe, expect, it } from 'vitest';
import { DuracionInvalidaError } from '../../src/domain/errores/DuracionInvalidaError';
import { Prestacion } from '../../src/domain/entidades/Prestacion';

describe('Prestacion', () => {
  it('se construye con una duración válida de 30 minutos y conserva sus datos', () => {
    const prestacion = new Prestacion('prest-consulta', 'Consulta', 30);

    expect(prestacion.id).toBe('prest-consulta');
    expect(prestacion.nombre).toBe('Consulta');
    expect(prestacion.duracionMinutos).toBe(30);
  });

  it('rechaza una duración de cero minutos', () => {
    expect(() => new Prestacion('prest-cero', 'Sin duración', 0)).toThrow(DuracionInvalidaError);
  });

  it('rechaza una duración negativa', () => {
    expect(() => new Prestacion('prest-negativa', 'Duración negativa', -30)).toThrow(DuracionInvalidaError);
  });

  it('rechaza una duración no entera', () => {
    expect(() => new Prestacion('prest-fraccion', 'Duración fraccionaria', 30.5)).toThrow(DuracionInvalidaError);
  });
});

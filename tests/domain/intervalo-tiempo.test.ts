import { describe, expect, it } from 'vitest';
import { IntervaloInvalidoError } from '../../src/domain/errores/IntervaloInvalidoError';
import { IntervaloTiempo } from '../../src/domain/value-objects/IntervaloTiempo';

describe('IntervaloTiempo', () => {
  describe('construcción', () => {
    it('se construye con un inicio anterior al fin y conserva ambos instantes', () => {
      const intervalo = new IntervaloTiempo(
        new Date('2026-11-02T10:00:00-03:00'),
        new Date('2026-11-02T10:30:00-03:00'),
      );

      expect(intervalo.inicio).toEqual(new Date('2026-11-02T10:00:00-03:00'));
      expect(intervalo.fin).toEqual(new Date('2026-11-02T10:30:00-03:00'));
    });

    it('rechaza un intervalo vacío (inicio igual a fin)', () => {
      const instante = new Date('2026-11-02T10:00:00-03:00');

      expect(() => new IntervaloTiempo(instante, instante)).toThrow(IntervaloInvalidoError);
    });

    it('rechaza un intervalo invertido (inicio posterior a fin)', () => {
      const inicio = new Date('2026-11-02T10:30:00-03:00');
      const fin = new Date('2026-11-02T10:00:00-03:00');

      expect(() => new IntervaloTiempo(inicio, fin)).toThrow(IntervaloInvalidoError);
    });
  });

  describe('seSolapaCon', () => {
    const intervalo = (inicio: string, fin: string): IntervaloTiempo =>
      new IntervaloTiempo(new Date(inicio), new Date(fin));

    const A = intervalo('2026-11-02T10:00:00-03:00', '2026-11-02T10:30:00-03:00');

    it('se solapa con un intervalo que empieza un minuto antes de su fin', () => {
      const B = intervalo('2026-11-02T10:29:00-03:00', '2026-11-02T11:00:00-03:00');

      expect(A.seSolapaCon(B)).toBe(true);
    });

    it('no se solapa con un intervalo contiguo que empieza exactamente cuando termina', () => {
      const C = intervalo('2026-11-02T10:30:00-03:00', '2026-11-02T11:00:00-03:00');

      expect(A.seSolapaCon(C)).toBe(false);
    });

    it('no se solapa con un intervalo completamente disjunto, ni antes ni después', () => {
      const posterior = intervalo('2026-11-02T11:00:00-03:00', '2026-11-02T11:30:00-03:00');
      const anterior = intervalo('2026-11-02T09:00:00-03:00', '2026-11-02T09:30:00-03:00');

      expect(A.seSolapaCon(posterior)).toBe(false);
      expect(A.seSolapaCon(anterior)).toBe(false);
    });

    it('se solapa cuando uno contiene por completo al otro, en ambos sentidos', () => {
      const contenedor = intervalo('2026-11-02T09:45:00-03:00', '2026-11-02T10:45:00-03:00');
      const contenido = intervalo('2026-11-02T10:10:00-03:00', '2026-11-02T10:20:00-03:00');

      expect(A.seSolapaCon(contenedor)).toBe(true);
      expect(contenedor.seSolapaCon(A)).toBe(true);
      expect(A.seSolapaCon(contenido)).toBe(true);
      expect(contenido.seSolapaCon(A)).toBe(true);
    });
  });

  describe('desdeDuracion', () => {
    it('calcula el fin sumando 30 minutos al inicio', () => {
      const intervalo = IntervaloTiempo.desdeDuracion(new Date('2026-11-02T10:00:00-03:00'), 30);

      expect(intervalo.fin).toEqual(new Date('2026-11-02T10:30:00-03:00'));
    });

    it('calcula el fin sumando 60 minutos al inicio', () => {
      const intervalo = IntervaloTiempo.desdeDuracion(new Date('2026-11-02T11:00:00-03:00'), 60);

      expect(intervalo.fin).toEqual(new Date('2026-11-02T12:00:00-03:00'));
    });
  });
});

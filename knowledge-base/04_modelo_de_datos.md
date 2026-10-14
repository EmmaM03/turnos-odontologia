# Modelo de Datos

> Nota de alcance: no hay base de datos ni persistencia real (ver `02_descripcion_general.md`). Este archivo describe el **modelo de dominio** (entidades y value objects en memoria) que el módulo TypeScript modela y que los tests ejercitan. No hay esquema SQL, migraciones ni índices reales.

## Dominios

- **Agenda**: Turno, Sillon/Box, HorarioAtencion, IntervaloTiempo.
- **Catálogo**: Prestacion (con duración).
- **Personas**: Profesional, Paciente.

## ERD (Entity Relationship Diagram) — textual

```
Profesional (1) ──< tiene >── (N) HorarioAtencion
Profesional (1) ──< atiende >── (N) Turno
Sillon      (1) ──< ocupado en >── (N) Turno
Prestacion  (1) ──< define duración de >── (N) Turno
Paciente    (1) ──< titular de >── (N) Turno
```

- Un `Turno` referencia exactamente un `Profesional`, un `Sillon`, una `Prestacion` y un `Paciente`.
- Los `Sillon` son un recurso **compartido** entre profesionales — no hay relación fija Profesional↔Sillon (RN-RE-01 en `05_reglas_de_negocio.md`).
- Un `Profesional` tiene un `HorarioAtencion` por día de la semana (0 o más franjas por día).

## Entidades

### Turno
- Atributos: `id` (string/UUID), `profesionalId` (string), `sillonId` (string), `pacienteId` (string), `prestacionId` (string), `inicio` (DateTime, zona `America/Argentina/Buenos_Aires`), `fin` (DateTime, calculado = `inicio + duración de la prestación`), `estado` (`confirmado` | `cancelado` — MVP mínimo; `reprogramado` es un nuevo turno derivado, ver `07_flujos_principales.md`).
- Relaciones: pertenece a un Profesional, a un Sillon, a un Paciente, a una Prestacion.
- Constraints de dominio (no de base de datos):
  - El intervalo `[inicio, fin)` de un turno no puede solaparse con otro turno del mismo profesional en estado `confirmado` (RN-TU-01).
  - El intervalo `[inicio, fin)` de un turno no puede solaparse con otro turno del mismo sillón en estado `confirmado` (RN-TU-02).
  - `inicio` no puede ser una fecha/hora en el pasado respecto al momento de creación (RN-TU-04).
  - `[inicio, fin)` debe caer dentro del `HorarioAtencion` del profesional para ese día de la semana (RN-TU-06). Nota: RN-TU-06 se implementa en el change `C-06` (`horario-atencion-por-profesional`, ver `CHANGES.md`), no en `C-01` — en esta entrega (que solo implementa `C-01`) esta restricción queda documentada pero no validada en código.
- Índices relevantes: no aplica (sin persistencia). En una futura capa de persistencia, se recomendaría indexar por `(profesionalId, inicio)` y `(sillonId, inicio)` para las búsquedas de solapamiento.

### Profesional
- Atributos: `id`, `nombre`, `horariosAtencion` (lista de `HorarioAtencion`).
- Relaciones: tiene N `HorarioAtencion`; atiende N `Turno`.

### Sillon (Box)
- Atributos: `id`, `nombre`/`numero`.
- Relaciones: ocupado en N `Turno`. No tiene relación fija con ningún `Profesional` (RN-RE-01).

### Prestacion
- Atributos: `id`, `nombre`, `duracionMinutos` (entero positivo).
- Relaciones: define la duración de N `Turno`.

### Paciente
- Atributos: `id`, `nombre`, `datosDeContacto` (teléfono/email — siempre ficticios en ejemplos y tests, nunca datos reales).
- Relaciones: titular de N `Turno` (historial de turnos propio — entidad con identidad propia, no un dato suelto dentro del turno).

### HorarioAtencion (value object)
- Atributos: `diaSemana` (0-6), `horaInicio`, `horaFin` (dentro del día, zona `America/Argentina/Buenos_Aires`).
- Pertenece a un `Profesional`. Un profesional puede tener distintos horarios por día de la semana.

### IntervaloTiempo (value object)
- Atributos: `inicio`, `fin`, con la semántica `[inicio, fin)` — dos intervalos son solapados si y solo si `A.inicio < B.fin && B.inicio < A.fin`. Dos intervalos contiguos (uno termina exactamente cuando el otro empieza) **no** se consideran solapados (RN-TU-03).

## Seed data inicial

Para tests y ejemplos (siempre con datos ficticios):
- 1-2 `Profesional` con `HorarioAtencion` definido (p. ej. lunes a viernes 09:00-13:00 y 14:00-18:00).
- 1-2 `Sillon` (p. ej. "Box 1", "Box 2").
- 1-2 `Prestacion` (p. ej. "Consulta" 30 min, "Extracción" 60 min).
- 1-2 `Paciente` ficticios (p. ej. "Paciente de Prueba 1").

No hay seed data de producción — el sistema no tiene entorno productivo en este alcance.

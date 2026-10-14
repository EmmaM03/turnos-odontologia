# Proposal

## Why

El invariante central del sistema de turnos odontológicos es que **ni un profesional ni un sillón/box pueden quedar reservados dos veces en el mismo intervalo**. Hoy no existe código ni spec que lo garantice (`openspec/specs/` vacío, sin `src/`). `C-01` es la base que reutilizan todos los changes planificados (`C-02` a `C-06`) y tiene governance **CRÍTICO**, por lo que requiere un spec aprobado antes de escribir una sola línea de código.

## What Changes

- Se crea el módulo de dominio puro en TypeScript (greenfield): entidades `Turno`, `Profesional`, `Sillon`, `Prestacion`, `Paciente` y el value object `IntervaloTiempo` con semántica semiabierta `[inicio, fin)`.
- Se crea el servicio de dominio `ServicioDeTurnos.crear(...)`, que:
  - calcula `fin = inicio + prestacion.duracionMinutos` (RN-TU-05);
  - rechaza turnos con `inicio <= ahora` (RN-TU-04, borde estricto);
  - rechaza solapamientos por profesional (RN-TU-01) y por sillón (RN-TU-02) contra turnos `confirmado`, aceptando turnos contiguos (RN-TU-03);
  - aplica las validaciones en orden fijo pasado → profesional → sillón (gana el primero que falla), mediante una cadena extensible a la que `C-06` puede sumar un paso;
  - crea el turno en estado `confirmado` y lo guarda.
- Se definen puertos del dominio (interfaces) inyectados por constructor: `Reloj`, repositorio de turnos y catálogo de profesionales/sillones/pacientes/prestaciones. En tests se usan fakes en memoria.
- Se define la jerarquía de errores tipados (excepciones que extienden `ErrorDeDominio`): `TurnoEnElPasadoError`, `SolapamientoError` (con discriminante `recurso: 'profesional' | 'sillon'`), `EntidadNoEncontradaError`, y errores de invariante para `IntervaloTiempo` y `Prestacion`.
- Invariantes de construcción: `IntervaloTiempo` exige `inicio < fin`; `Prestacion.duracionMinutos` debe ser entero > 0.
- Se monta el scaffolding del proyecto: `package.json`, TypeScript con `strict: true`, Vitest y scripts de test/typecheck.
- Se agrega a `knowledge-base/10_preguntas_abiertas.md` la pregunta abierta sobre solapamiento por paciente (decisión D-01).

## Capabilities

### New Capabilities
- `gestion-de-turnos`: creación de turnos de la agenda del consultorio garantizando la ausencia de solapamientos por profesional y por sillón, el rechazo de turnos en el pasado, el cálculo de la duración desde la prestación y los errores de dominio tipados asociados. Es la capability que extenderán `C-03` (cancelar/reprogramar) y `C-06` (horario de atención).

### Modified Capabilities
- Ninguna (no existen specs previos en `openspec/specs/`).

## Impact

- **Código**: proyecto greenfield; no existe `src/`, `tests/`, `package.json`, `tsconfig.json` ni configuración de Vitest. Todo se crea en este change bajo `src/domain/{entidades,value-objects,servicios,errores,puertos}`.
- **Dependencias**: `typescript` y `vitest` como dependencias de desarrollo. El dominio no importa ninguna librería externa.
- **APIs**: no hay API HTTP ni UI; la superficie pública es `ServicioDeTurnos.crear`, los constructores de entidades/VOs, `IntervaloTiempo.seSolapaCon` y los puertos.
- **Documentación**: una fila nueva en `knowledge-base/10_preguntas_abiertas.md`.
- **Changes futuros**: `C-02`, `C-03`, `C-05` y `C-06` reutilizan entidades, puertos, la cadena de validaciones y el patrón de errores definidos acá.

### Fuera de alcance (explícito)

- **Solapamiento por paciente** (un mismo paciente con dos turnos superpuestos con distintos profesionales/sillones): no hay regla de negocio que lo exija; queda como pregunta abierta (D-01).
- **Horario de atención por profesional** (RN-TU-06, `FueraDeHorarioError`, `HorarioAtencion`): `C-06`. `Profesional` no lleva `horariosAtencion` en `C-01` (D-09).
- **Cancelar y reprogramar turnos** (RN-TU-07, RN-TU-08): `C-03`. `C-01` solo modela el estado `cancelado` para verificar que no bloquea.
- **ABM de prestaciones** y edición de duraciones: `C-02`.
- **ABM de pacientes** y `datosDeContacto`: `C-05`. `Paciente` tiene solo `id` y `nombre` (D-11).
- **Sobreturnos de urgencia**: no soportados; siempre se rechazan por RN-TU-01/02 (D-12).
- **Persistencia real, UI, API HTTP** y **concurrencia** de creación simultánea.

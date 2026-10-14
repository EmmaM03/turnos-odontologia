# Design

## Context

- Proyecto **greenfield**: no existe `src/`, `tests/`, `package.json`, `tsconfig.json` ni configuración de Vitest. Motivación y alcance: ver `proposal.md`. Comportamiento exigido: ver `specs/gestion-de-turnos/spec.md`.
- Es un **módulo de dominio puro** en TypeScript (DD-02, DD-03): sin UI, sin HTTP, sin persistencia. Todo se verifica con tests Vitest en memoria.
- Reglas duras del proyecto que condicionan el diseño: `strict: true` y nada de `any`; el dominio no importa librerías externas (los tests solo Vitest); no hay `new Date()` sin argumentos en el dominio (el reloj se inyecta); fechas en tests siempre ISO con `-03:00`; datos de pacientes siempre ficticios.
- Decisiones de dominio cerradas en el explore (`docs/evidencia/explore-c01.md`, D-01 a D-12). Este documento las traduce a estructura de código.
- Changes futuros que se apoyan en este diseño: `C-02` (duración de prestaciones), `C-03` (cancelar/reprogramar reutilizando la cadena de validaciones), `C-05` (extiende `Paciente`), `C-06` (agrega el paso de horario de atención a la cadena).

## Goals / Non-Goals

**Goals:**
- Un único punto de entrada `ServicioDeTurnos.crear` con dependencias explícitas e inyectadas (testeable sin reloj real ni persistencia).
- Un `IntervaloTiempo` que concentre la semántica `[inicio, fin)` y la fórmula de solapamiento en un solo lugar.
- Una cadena de validaciones ordenada y abierta a extensión: `C-06` agrega un paso y `C-03` la reutiliza sin reescribir los pasos existentes.
- Una jerarquía de errores tipados que los tests distingan con `toThrow(Clase)` sin parsear mensajes.

**Non-Goals:**
- Concurrencia o atomicidad entre "validar" y "guardar" (no hay persistencia real).
- Generación de IDs globalmente únicos (UUID): los IDs se generan de forma determinista detrás de un puerto.
- Formateo o parseo de fechas dentro del dominio: el dominio recibe y devuelve `Date`; el parseo ISO ocurre en los tests.
- Exponer en `SolapamientoError` el turno en conflicto (ver Open Questions).

## Decisions

### 1. Estructura de directorios

```
src/domain/
├── entidades/        Turno, Profesional, Sillon, Prestacion, Paciente
├── value-objects/    IntervaloTiempo
├── servicios/        ServicioDeTurnos
│   └── validaciones/ ValidacionDeTurno (interfaz), NoEnElPasado, ProfesionalLibre, SillonLibre
├── errores/          ErrorDeDominio, TurnoEnElPasadoError, SolapamientoError,
│                     EntidadNoEncontradaError, IntervaloInvalidoError, DuracionInvalidaError
└── puertos/          Reloj, RepositorioDeTurnos, CatalogoDeAgenda
tests/
├── domain/           tests por seam público (servicio, intervalo, constructores)
└── soporte/          fakes en memoria (RelojFijo, RepositorioDeTurnosEnMemoria,
                      CatalogoEnMemoria) y datos ficticios de referencia
```

Sigue `08_arquitectura_propuesta.md` y suma `puertos/` (D-02). Los fakes viven en `tests/` para que `src/domain` no contenga código exclusivo de tests. `HorarioAtencion` y `FueraDeHorarioError` **no** se crean (los agrega `C-06`, D-09).

- *Alternativa considerada*: tests junto a cada módulo (`*.test.ts` en `src/`). Se descarta para que el árbol del dominio quede limpio y la verificación "sin `new Date()` desnudo en `src/domain`" no tenga que excluir tests.

### 2. Puertos inyectados por constructor (D-02)

| Puerto | Contrato | Para qué |
|--------|----------|----------|
| `Reloj` | `ahora(): Date` | RN-TU-04 sin depender de la hora de la máquina. |
| `RepositorioDeTurnos` | `todos(): readonly Turno[]`, `guardar(turno: Turno): void`, `proximoId(): string` | Consultar turnos existentes y registrar el nuevo. |
| `CatalogoDeAgenda` | `profesional(id)`, `sillon(id)`, `paciente(id)`, `prestacion(id)`, cada uno devuelve la entidad o `undefined` | Resolver referencias (D-06) y obtener la duración (RN-TU-05). |

`ServicioDeTurnos` recibe un objeto `{ reloj, repositorio, catalogo }` en su constructor. El repositorio devuelve **todos** los turnos y el filtrado por estado `confirmado` y por recurso lo hacen las validaciones del dominio: así la regla SU-02 vive en el dominio y no en un fake.

- *Alternativa*: pasar `ahora` y la lista de turnos como argumentos de `crear`. Se descarta porque obliga a cada llamador a orquestar las dependencias y no sirve a `C-03`/`C-06`.
- *Alternativa*: un puerto `GeneradorDeIds` separado. Se descarta para no sumar un cuarto puerto; `proximoId()` en el repositorio basta para el alcance (el fake devuelve `turno-1`, `turno-2`, ...).

### 3. Entidades y value objects

- `IntervaloTiempo` (inmutable): `inicio: Date`, `fin: Date`. El constructor lanza `IntervaloInvalidoError` si `inicio.getTime() >= fin.getTime()` (D-08). Método `seSolapaCon(otro): boolean` = `this.inicio < otro.fin && otro.inicio < this.fin`, comparando milisegundos (RN-TU-03). Factoría `IntervaloTiempo.desdeDuracion(inicio, minutos)` que calcula `fin` en ms (`inicio.getTime() + minutos * 60_000`, D-10).
- `Prestacion`: `id`, `nombre`, `duracionMinutos`. El constructor lanza `DuracionInvalidaError` si la duración no es un entero > 0 (`Number.isInteger` y `> 0`, D-08).
- `Profesional`: `id`, `nombre` (sin `horariosAtencion`, D-09).
- `Sillon`: `id`, `nombre`.
- `Paciente`: `id`, `nombre` (sin `datosDeContacto`, D-11).
- `Turno`: `id`, `profesionalId`, `sillonId`, `pacienteId`, `prestacionId`, `intervalo: IntervaloTiempo` (con getters `inicio`/`fin`), `estado: EstadoTurno`. `type EstadoTurno = 'confirmado' | 'cancelado'` (D-07). `fin` queda materializado en el turno: un cambio futuro de la duración de la prestación (`C-02`) no es retroactivo.
- Todas las fechas son `Date` como instante absoluto (D-10); la zona única es `-03:00` y Argentina no tiene horario de verano, así que la aritmética en ms es exacta.

### 4. Flujo de `ServicioDeTurnos.crear`

Entrada: `SolicitudDeTurno = { profesionalId, sillonId, pacienteId, prestacionId, inicio: Date }` (objeto con nombre en lugar de 5 parámetros posicionales, para evitar confundir IDs del mismo tipo `string`).

1. **Resolver referencias** en orden profesional → sillón → paciente → prestación; la primera que falta lanza `EntidadNoEncontradaError(entidad, id)`. Va antes que las validaciones porque `fin` depende de la prestación.
2. **Calcular** el intervalo con `IntervaloTiempo.desdeDuracion(inicio, prestacion.duracionMinutos)` (RN-TU-05).
3. **Ejecutar la cadena de validaciones** en orden; la primera que lanza corta el flujo (D-04).
4. **Construir** `Turno` con `estado = 'confirmado'` e `id = repositorio.proximoId()`, **guardar** y **devolver**.

Si cualquier paso lanza, no se llama a `guardar`: no hay registros parciales.

### 5. Cadena de validaciones extensible (D-04)

```ts
interface ValidacionDeTurno {
  validar(candidato: TurnoCandidato): void; // lanza un ErrorDeDominio si no se cumple
}
// TurnoCandidato = { profesionalId, sillonId, intervalo }
```

`ServicioDeTurnos` mantiene un `readonly ValidacionDeTurno[]` construido por una función `validacionesDeCreacion({ reloj, repositorio })` que devuelve, en este orden:

1. `NoEnElPasado(reloj)` → `TurnoEnElPasadoError` si `intervalo.inicio.getTime() <= reloj.ahora().getTime()` (D-05, borde estricto).
2. `ProfesionalLibre(repositorio)` → `SolapamientoError('profesional')` si algún turno `confirmado` del mismo profesional se solapa.
3. `SillonLibre(repositorio)` → `SolapamientoError('sillon')` si algún turno `confirmado` del mismo sillón se solapa.

Extensión prevista:
- **C-06** agrega `DentroDelHorario(catalogo)` al final de la lista. No modifica los tres pasos existentes ni el servicio.
- **C-03** (reprogramar) reutiliza la misma lista. Para no chocar contra el propio turno que se reprograma, `TurnoCandidato` podrá sumar un `idExcluido` opcional; eso se decide en `C-03`, no acá.

- *Alternativa*: `if` secuenciales dentro de `crear`. Más simple hoy, pero `C-06` tendría que editar el método central (riesgo en un change CRÍTICO).
- *Alternativa*: acumular todos los errores. Se descarta: el spec fija "gana el primero que falla" y los tests esperan un único tipo de error.

### 6. Errores de dominio: excepciones tipadas (D-03)

```
ErrorDeDominio (abstract, extends Error)
├── TurnoEnElPasadoError
├── SolapamientoError          { readonly recurso: 'profesional' | 'sillon' }
├── EntidadNoEncontradaError   { readonly entidad: 'profesional' | 'sillon' | 'paciente' | 'prestacion'; readonly id: string }
├── IntervaloInvalidoError
└── DuracionInvalidaError
```

Cada clase fija `this.name` con su propio nombre. Los tests usan `expect(() => ...).toThrow(Clase)` y, para el discriminante, capturan el error y verifican `recurso`/`entidad`/`id`. El target de compilación (ES2022) preserva `instanceof` en subclases de `Error` sin `Object.setPrototypeOf`.

- *Alternativa*: `Result<Turno, ErrorDeDominio>`. Más explícito en la firma, pero agrega un tipo propio y verbosidad en un change chico; el explore eligió excepciones (D-03).

### 7. Seams de test (a confirmar con el usuario al iniciar `/opsx:apply`)

Según la skill `tdd`, solo se testea en fronteras públicas acordadas. Propuesta:

1. `ServicioDeTurnos.crear` con fakes en memoria (cubre la mayoría de los escenarios del spec).
2. `IntervaloTiempo`: constructor (invariante) y `seSolapaCon`.
3. Constructor de `Prestacion` (invariante de duración).
4. Tipos de error: verificados indirectamente a través de 1-3 (no hay tests aislados de clases de error).

Las validaciones individuales (`NoEnElPasado`, etc.) **no** son seams: se ejercitan a través de `crear`.

### 8. Scaffolding

- `package.json` con `"type": "module"`, scripts `test` (`vitest run`), `test:watch` (`vitest`) y `typecheck` (`tsc --noEmit`); dependencias de desarrollo `typescript` y `vitest` (versiones estables al instalar).
- `tsconfig.json` con `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`, `target: ES2022`, `module`/`moduleResolution` `Bundler`, `noEmit: true`, `include: ["src", "tests"]`.
- `vitest.config.ts` mínimo (`include: ['tests/**/*.test.ts']`, entorno `node`).

## Risks / Trade-offs

- [Los tests dependen de la zona horaria de la máquina] → Toda fecha se construye desde ISO con `-03:00` explícito y se compara por `getTime()`; nunca se usan getters locales (`getHours`, etc.) en el dominio ni en los tests.
- [El repositorio devuelve todos los turnos: O(n) por creación] → Aceptable sin persistencia; una futura capa indexaría por `(profesionalId, inicio)` y `(sillonId, inicio)` (ver `04_modelo_de_datos.md`).
- [Sin atomicidad entre validar y guardar] → Fuera de alcance (concurrencia es pregunta abierta Media); documentado como no-goal.
- [Un fake que filtre por estado ocultaría la regla SU-02] → El filtrado vive en las validaciones; el escenario del turno `cancelado` lo prueba a través del servicio.
- [Validar referencias antes que el pasado cambia qué error gana si coinciden] → Es inevitable (no hay `fin` sin prestación) y queda fijado en el spec (Requirement "Referencias inexistentes").
- [`C-03` necesitará excluir el propio turno al reprogramar] → `TurnoCandidato` está pensado para sumar un campo opcional sin romper las validaciones existentes.
- [Uso accidental de `any` o `new Date()` desnudo] → `strict: true` más una tarea final de verificación por búsqueda en `src/domain`.

## Migration Plan

No aplica: proyecto greenfield, sin datos ni despliegue. Rollback = revertir el commit.

## Open Questions

- ¿`SolapamientoError` debería exponer el id del turno en conflicto? Ningún escenario lo exige; se puede agregar como campo adicional en un change posterior sin romper los tests actuales.

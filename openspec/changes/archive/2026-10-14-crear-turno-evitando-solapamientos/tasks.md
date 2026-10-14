# Tasks

> Convenciones para todo el apply:
> - TDD estricto en slices verticales: un seam → un test que falla (RED) → el mínimo código para pasarlo (GREEN) → refactor con tests en verde. No se escribe código de producción sin un test rojo previo.
> - Cada tarea de comportamiento nombra el escenario de `specs/gestion-de-turnos/spec.md` que cubre. Los valores esperados salen del spec (literales), nunca se recalculan con la lógica bajo prueba.
> - Fechas siempre ISO con `-03:00`; datos ficticios de las "Convenciones de los escenarios" del spec; reloj fijo en `2026-11-02T08:00:00-03:00` salvo que el escenario diga otra cosa.
> - Verificación de cada tarea: `npm test` en verde (y `npm run typecheck` sin errores cuando se toca tipado).

## 1. Scaffolding del proyecto

- [x] 1.1 Crear `package.json` (`"type": "module"`, scripts `test` = `vitest run`, `test:watch` = `vitest`, `typecheck` = `tsc --noEmit`) e instalar `typescript` y `vitest` como devDependencies; verificar que `npm install` termina sin errores
- [x] 1.2 Crear `tsconfig.json` con `strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `target: ES2022`, `module`/`moduleResolution: Bundler`, `noEmit`, `include: ["src", "tests"]`; verificar con `npm run typecheck`
- [x] 1.3 Crear `vitest.config.ts` (`include: ['tests/**/*.test.ts']`, entorno `node`) y los directorios `src/domain/{entidades,value-objects,servicios/validaciones,errores,puertos}` y `tests/{domain,soporte}`; verificar que `npm test` corre (sin tests o con un test de humo que luego se elimina)
- [x] 1.4 Confirmar con el usuario los seams de test propuestos en `design.md` §7 (`ServicioDeTurnos.crear`, `IntervaloTiempo` constructor + `seSolapaCon`, constructor de `Prestacion`) antes de escribir el primer test; registrar la confirmación en este archivo
  - Confirmado por el usuario el 2026-10-14: seams de `design.md` §7 tal como se propusieron: (1) `ServicioDeTurnos.crear` con fakes en memoria, (2) `IntervaloTiempo` (constructor + `seSolapaCon`), (3) constructor de `Prestacion`; los errores se verifican solo indirectamente y las validaciones individuales no son seams.

## 2. Value object `IntervaloTiempo` (seam: constructor + `seSolapaCon`)

- [x] 2.1 RED/GREEN: intervalo válido se construye — escenario "Intervalo válido"; crea `ErrorDeDominio` (abstracta) e `IntervaloTiempo`; verificar `npm test`
- [x] 2.2 RED/GREEN: intervalo vacío y luego invertido lanzan `IntervaloInvalidoError` (extiende `ErrorDeDominio`) — escenarios "Intervalo vacío" e "Intervalo invertido"; verificar `npm test`
- [x] 2.3 RED/GREEN/TRIANGULATE: `seSolapaCon` — escenario "Intervalos solapados y contiguos" (A solapa con B, A no solapa con C), más un caso disjunto y uno de contención total; verificar `npm test`
- [x] 2.4 RED/GREEN: `IntervaloTiempo.desdeDuracion(inicio, minutos)` calcula `fin` en ms (10:00 + 30 → 10:30, 11:00 + 60 → 12:00, con `-03:00`); verificar `npm test`

## 3. Entidad `Prestacion` y entidades mínimas (seam: constructor de `Prestacion`)

- [x] 3.1 RED/GREEN: prestación con duración 30 se construye — escenario "Duración válida"; verificar `npm test`
- [x] 3.2 RED/GREEN/TRIANGULATE: duración 0, -30 y 30.5 lanzan `DuracionInvalidaError` — escenarios "Duración cero", "Duración negativa", "Duración no entera"; verificar `npm test`
- [x] 3.3 Crear `Profesional` (`id`, `nombre`, sin horarios), `Sillon` (`id`, `nombre`), `Paciente` (`id`, `nombre`, sin contacto), el tipo `EstadoTurno = 'confirmado' | 'cancelado'` y `Turno` (con `intervalo`, getters `inicio`/`fin`, `estado`) sin lógica propia; quedan cubiertos por los tests del servicio (sección 4); verificar `npm run typecheck`

## 4. `ServicioDeTurnos.crear` (seam: `crear` con fakes en memoria)

- [x] 4.1 Crear los puertos `Reloj`, `RepositorioDeTurnos` (`todos`, `guardar`, `proximoId`) y `CatalogoDeAgenda`, y en `tests/soporte/` los fakes `RelojFijo`, `RepositorioDeTurnosEnMemoria`, `CatalogoEnMemoria` y los datos ficticios de referencia del spec; verificar `npm run typecheck`
- [x] 4.2 RED/GREEN: caso feliz — escenario "Caso feliz con profesional y sillón libres (CA-1)": turno `confirmado`, intervalo `[10:00, 10:30)`, registrado en el repositorio; verificar `npm test`
- [x] 4.3 RED/GREEN (triangulación de RN-TU-05): escenario "La duración la define la prestación elegida" (`prest-extraccion` → fin 12:00); verificar `npm test`
- [x] 4.4 RED/GREEN: escenario "Turno con inicio en el pasado (CA-5)" → `TurnoEnElPasadoError`, nada registrado; introduce la cadena `validacionesDeCreacion` con `NoEnElPasado`; verificar `npm test`
- [x] 4.5 RED/GREEN: escenarios "Turno con inicio exactamente igual a ahora (borde)" (rechazo) y "Turno con inicio un minuto después de ahora" (acepta); verificar `npm test`
- [x] 4.6 RED/GREEN: escenario "Solapamiento parcial por profesional (CA-2)" → `SolapamientoError` con `recurso = 'profesional'`, solo queda el turno existente; agrega `ProfesionalLibre`; verificar `npm test`
- [x] 4.7 TRIANGULATE: escenarios "Turno nuevo que contiene por completo a uno existente del profesional" (rechazo) y "Otro profesional en otro sillón no genera conflicto" (acepta); verificar `npm test`
- [x] 4.8 RED/GREEN: escenario "Solapamiento por sillón entre profesionales distintos (CA-3)" → `SolapamientoError` con `recurso = 'sillon'`; agrega `SillonLibre`; verificar `npm test`
- [x] 4.9 RED/GREEN: escenarios "Turno que empieza cuando termina otro del mismo profesional y sillón (CA-4)" y "Turno que termina cuando empieza otro del mismo profesional y sillón" → ambos turnos registrados; verificar `npm test`
- [x] 4.10 RED/GREEN: escenario "Un turno cancelado no bloquea al profesional ni al sillón" (turno `cancelado` sembrado en el fake) → se crea; el filtrado por `confirmado` vive en las validaciones, no en el fake; verificar `npm test`
- [x] 4.11 RED/GREEN: escenario "Un turno creado bloquea las creaciones posteriores" (dos llamadas a `crear` sobre el mismo repositorio); verificar `npm test`
- [x] 4.12 RED/GREEN: orden de validación — escenarios "Turno en el pasado que además se solapa" (`TurnoEnElPasadoError`), "Conflicto simultáneo de profesional y sillón" y "Conflicto de profesional y de sillón contra turnos distintos" (ambos `recurso = 'profesional'`); verificar `npm test`
- [x] 4.13 RED/GREEN/TRIANGULATE: referencias inexistentes — escenarios "Profesional inexistente", "Sillón inexistente", "Paciente inexistente", "Prestación inexistente" → `EntidadNoEncontradaError` con `entidad` e `id` correctos y nada registrado; luego escenario de orden "Prestación inexistente con inicio en el pasado" → `EntidadNoEncontradaError` (paso 0 gana sobre el pasado); verificar `npm test`
- [x] 4.14 RED/GREEN: errores de dominio — escenarios "El error de solapamiento es reconocible como error de dominio" y "El error de turno en el pasado es reconocible como error de dominio" (`toThrow(ErrorDeDominio)` además de la clase concreta); verificar `npm test`
- [x] 4.15 Escenario "Intento de sobreturno del mismo profesional en otro sillón con el mismo intervalo" → `SolapamientoError` con `recurso = 'profesional'`; verificar `npm test` (debería pasar sin código nuevo; si pasa en verde de entrada, confirmar que falla al invertir temporalmente la condición de `ProfesionalLibre`)
- [x] 4.16 Escenario "Mismo paciente en dos turnos superpuestos con recursos distintos" → se crea (documenta que el solapamiento por paciente no se valida, D-01); verificar `npm test`
- [x] 4.17 REFACTOR: revisar nombres, eliminar duplicación en tests (builders de solicitudes con datos ficticios) y en validaciones (`ProfesionalLibre`/`SillonLibre`), sin cambiar comportamiento; verificar `npm test` en verde después de cada paso

## 5. Verificación final de integración y reglas duras

- [x] 5.1 Verificar que no hay `any` en `src/` ni en `tests/` (búsqueda de `: any`, `as any`, `<any>`, `any[]` sin resultados) y que `npm run typecheck` pasa con `strict: true`
- [x] 5.2 Verificar que no hay `new Date()` sin argumentos ni `Date.now()` en `src/domain` (búsqueda sin resultados) y que el dominio no importa nada fuera de `src/domain` (sin imports de paquetes npm)
- [x] 5.3 Verificar que todas las fechas literales de `tests/` tienen offset `-03:00` y que los datos de pacientes son los ficticios del spec
- [x] 5.4 Verificar trazabilidad: cada escenario de `specs/gestion-de-turnos/spec.md` tiene al menos un test con nombre en vocabulario de dominio que lo referencia; `npm test` completo en verde

## Workflow follow-up

- Revisar los artefactos y aprobar el spec (governance CRÍTICO) antes de `/opsx:apply`.
- Al terminar, `/opsx:archive crear-turno-evitando-solapamientos` y marcar `[x]` en `CHANGES.md` §C-01.

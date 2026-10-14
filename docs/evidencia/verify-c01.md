# Verify — C-01 `crear-turno-evitando-solapamientos`

- **Fecha:** 2026-10-14
- **Change:** `openspec/changes/crear-turno-evitando-solapamientos/` (schema `spec-driven`, 32/32 tasks)
- **Spec verificado:** `openspec/changes/crear-turno-evitando-solapamientos/specs/gestion-de-turnos/spec.md` (13 requisitos, 33 escenarios)
- **Método:** no existe una skill de verify de OpenSpec instalada (`opsx:*` disponibles: explore, propose, apply, update, sync, archive). Verificación manual: `openspec validate --strict`, `npm test`, `npm run typecheck` y trazabilidad escenario ↔ test leyendo el spec y los tres archivos de test.

## Resultado

| Chequeo | Resultado |
|---------|-----------|
| `openspec validate --strict` | ✅ válido (exit 0) |
| `npm test` | ✅ 3 archivos, 38/38 tests (exit 0) |
| `npm run typecheck` | ✅ sin errores (exit 0) |
| Escenarios sin test | ✅ 0 de 33 |
| Tests sin escenario | ✅ 4, justificados y aceptados por el usuario (ver [Tests sin escenario](#tests-sin-escenario)) |

## Salida de los comandos

```
$ openspec validate crear-turno-evitando-solapamientos --strict
Change 'crear-turno-evitando-solapamientos' is valid
EXIT validate: 0
```

```
$ npm test

> turnos-odontologia@0.1.0 test
> vitest run

 RUN  v5.0.4 C:/Users/Emmam/turnos-odontologia

 Test Files  3 passed (3)
      Tests  38 passed (38)
   Start at  14:48:27
   Duration  219ms (transform 53%, import 31%, tests 9%, worker 7%)

EXIT test: 0
```

```
$ npm run typecheck

> turnos-odontologia@0.1.0 typecheck
> tsc --noEmit

EXIT typecheck: 0
```

## Trazabilidad escenario → test

Archivos abreviados: **SDT** = `tests/domain/servicio-de-turnos.test.ts`, **IT** = `tests/domain/intervalo-tiempo.test.ts`, **PR** = `tests/domain/prestacion.test.ts`. Los nombres de test son el texto de `it(...)`; la línea es la del `it`.

| # | Requisito | Escenario | Archivo:línea | Test | Estado |
|---|-----------|-----------|---------------|------|--------|
| 1 | Creación de un turno confirmado… | Caso feliz con profesional y sillón libres (CA-1) | SDT:72 | crea un turno confirmado de 30 minutos con profesional y sillón libres (CA-1). También verifica las cuatro referencias del turno devuelto (requisito) | ✅ |
| 2 | Creación de un turno confirmado… | La duración la define la prestación elegida | SDT:83 | la duración la define la prestación elegida (extracción de 60 minutos) | ✅ |
| 3 | Creación de un turno confirmado… | Un turno creado bloquea las creaciones posteriores | SDT:226 | rechaza por profesional un segundo turno solapado creado sobre el mismo repositorio | ✅ |
| 4 | Rechazo de turnos en el pasado | Turno con inicio en el pasado (CA-5) | SDT:92 | rechaza un turno con inicio en el pasado y no registra nada (CA-5) | ✅ |
| 5 | Rechazo de turnos en el pasado | Turno con inicio exactamente igual a ahora (borde) | SDT:101 | rechaza un turno cuyo inicio es exactamente igual a ahora | ✅ |
| 6 | Rechazo de turnos en el pasado | Turno con inicio un minuto después de ahora | SDT:107 | acepta un turno que empieza un minuto después de ahora | ✅ |
| 7 | No solapamiento por profesional | Solapamiento parcial por profesional (CA-2) | SDT:117 | rechaza un solapamiento parcial del mismo profesional en otro sillón y deja solo el turno existente (CA-2) | ✅ |
| 8 | No solapamiento por profesional | Turno nuevo que contiene por completo a uno existente del profesional | SDT:130 | rechaza un turno nuevo que contiene por completo a uno existente del profesional | ✅ |
| 9 | No solapamiento por profesional | Otro profesional en otro sillón no genera conflicto | SDT:153 | no genera conflicto con otro profesional en otro sillón en el mismo horario | ✅ |
| 10 | No solapamiento por sillón | Solapamiento por sillón entre profesionales distintos (CA-3) | SDT:166 | rechaza un solapamiento por sillón entre profesionales distintos y deja solo el turno existente (CA-3) | ✅ |
| 11 | Turnos contiguos no se solapan | Turno que empieza cuando termina otro del mismo profesional y sillón (CA-4) | SDT:186 | crea un turno que empieza cuando termina otro del mismo profesional y sillón, y quedan ambos registrados (CA-4) | ✅ |
| 12 | Turnos contiguos no se solapan | Turno que termina cuando empieza otro del mismo profesional y sillón | SDT:198 | crea un turno que termina cuando empieza otro del mismo profesional y sillón | ✅ |
| 13 | Solo los turnos confirmados bloquean la agenda | Un turno cancelado no bloquea al profesional ni al sillón | SDT:215 | un turno cancelado no bloquea al profesional ni al sillón | ✅ |
| 14 | Orden de validación y primer error | Prestación inexistente con inicio en el pasado | SDT:302 | informa la prestación inexistente antes que el turno en el pasado | ✅ |
| 15 | Orden de validación y primer error | Turno en el pasado que además se solapa | SDT:243 | informa el turno en el pasado antes que el solapamiento | ✅ |
| 16 | Orden de validación y primer error | Conflicto simultáneo de profesional y sillón | SDT:251 | informa el conflicto de profesional cuando coincide con el de sillón | ✅ |
| 17 | Orden de validación y primer error | Conflicto de profesional y de sillón contra turnos distintos | SDT:260 | informa el conflicto de profesional cuando además hay otro de sillón contra un turno distinto | ✅ |
| 18 | Referencias inexistentes | Profesional inexistente | SDT:286 (`it.each`) | Profesional inexistente: rechaza identificando la entidad y el id, sin registrar nada | ✅ |
| 19 | Referencias inexistentes | Sillón inexistente | SDT:286 (`it.each`) | Sillón inexistente: rechaza identificando la entidad y el id, sin registrar nada | ✅ |
| 20 | Referencias inexistentes | Paciente inexistente | SDT:286 (`it.each`) | Paciente inexistente: rechaza identificando la entidad y el id, sin registrar nada | ✅ |
| 21 | Referencias inexistentes | Prestación inexistente | SDT:286 (`it.each`) | Prestación inexistente: rechaza identificando la entidad y el id, sin registrar nada | ✅ |
| 22 | Invariante de intervalo de tiempo | Intervalo válido | IT:7 | se construye con un inicio anterior al fin y conserva ambos instantes | ✅ |
| 23 | Invariante de intervalo de tiempo | Intervalo vacío | IT:17 | rechaza un intervalo vacío (inicio igual a fin) | ✅ |
| 24 | Invariante de intervalo de tiempo | Intervalo invertido | IT:23 | rechaza un intervalo invertido (inicio posterior a fin) | ✅ |
| 25 | Invariante de intervalo de tiempo | Intervalos solapados y contiguos | IT:37 + IT:43 | se solapa con un intervalo que empieza un minuto antes de su fin (A–B) · no se solapa con un intervalo contiguo que empieza exactamente cuando termina (A–C) | ✅ |
| 26 | Duración de la prestación válida | Duración válida | PR:6 | se construye con una duración válida de 30 minutos y conserva sus datos | ✅ |
| 27 | Duración de la prestación válida | Duración cero | PR:14 | rechaza una duración de cero minutos | ✅ |
| 28 | Duración de la prestación válida | Duración negativa | PR:18 | rechaza una duración negativa | ✅ |
| 29 | Duración de la prestación válida | Duración no entera | PR:22 | rechaza una duración no entera | ✅ |
| 30 | Errores de dominio tipados | El error de solapamiento es reconocible como error de dominio | SDT:317 | el error de solapamiento es un SolapamientoError por sillón y también un ErrorDeDominio | ✅ |
| 31 | Errores de dominio tipados | El error de turno en el pasado es reconocible como error de dominio | SDT:331 | el error de turno en el pasado es un TurnoEnElPasadoError y también un ErrorDeDominio | ✅ |
| 32 | Sobreturnos no soportados | Intento de sobreturno del mismo profesional en otro sillón con el mismo intervalo | SDT:342 | rechaza el mismo intervalo del mismo profesional en otro sillón | ✅ |
| 33 | Solapamiento por paciente explícitamente no cubierto | Mismo paciente en dos turnos superpuestos con recursos distintos | SDT:357 | crea un turno para un paciente que ya tiene otro superpuesto con recursos distintos | ✅ |

Para cada fila se comparó el GIVEN/WHEN/THEN del spec con el cuerpo del test: mismos ids (`prof-*`, `sillon-*`, `pac-*`, `prest-*`), mismos instantes `-03:00`, mismo "ahora" (`2026-11-02T08:00:00-03:00`, o `12:00` en el escenario 15) y mismas aserciones (tipo de error, `recurso`, `entidad`/`id`, estado, `fin`, contenido del repositorio).

**Conteo:** los 33 escenarios se cubren con 34 tests (el escenario 25 usa dos). 34 + 4 tests sin escenario = 38, que coincide con el total de `npm test`.

## Tests sin escenario

Estos tests no corresponden a ningún escenario del spec. Vienen de las tasks 2.3 y 2.4 de `tasks.md` (triangulación TDD), no del spec.

| Archivo:línea | Test | Origen | Relación con el spec |
|---------------|------|--------|----------------------|
| IT:49 | no se solapa con un intervalo completamente disjunto, ni antes ni después | task 2.3 | El texto del requisito "Invariante de intervalo de tiempo" remite a la fórmula RN-TU-03, pero ningún escenario lo describe. |
| IT:57 | se solapa cuando uno contiene por completo al otro, en ambos sentidos | task 2.3 | Ídem. A nivel servicio, la contención sí tiene escenario (#8). |
| IT:69 | calcula el fin sumando 30 minutos al inicio | task 2.4 | `desdeDuracion` no tiene escenario propio; el cálculo de `fin` se cubre a través del servicio en los escenarios #1 y #2. |
| IT:75 | calcula el fin sumando 60 minutos al inicio | task 2.4 | Ídem. |

✅ **Decisión (usuario, 2026-10-14): los 4 tests se quedan.**

**Justificación.** No agregan comportamiento nuevo: prueban, a nivel del value object `IntervaloTiempo`, reglas que el spec ya especifica.
- **IT:49 e IT:57** ejercitan la fórmula de solapamiento de RN-TU-03 (`A.inicio < B.fin` y `B.inicio < A.fin`). El requisito "Invariante de intervalo de tiempo" la cita explícitamente.
- **IT:69 e IT:75** ejercitan el cálculo `fin = inicio + duración en minutos` de RN-TU-05. El requisito "Creación de un turno confirmado con duración definida por la prestación" lo cita explícitamente.

**Diferencia con el test que se quitó.** El test "resuelve las referencias en orden profesional, sillón, paciente, prestación" sí inventaba una regla: el spec fija que la existencia de entidades se valida en el paso 0, pero no el orden entre las cuatro entidades. Por la regla dura 6 (si código y spec difieren, manda el spec) se eliminó. Los 4 tests de esta sección no imponen nada que el spec no diga, así que no entran en conflicto con esa regla.

## Observaciones (no bloquean)

1. **Referencias en el turno devuelto — resuelto.** El requisito "Creación de un turno confirmado…" dice que el turno "se devuelve con sus referencias, `inicio`, `fin` y estado", y originalmente ningún test lo comprobaba. Se agregaron al test de CA-1 (SDT:72) aserciones sobre `profesionalId = 'prof-1'`, `sillonId = 'sillon-1'`, `pacienteId = 'pac-1'` y `prestacionId = 'prest-consulta'`, con los valores literales del escenario. Pasaron en verde de entrada porque el comportamiento ya existía. Para probar que pueden fallar, se intercambiaron temporalmente `sillonId` y `pacienteId` en la construcción del `Turno` en `src/domain/servicios/ServicioDeTurnos.ts`: el test de CA-1 falló (`expected 'pac-1' to be 'sillon-1'`). Después se restauró el archivo desde una copia y la suite volvió a 38/38.
2. **Nombres de test.** Salvo los cuatro casos del `it.each`, los tests no usan el nombre literal del escenario: usan una descripción en vocabulario de dominio con la etiqueta CA-n cuando existe. La correspondencia es unívoca (tabla de arriba), pero no se puede buscar por nombre de escenario.
3. **Ubicación del escenario #3.** "Un turno creado bloquea las creaciones posteriores" pertenece al requisito de creación, pero su test está en un `describe` propio (SDT:225). Es solo cosmético.

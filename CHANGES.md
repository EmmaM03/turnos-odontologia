# CHANGES — Secuencia de Implementación

> Índice canónico de todos los changes del proyecto **Turnos Odontología**.
> Cada change es atómico: un agente puede implementarlo en una sesión (~4-6 horas).
> **Leer este archivo antes de ejecutar cualquier `/opsx:propose`.**
>
> ⚠️ **Alcance de esta entrega**: por ser un trabajo académico con entrega en 3 días, **solo `C-01` se implementa en código** (dominio puro TypeScript + Vitest, sin UI ni persistencia real). `C-02` a `C-05` quedan **planificados en este documento, NO implementados**. Ver `knowledge-base/01_vision_y_objetivos.md` §"Alcance de IMPLEMENTACIÓN en código".

---

## Cómo usar este documento

1. Identificar el change a implementar (verificar que sus dependencias están en `openspec/changes/archive/`).
2. Leer los docs de la knowledge-base indicados en "Leer antes".
3. Ejecutar `/opsx:propose <nombre-del-change>`.
4. Al terminar el change, archivarlo con `/opsx:archive <nombre-del-change>`.
5. Marcar el checkbox `[x]` en este archivo.

En esta entrega, el paso 3-4 solo se ejecuta para `C-01`. Para `C-02`–`C-05` este documento sirve como plan de referencia para una futura entrega, no hay ejecución prevista ahora.

---

## Árbol de dependencias

```
C-01 crear-turno-evitando-solapamientos        [IMPLEMENTADO EN ESTA ENTREGA]
  │   (incluye el diseño de la validación de horario de atención — RN-TU-06 —
  │    ver nota "Ubicación de RN-TU-06" más abajo)
  │
  ├── C-02 prestaciones-duracion-configurable   [PLANIFICADO — no implementado]
  ├── C-03 reprogramar-y-cancelar-turnos        [PLANIFICADO — no implementado]
  ├── C-04 vista-agenda-diaria-semanal          [PLANIFICADO — no implementado]
  └── C-05 registro-basico-pacientes            [PLANIFICADO — no implementado]
```

Los cuatro changes planificados dependen únicamente de `C-01` (reutilizan sus entidades y su `ServicioDeTurnos.crear`) y son independientes entre sí.

### Nota de decisión: ubicación de horario de atención (RN-TU-06)

El usuario pidió explícitamente ubicar la lógica de horario de atención por profesional (RN-TU-06) dentro del scope de `C-01` o de `C-03`. Decisión tomada: **dentro del scope de `C-01`**.

**Por qué**: `RN-TU-08` establece que reprogramar un turno "aplica las mismas validaciones que crearlo" (incluyendo RN-TU-01 a RN-TU-06). Si el diseño de la validación de horario de atención viviera en `C-03`, entonces `C-01` (el change que sí se implementa en esta entrega) quedaría con una cadena de validaciones incompleta respecto del dominio documentado, y `C-03` tendría que reabrir y modificar el servicio de dominio `ServicioDeTurnos.crear` ya cerrado por `C-01` para agregar la validación — rompiendo el principio de que cada change es atómico y no reabre código de un change anterior ya archivado. Ubicarla en `C-01` deja `ServicioDeTurnos.crear` como el único punto de validación, y `C-03` simplemente lo reutiliza sin duplicar ni reabrir lógica.

**Aclaración importante**: esto es una decisión de **diseño/scope documental**, no de implementación. En código, `C-01` solo implementa y testea RN-TU-01, RN-TU-02, RN-TU-03, RN-TU-04 y RN-TU-05 (ver `knowledge-base/05_reglas_de_negocio.md` y `knowledge-base/06_funcionalidades.md` §US-001). RN-TU-06 queda **documentada dentro del scope de C-01 pero no implementada en código ni cubierta por tests en esta entrega** — coherente con `knowledge-base/04_modelo_de_datos.md`, que marca la misma nota.

### Paralelismo por fase

```
GATE 0: ninguna
  → C-01 crear-turno-evitando-solapamientos   [único ejecutado en esta entrega]

GATE 1: C-01 ✓                                 ← FORK (4 paralelos, solo planificación)
  → C-02 prestaciones-duracion-configurable    [Agente A]
  → C-03 reprogramar-y-cancelar-turnos         [Agente B]
  → C-04 vista-agenda-diaria-semanal           [Agente C]
  → C-05 registro-basico-pacientes             [Agente A — tras C-02]
```

### Camino crítico (2 niveles — mínimo irreducible)

```
C-01 → C-02* / C-03* / C-04* / C-05*
```

\* Los cuatro changes planificados están al mismo nivel de profundidad y son igualmente indispensables para completar el MVP documentado en `knowledge-base/01_vision_y_objetivos.md` (ninguno es opcional ni es un refactor visual); no hay cadena lineal más larga porque ninguno depende de otro excepto de `C-01`. El camino crítico real de esta entrega es simplemente `C-01` (único nodo ejecutado).

### Plan óptimo con 3 agentes

> Nota: esta tabla documenta el plan de ejecución **si en el futuro se decide implementar el resto del MVP**. En esta entrega solo se ejecuta el Paso 1.

```
Paso │ Agente A (Catálogo/Pacientes)        │ Agente B (Validaciones/Estado) │ Agente C (Consultas/Vistas)
─────┼──────────────────────────────────────┼─────────────────────────────────┼──────────────────────────────
  1  │ C-01 crear-turno-...  (TODOS — único ejecutado en esta entrega, no requiere 3 agentes)
  2  │ C-02 prestaciones-duracion-config.   │ C-03 reprogramar-y-cancelar     │ C-04 vista-agenda-diaria-semanal
  3  │ C-05 registro-basico-pacientes       │        —                        │        —
```

---

## FASE 0 — Núcleo de agenda sin solapamientos

> Única fase con implementación de código en esta entrega. Cubre, como mínimo, los 3 escenarios exigidos (feliz, error de negocio, borde) con tests en verde.

### [C-01] `crear-turno-evitando-solapamientos`
- **Estado**: `[x]` **implementado en esta entrega** (único change de código; ver `knowledge-base/01_vision_y_objetivos.md`)
- **Scope**:
  - Entidades de dominio (in-memory, sin persistencia real): `Turno`, `Profesional` (con `HorarioAtencion`), `Sillon`, `Prestacion`, `Paciente`
  - Value Objects: `IntervaloTiempo` (semántica `[inicio, fin)`, RN-TU-03), `HorarioAtencion` (franja por día de semana, diseño para RN-TU-06 — ver nota de decisión arriba)
  - Servicio de dominio: `ServicioDeTurnos.crear(profesionalId, sillonId, pacienteId, prestacionId, inicio)` — calcula `fin = inicio + duración(prestación)` (RN-TU-05)
  - Validaciones implementadas y testeadas: no solapamiento por profesional (RN-TU-01), no solapamiento por sillón (RN-TU-02), intervalos contiguos no solapados (RN-TU-03), rechazo de turno en el pasado (RN-TU-04)
  - Validación diseñada pero **no implementada en código esta entrega**: horario de atención del profesional (RN-TU-06) — queda como punto de extensión documentado en `ServicioDeTurnos.crear` para que `C-03` la reutilice a futuro
  - Errores de dominio tipados: `SolapamientoError` (profesional | sillón), `TurnoEnElPasadoError`
  - Tests (Vitest): CA-1 caso feliz, CA-2 error de negocio (solapamiento profesional), CA-3 error de negocio (solapamiento sillón), CA-4 caso borde (turnos contiguos), CA-5 error de negocio (turno en el pasado) — ver `knowledge-base/06_funcionalidades.md` §US-001
- **Dependencias**: ninguna
- **Governance**: CRITICO (modelo core de dominio que todos los demás changes referencian; invariante de negocio central del sistema)
- **Leer antes**:
  - `knowledge-base/01_vision_y_objetivos.md`
  - `knowledge-base/04_modelo_de_datos.md` §Turno, §HorarioAtencion, §IntervaloTiempo
  - `knowledge-base/05_reglas_de_negocio.md` §RN-TU-01 a RN-TU-06
  - `knowledge-base/07_flujos_principales.md` §Flujo 1
  - `knowledge-base/08_arquitectura_propuesta.md` §Patrones aplicados

---

## FASE 1 — Completar el MVP documentado (planificado, no implementado en esta entrega)

> Los 4 changes de esta fase dependen únicamente de `C-01` y son independientes entre sí: pueden proponerse en paralelo cuando se decida continuar la implementación.

### [C-02] `prestaciones-duracion-configurable`
- **Estado**: `[ ]` planificado — no implementado en esta entrega
- **Scope**:
  - Extiende la entidad `Prestacion` (introducida en `C-01`) con alta/edición de `nombre` y `duracionMinutos`
  - Validación de negocio: `duracionMinutos` debe ser un entero positivo; rechazo de valores inválidos
  - Reutiliza sin duplicar el cálculo `fin = inicio + duración(prestación)` ya establecido en `ServicioDeTurnos.crear` (RN-TU-05)
  - Tests: alta de prestación válida, rechazo de duración ≤ 0, el cambio de duración afecta solo turnos nuevos (no es retroactivo a turnos ya creados)
- **Dependencias**: `C-01`
- **Governance**: MEDIO (afecta el cálculo de tiempo usado por la validación central de solapamientos)
- **Leer antes**:
  - `knowledge-base/04_modelo_de_datos.md` §Prestacion
  - `knowledge-base/05_reglas_de_negocio.md` §RN-TU-05
  - `knowledge-base/06_funcionalidades.md` §US-004
  - `knowledge-base/09_decisiones_y_supuestos.md`

---

### [C-03] `reprogramar-y-cancelar-turnos`
- **Estado**: `[ ]` planificado — no implementado en esta entrega
- **Scope**:
  - Cancelar: `Turno.estado` → `cancelado`; libera profesional y sillón de inmediato, sin penalidad en el MVP (RN-TU-07)
  - Reprogramar: valida el nuevo `inicio`/`fin` reutilizando la **misma** cadena de validaciones de `ServicioDeTurnos.crear` (`C-01`), incluyendo la validación de horario de atención (RN-TU-06, diseñada en `C-01`) (RN-TU-08)
  - Si la validación falla, el turno original permanece sin cambios (sin mutaciones parciales)
  - Errores de dominio: reutiliza `SolapamientoError` y `TurnoEnElPasadoError`; agrega `FueraDeHorarioError` si RN-TU-06 se implementa en este change
  - Tests: cancelar libera el horario (caso feliz), reprogramar exitoso, reprogramar rechazado por solapamiento, reprogramar rechazado por quedar fuera del horario de atención del profesional
- **Dependencias**: `C-01`
- **Governance**: MEDIO (máquina de estados del turno: confirmado → cancelado / reprogramado)
- **Leer antes**:
  - `knowledge-base/05_reglas_de_negocio.md` §RN-TU-06, §RN-TU-07, §RN-TU-08
  - `knowledge-base/06_funcionalidades.md` §US-002
  - `knowledge-base/07_flujos_principales.md` §Flujo 2
  - `knowledge-base/08_arquitectura_propuesta.md` §Domain Error tipado

---

### [C-04] `vista-agenda-diaria-semanal`
- **Estado**: `[ ]` planificado — no implementado en esta entrega
- **Scope**:
  - Consulta de turnos de un profesional para un día dado y para una semana dada (`profesionalId` + rango de fechas)
  - Respeta la zona horaria única `America/Argentina/Buenos_Aires`
  - Usa el `HorarioAtencion` del profesional (RN-TU-06, diseñado en `C-01`) para distinguir franjas libres de ocupadas
  - Tests: agenda diaria vacía, agenda diaria con turnos, agregación semanal (7 días), franjas fuera del horario de atención no se muestran como disponibles
- **Dependencias**: `C-01`
- **Governance**: BAJO (vista de solo lectura, sin mutación de estado)
- **Leer antes**:
  - `knowledge-base/04_modelo_de_datos.md` §Profesional, §HorarioAtencion
  - `knowledge-base/05_reglas_de_negocio.md` §RN-TU-06
  - `knowledge-base/06_funcionalidades.md` §US-003
  - `knowledge-base/07_flujos_principales.md` §Flujo 3

---

### [C-05] `registro-basico-pacientes`
- **Estado**: `[ ]` planificado — no implementado en esta entrega
- **Scope**:
  - Entidad `Paciente` con identidad propia (introducida mínimamente en `C-01`): alta con `nombre` + `datosDeContacto` (teléfono/email, siempre ficticios — RN-PA-02)
  - Mantiene historial de turnos propio (relación 1-N con `Turno`, ya modelada en `C-01`)
  - Validación de datos de contacto mínimos (formato, no vacíos)
  - Tests: alta de paciente válido, rechazo de datos de contacto vacíos/inválidos, consulta del historial de turnos de un paciente
- **Dependencias**: `C-01`
- **Governance**: BAJO (CRUD simple sobre entidad propia, sin lógica crítica de negocio)
- **Leer antes**:
  - `knowledge-base/04_modelo_de_datos.md` §Paciente
  - `knowledge-base/05_reglas_de_negocio.md` §RN-PA-01, §RN-PA-02
  - `knowledge-base/06_funcionalidades.md` §US-005
  - `knowledge-base/09_decisiones_y_supuestos.md`

---

## Fuera del MVP

> Sección de referencia a futuro, **sin numeración de change**. Nada de esta lista se planifica como `C-NN` ni se implementa en esta entrega ni en el roadmap de `C-01` a `C-05`. Ver `knowledge-base/01_vision_y_objetivos.md` §"Fuera de alcance" y `knowledge-base/06_funcionalidades.md` §"Funcionalidades opcionales".

- Recordatorios y confirmación automática de turnos por WhatsApp
- Reserva online 24/7 para pacientes
- Lista de espera
- Ficha clínica y odontograma
- Cobros con Mercado Pago y señas
- Facturación electrónica ARCA
- Integración con obras sociales y prepagas
- Reportes de ausentismo y campañas de recall

---

## Resumen

| Change | Nombre | Estado | Governance | Dependencias |
|---|---|---|---|---|
| `C-01` | crear-turno-evitando-solapamientos | **implementado en esta entrega** | CRITICO | ninguna |
| `C-02` | prestaciones-duracion-configurable | planificado, no implementado | MEDIO | `C-01` |
| `C-03` | reprogramar-y-cancelar-turnos | planificado, no implementado | MEDIO | `C-01` |
| `C-04` | vista-agenda-diaria-semanal | planificado, no implementado | BAJO | `C-01` |
| `C-05` | registro-basico-pacientes | planificado, no implementado | BAJO | `C-01` |

**Camino crítico de esta entrega**: `C-01` (único change ejecutado).
**Gates de paralelismo**: 2 (`GATE 0`, `GATE 1`).
**Change recomendado para empezar**: `C-01` (`crear-turno-evitando-solapamientos`) — ya implementado; para iniciar formalmente el ciclo OpenSpec sobre él: `/opsx:propose crear-turno-evitando-solapamientos`.

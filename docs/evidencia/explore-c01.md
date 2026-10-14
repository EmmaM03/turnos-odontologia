# Explore C-01 — `crear-turno-evitando-solapamientos`

- **Fecha**: 2026-10-13
- **Fase**: `/opsx:explore` (previa a `/opsx:propose`)
- **Estado OpenSpec al momento del explore**: sin changes activos, sin specs en `openspec/specs/`, `schema: spec-driven`.
- **Estado del código**: no existe `src/`, `tests/`, `package.json`, `tsconfig.json` ni config de Vitest. Todo se crea en C-01.
- **Fuentes leídas**: `CHANGES.md` (§C-01 y fronteras con C-02/C-03/C-05/C-06), `knowledge-base/04` a `10`, `AGENTS.md`/`CLAUDE.md`, `docs/discovery/checklist-discovery.md`.

> **Estado de las decisiones**: las 12 decisiones (D-01 a D-12) fueron confirmadas por el usuario el 2026-10-13. Explore **cerrado**.
> La columna "Recomendación" es la propuesta del explore; la columna "Decisión del usuario" es lo que vale para `/opsx:propose`.

---

## 1. Flujo propuesto de `ServicioDeTurnos.crear`

```
                      ServicioDeTurnos.crear(cmd)
                                |
   +-------------+    +---------v----------+    +------------------+
   | Reloj       |--->|  1. resolver refs   |<---| Catalogo         |
   | (ahora())   |    |  (prof, sillon,     |    | (prestaciones,   |
   +-------------+    |   paciente, prest.) |    |  prof, sillon..) |
                      +---------+----------+    +------------------+
                                |  fin = inicio + prestacion.duracion  (RN-TU-05)
                                v
                      +--------------------+
                      | 2. cadena de       |   [inicio, fin) semiabierto (RN-TU-03)
                      |    validaciones    |
                      |  a. no pasado      |   RN-TU-04  -> TurnoEnElPasadoError
                      |  b. prof libre     |   RN-TU-01  -> SolapamientoError{profesional}
                      |  c. sillon libre   |   RN-TU-02  -> SolapamientoError{sillon}
                      |  (d. horario C-06) |   <- C-06 se engancha aca sin reescribir
                      +---------+----------+
                                |  solo compara contra estado=confirmado (SU-02)
   +-------------+              v
   | Repositorio |<---- 3. guardar Turno{confirmado}
   | de turnos   |
   +-------------+
```

---

## 2. Tabla completa de ambigüedades e inconsistencias

| # | Tema | Hallazgo | Referencias | Impacto en C-01 |
|---|------|----------|-------------|-----------------|
| A-01 | Solapamiento por paciente | Ninguna RN-TU, ni US-001, ni Flujo 1 exigen que un paciente no tenga dos turnos superpuestos, aunque `crear` recibe `pacienteId`. Es un hueco, no una contradicción. | `05_reglas_de_negocio.md` RN-TU-01..05; `06_funcionalidades.md` §US-001; `07_flujos_principales.md` §Flujo 1 | Hay que decidir explícitamente si queda fuera y documentarlo en el spec. |
| A-02 | IDs inexistentes | No se define qué pasa si `profesionalId`, `sillonId`, `pacienteId` o `prestacionId` no existen. No hay error tipado para eso. | `CHANGES.md:86-87`; `07:11`; `08:44` | Sin definirlo, la implementación inventaría un comportamiento. |
| A-03 | Firma incompleta de `crear` | La firma `crear(profesionalId, sillonId, pacienteId, prestacionId, inicio)` no incluye reloj, turnos existentes ni catálogo de prestaciones, pero el servicio los necesita. `08:12` presenta el repositorio como "solo para tests". | `CHANGES.md:86`; `08:11-12`; `AGENTS.md:82` | Hay que definir puertos (interfaces) del dominio. Es la base que reutilizan C-02, C-03 y C-06. |
| A-04 | Result vs excepción | El flujo dice "se retorna/lanza" un error tipado; la arquitectura no lo resuelve. | `07:17`; `08` §Patrones; `CHANGES.md:89` | Condiciona cómo se escriben todos los tests. |
| A-05 | `SolapamientoError` con doble conflicto | Es un tipo con discriminante (profesional \| sillón). No se especifica qué pasa si chocan ambos, ni si el error expone el turno en conflicto. | `CHANGES.md:89`; `07:33-35` | Define el contrato del error. |
| A-06 | Orden de validaciones | Solo el Flujo 1 implica el orden pasado → profesional → sillón. Los CA no lo fijan. C-06 agrega un paso "adicional" sin posición definida. | `07:12-15`; `CHANGES.md:128` | Determina qué error gana si fallan varias reglas. |
| A-07 | Borde de RN-TU-04 | RN-TU-04 dice "posterior al momento de creación" (`inicio > ahora` estricto). El modelo dice "no puede estar en el pasado" (admitiría `inicio == ahora`). No se fija la precisión (ms vs minutos). | `05:12`; `04:33` | Ambigüedad en el caso `inicio == ahora`. |
| A-08 | Validez de la duración | `duracionMinutos` debe ser "entero positivo", pero su validación se asigna a C-02. En C-01 una duración ≤ 0 genera intervalos degenerados que nunca solapan. C-02 implica que `Turno` guarda `fin` materializado. | `04:46`; `CHANGES.md:109`, `:111`; `04:28` | Decidir si C-01 valida en el constructor de `Prestacion`. |
| A-09 | Invariante de `IntervaloTiempo` | La semántica `[inicio, fin)` es consistente en toda la KB, pero no se dice si admite `inicio >= fin`. | `04:58`; `05:11`; `01_vision:34`; `CHANGES.md:86` | Falta el invariante `inicio < fin`. |
| A-10 | Turno cancelado | Modelo, flujo y SU-02 coinciden en que solo bloquean los `confirmado`, pero RN-TU-01/02 no dicen "confirmado" y SU-02 es un supuesto derivado de RN-TU-07 (C-03). C-01 no tiene forma de crear un `cancelado`; SU-01 sugiere que alcanza con `confirmado`. | `04:28`, `04:31-32`; `07:14-15`; `09` SU-01, SU-02; `05:9-10` | Decidir si el tipo `Estado` incluye `cancelado` y si se testea que no bloquea (escenario fuera de CA-1..CA-5). |
| A-11 | Sobreturnos | El checklist de discovery dice "No se permiten sobreturnos ni solapamientos" (regla cerrada); la KB lo trata como pregunta abierta Alta, "no soportado". | `docs/discovery/checklist-discovery.md:76`; `10:25`; `05:27-29` | Mismo efecto en C-01 (rechazar siempre), pero inconsistente entre documentos. |
| A-12 | Horario de atención en C-01 | `Profesional` se define con `horariosAtencion`, pero C-06 dice que "extiende" la entidad. El seed incluye horarios que C-01 no puede construir. `06:39` vincula US-001 con RN-TU-06. La estructura de directorios incluye `FueraDeHorarioError`. | `04:38`, `04:63`; `CHANGES.md:84`, `:125-129`, `:136`; `06:39`; `07:60`; `08:34` | Decidir que `Profesional` en C-01 no lleva horarios. |
| A-13 | Representación de fechas | Se habla de `DateTime` en `America/Argentina/Buenos_Aires`, que TypeScript no tiene. Las reglas duras exigen ISO con `-03:00` y prohíben `new Date()` sin argumentos. Argentina no tiene horario de verano. | `04:28`; `07:11`; `09` DD-04; `AGENTS.md:82-83` | Decidir representación interna (`Date` vs string ISO). |
| A-14 | `Paciente` mínimo | `Paciente` es entidad de C-01 "introducida mínimamente", pero `datosDeContacto` ya figura en el modelo y C-05 la extiende. RN-PA-01 queda "no implementada". | `CHANGES.md:84`, `:179`; `04:50` | Definir los campos mínimos en C-01. |
| A-15 | Referencias cruzadas | `CHANGES.md:136` y `:168` remiten a US-001/US-003 sin sección. Las correcciones de citas de `10:16-18` ya están aplicadas. | `CHANGES.md:136`, `:168`; `10:16-18` | Menor; solo claridad documental. |
| A-16 | Gobernanza | C-01 es CRÍTICO y exige spec aprobado antes de implementar; `openspec/specs` está vacío. `01_vision:34` pide mínimo 3 escenarios; C-01 define 5. | `AGENTS.md:85`; `01_vision:34`; `CHANGES.md` §C-01 | El spec se crea con `/opsx:propose`. Sin conflicto. |

### Sin inconsistencias encontradas
- Semántica semiabierta `[inicio, fin)` y fórmula de solapamiento `A.inicio < B.fin && B.inicio < A.fin`: consistentes en toda la KB.
- Origen de la duración (la prestación, nunca ingresada a mano): inequívoco.
- Zona horaria única `America/Argentina/Buenos_Aires` (DD-04): consistente.

---

## 3. Decisiones

| # | Decisión | Recomendación del explore | Fundamento | Decisión del usuario |
|---|----------|---------------------------|------------|----------------------|
| D-01 | ¿Se valida solapamiento por paciente? (A-01) | **No** en C-01; documentarlo como explícitamente no cubierto en el spec y en `10_preguntas_abiertas.md`. | No hay regla de negocio que lo pida; agregarlo sería inventar una regla sin spec (regla dura). | **NO.** El solapamiento por paciente queda fuera de C-01, documentado como no cubierto en el spec y agregado a `10_preguntas_abiertas.md`, porque no inventamos reglas sin fuente. |
| D-02 | Cómo llegan reloj, turnos y prestaciones (A-03) | Puertos (interfaces) del dominio inyectados por constructor; fakes en memoria en tests. | Regla dura de reloj inyectado; `08` pide consultar turnos existentes. | **ACEPTADA** tal como se recomienda. |
| D-03 | Result vs excepción (A-04) | Lanzar errores tipados (`class ... extends ErrorDeDominio`); tests con `expect().toThrow(Clase)`. | `07` lo deja abierto; Result es más explícito pero más pesado para un solo change. | **Excepciones tipadas** que extienden `ErrorDeDominio`, testeadas con `toThrow`. |
| D-04 | Orden de validaciones (A-05, A-06) | Orden del Flujo 1: pasado → profesional → sillón; gana el primero que falla. Fijarlo en el spec. | Único orden implicado por la KB. | **ACEPTADA** tal como se recomienda. |
| D-05 | Borde `inicio == ahora` (A-07) | Rechazar: `inicio > ahora` estricto. | RN-TU-04 dice "posterior al momento de creación". | **ACEPTADA** tal como se recomienda. |
| D-06 | IDs inexistentes (A-02) | Error tipado `EntidadNoEncontradaError`. Agrega un escenario fuera de CA-1..CA-5. | No está en la KB; evita comportamiento inventado. | **ACEPTADA** tal como se recomienda. |
| D-07 | ¿`cancelado` existe y se testea? (A-10) | Incluir `cancelado` en el tipo `Estado` y un escenario que siembre un cancelado y verifique que no bloquea. | SU-02; asegura el contrato que usará C-03. | **ACEPTADA** tal como se recomienda. |
| D-08 | Invariantes de VOs (A-08, A-09) | `IntervaloTiempo` exige `inicio < fin`; `Prestacion.duracionMinutos` entero > 0 al construir. | Evita intervalos vacíos que nunca solapan. | **ACEPTADA** tal como se recomienda. |
| D-09 | ¿`Profesional` lleva horarios? (A-12) | No; C-06 lo extiende. | `CHANGES.md:125`. | **ACEPTADA** tal como se recomienda. |
| D-10 | Representación de fechas (A-13) | `Date` (instante absoluto); entrada en ISO con `-03:00`; aritmética en milisegundos. | DD-04; Argentina sin horario de verano. | **ACEPTADA** tal como se recomienda. |
| D-11 | Campos mínimos de `Paciente` (A-14) | `id` y `nombre` (ficticios); `datosDeContacto` queda para C-05. | C-05 la "extiende"; C-01 solo necesita la referencia. | **ACEPTADA** tal como se recomienda. |
| D-12 | Sobreturnos (A-11) | Tratar como no soportado: se rechazan siempre por RN-TU-01/02. | `05:27-29`, `10:25`. | **ACEPTADA** tal como se recomienda. |

> D-06 y D-07 agregan escenarios fuera de CA-1..CA-5. Por ser C-01 de governance **CRÍTICO**, requerían aprobación explícita del usuario: **aprobados**.

---

## 4. Cierre del explore y próximo paso

**Explore cerrado el 2026-10-13.** Todas las decisiones están confirmadas.

Pendientes que surgen de las decisiones, a resolver en `/opsx:propose`:

1. **D-01**: agregar a `knowledge-base/10_preguntas_abiertas.md` el solapamiento por paciente como pregunta abierta, y declararlo como no cubierto en el spec de C-01.
2. **D-06 y D-07**: sumar al spec dos escenarios además de CA-1..CA-5: entidad inexistente → `EntidadNoEncontradaError`, y turno `cancelado` que no bloquea.
3. Correr `/opsx:propose crear-turno-evitando-solapamientos` para volcar las decisiones en proposal, design, specs y tasks.

# Turnos Odontología

Trabajo de Integración de **Metodología I** (Tecnicatura Universitaria en Programación, UTN FRM): un sistema de gestión de turnos para consultorios odontológicos, desarrollado con **desarrollo dirigido por especificaciones (SDD)** usando **Active Stack** y **OpenSpec**.

Este repositorio contiene la **fundación del proyecto** (Discovery, knowledge base, roadmap y reglas del agente) y la implementación de **un único change**: `crear-turno-evitando-solapamientos` (C-01). Es un **módulo de dominio puro** en TypeScript: no tiene interfaz gráfica, base de datos ni API HTTP, y el comportamiento se verifica con tests automatizados.

- **Autor:** Miranda Emmanuel (trabajo individual)
- **Stack:** Node.js, TypeScript (`strict`), Vitest

---

## Cómo correr los tests

**Requisitos:** Node.js y npm (probado con Node.js v24 en Windows).

```bash
git clone https://github.com/EmmaM03/turnos-odontologia.git
cd turnos-odontologia
npm install
npm test
```

Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm test` | Corre los 38 tests una vez (Vitest) |
| `npm run test:watch` | Corre los tests en modo observación |
| `npm run typecheck` | Verifica los tipos con TypeScript en modo estricto, sin compilar |

No hace falta configurar variables de entorno ni claves de API. Todos los datos de los tests son **ficticios**.

---

## Qué hace el change implementado (C-01)

`ServicioDeTurnos.crear` crea un turno a partir de profesional, sillón/box, paciente, prestación e instante de inicio, y aplica estas reglas de negocio:

| Regla | Descripción |
|---|---|
| RN-TU-01 | Un profesional no puede tener dos turnos superpuestos. |
| RN-TU-02 | Un sillón/box no puede tener dos turnos superpuestos, aunque sean de profesionales distintos (el sillón es compartido). |
| RN-TU-03 | Los intervalos son `[inicio, fin)`: un turno que empieza justo cuando termina otro **no** se solapa. |
| RN-TU-04 | No se crean turnos en el pasado (la hora actual se inyecta como reloj; `inicio` debe ser estrictamente posterior). |
| RN-TU-05 | La duración del turno la define la prestación elegida (`fin = inicio + duración`). |

Orden de validación: (0) existencia de las entidades, (1) turno en el pasado, (2) solapamiento por profesional, (3) solapamiento por sillón. Cada rechazo es un error de dominio tipado (`SolapamientoError`, `TurnoEnElPasadoError`, `EntidadNoEncontradaError`, etc.).

**Fuera de alcance de este change**, documentado en el spec y en el roadmap: horario de atención por profesional (C-06), cancelar y reprogramar (C-03), solapamiento por paciente (pregunta abierta) y sobreturnos de urgencia (no soportados).

**Especificación:** [`openspec/specs/gestion-de-turnos/spec.md`](openspec/specs/gestion-de-turnos/spec.md), con 13 requisitos y 33 escenarios GIVEN/WHEN/THEN. El change archivado (proposal, design, tasks y spec delta) está en [`openspec/changes/archive/2026-10-14-crear-turno-evitando-solapamientos/`](openspec/changes/archive/2026-10-14-crear-turno-evitando-solapamientos/).

**Tests:** 38 tests en 3 archivos, todos en verde, con typecheck estricto sin errores. Los 33 escenarios del spec tienen al menos un test que los cubre; la tabla de trazabilidad escenario → test está en [`docs/evidencia/verify-c01.md`](docs/evidencia/verify-c01.md).

---

## Estructura del repositorio

```
turnos-odontologia/
├── AGENTS.md / CLAUDE.md           Reglas del agente (stack, KB, skills, roadmap y 6 reglas duras)
├── CHANGES.md                      Roadmap: changes C-01 a C-06
├── .active-orchestrator-state.json Estado de las fases de la fundación (Active Stack)
├── .atl/skill-registry.md          Skills instaladas y justificación de cada decisión
├── docs/
│   ├── discovery/                  Informe de Discovery (.md y .pdf) y checklist
│   └── evidencia/                  Verificación de fuentes, explore y verify de C-01, capturas
├── knowledge-base/                 10 archivos canónicos del dominio
├── openspec/                       Changes y specs de OpenSpec
├── src/domain/                     Entidades, value objects, servicios, errores y puertos
└── tests/                          Tests de Vitest y fakes en memoria
```

---

## Proceso seguido

| Etapa | Resultado | Dónde verlo |
|---|---|---|
| 0. Entorno | Active Stack instalado en modo Full | `docs/evidencia/` |
| 1. Fundación | `openspec init` y estado del orquestador | `openspec/`, `.active-orchestrator-state.json` |
| 2. Discovery | 20 sistemas relevados, matriz ponderada, análisis competitivo, MVP y **verificación manual de 5 fuentes** | `docs/discovery/`, `docs/evidencia/verificacion-fuentes.txt` |
| 3. Knowledge base | 10 archivos generados con `kb-creator` y corregidos | `knowledge-base/` |
| 4. Roadmap | `CHANGES.md` alineado al MVP del Discovery | `CHANGES.md` |
| 5. Skills y reglas | `tdd` y `vitest` instaladas (3 descartadas con justificación); `AGENTS.md` con regla propia | `.atl/skill-registry.md`, `AGENTS.md` |
| 6. Ciclo OPSX | Explore → Propose → Apply → Verify → Archive de C-01; 38 tests en verde | `docs/evidencia/explore-c01.md`, `docs/evidencia/verify-c01.md`, `openspec/` |
| 7. Memoria | Engram con decisiones recuperadas entre sesiones | Video de defensa |

En cada etapa se revisó lo que generó el agente antes de avanzar. Las correcciones más relevantes, hechas con la opción **Ajustar**, fueron:

- **Discovery:** totales de la matriz mal calculados (16 de 19), un MVP que contradecía el checklist, una resolución de ARCA con alcance y fecha inventados, y precios atribuidos a fuentes que no los contenían.
- **Knowledge base:** códigos de reglas cruzados, un caso borde fuera de alcance y métricas de éxito que no eran de producto.
- **Roadmap:** C-01 marcado como implementado antes de escribir código, y la regla de horario de atención sin un change que la implementara.
- **Spec de C-01:** orden de validación contradictorio entre dos requisitos y un escenario duplicado.
- **Implementación:** fechas esperadas en UTC (contra la regla de usar `-03:00`) y un test que afirmaba una regla que el spec no tenía, que se eliminó.

Los commits de este repositorio los hizo el autor a mano, etapa por etapa.

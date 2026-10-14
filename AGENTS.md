# Turnos Odontología — Instrucciones para Agentes

> Este archivo (y su copia `CLAUDE.md`) es lo PRIMERO que todo agente lee al entrar al repo.
> Generado a partir de `knowledge-base/` y `CHANGES.md`. No editar a mano sin re-sincronizar ambos archivos.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Lenguaje | TypeScript | LTS compatible con el Node.js instalado |
| Runtime | Node.js | versión ya instalada en el entorno de desarrollo |
| Testing | Vitest | última estable al momento de instalación |
| Persistencia | Ninguna (en memoria, dentro de los propios tests/fixtures) | N/A |
| UI | Ninguna | N/A |

Este proyecto es un **módulo de dominio puro** (sin UI, sin persistencia real, sin API HTTP en esta entrega): el comportamiento se verifica exclusivamente con tests Vitest que ejercitan entidades y servicios de dominio directamente, en memoria.

Detalle completo: [knowledge-base/02_descripcion_general.md](knowledge-base/02_descripcion_general.md)

---

## Base de Conocimiento

La fuente de verdad del dominio vive en `knowledge-base/`. **Leé el archivo relevante ANTES de implementar.**

| Archivo | Cuándo leerlo |
|---------|---------------|
| [01_vision_y_objetivos.md](knowledge-base/01_vision_y_objetivos.md) | Entender propósito, alcance del MVP documentado vs. alcance de implementación |
| [03_actores_y_roles.md](knowledge-base/03_actores_y_roles.md) | Odontólogo, recepcionista, administrador, paciente; RBAC conceptual |
| [04_modelo_de_datos.md](knowledge-base/04_modelo_de_datos.md) | Entidades (Turno, Profesional, Sillón, Prestación, Paciente), value objects, ERD textual |
| [05_reglas_de_negocio.md](knowledge-base/05_reglas_de_negocio.md) | Reglas codificadas RN-TU-*, RN-RE-*, RN-PA-* |
| [06_funcionalidades.md](knowledge-base/06_funcionalidades.md) | Historias de usuario US-001 a US-006 |
| [07_flujos_principales.md](knowledge-base/07_flujos_principales.md) | Flujos E2E (creación, reprogramación/cancelación, configuración) |
| [08_arquitectura_propuesta.md](knowledge-base/08_arquitectura_propuesta.md) | Patrones de dominio, estructura de directorios |
| [09_decisiones_y_supuestos.md](knowledge-base/09_decisiones_y_supuestos.md) | DD-01 a DD-04 y supuestos SU-01 a SU-03 |
| [10_preguntas_abiertas.md](knowledge-base/10_preguntas_abiertas.md) | ⚠️ Inconsistencias y preguntas a resolver ANTES de codear |

> ⚠️ Resolver las preguntas de prioridad **Alta** de `10_preguntas_abiertas.md` antes de arrancar el primer change. Ninguna de las dos preguntas Alta actuales (penalidad por cancelación tardía, política de sobreturnos de urgencia) bloquea `C-01`: ambas aplican a funcionalidad futura (`C-03` y post-MVP).

---

## Skills Disponibles

<!-- Fuente de verdad: .atl/skill-registry.md (generado por skill-registry). No re-escanear .claude/skills/. -->

| Agente | Rol | Skills que carga |
|--------|-----|------------------|
| **Domain Core** | Dominio TypeScript puro (entidades, value objects, servicios), TDD estricto con Vitest | `tdd`, `vitest` |
| **Orquestación** | Flujo de fundación SDD/OPSX y mantenimiento de artefactos del proyecto | `active-orchestrator`, `agent-instruction`, `kb-creator`, `roadmap-generator`, `discovery-research`, `find-skill`, `skill-creator`, `web-scraper` |

Cargá la skill correspondiente al contexto ANTES de escribir código.

> Los compact rules de cada skill los resuelve el orquestador desde `.atl/skill-registry.md` (generado por `skill-registry`; no versionado — no está en el repo). Esta tabla solo mapea skill→rol.

---

## Roadmap de Changes

<!-- Resumen de CHANGES.md — NO duplicar el detalle completo -->

El plan de implementación completo está en [CHANGES.md](CHANGES.md). Resumen:

- **Total**: 6 changes (`C-01` a `C-06`) en 2 fases (`FASE 0`, `FASE 1`).
- **Alcance de esta entrega**: por ser trabajo académico de 3 días, **solo `C-01` se implementa en código**. `C-02` a `C-06` quedan planificados en `CHANGES.md`, no implementados.
- **Camino crítico de esta entrega**: `C-01` (único nodo ejecutado). Camino crítico planificado a futuro: `C-01 → C-02*/C-05*` y `C-01 → C-06 → C-03*/C-04*`.
- **Primer change**: `C-01` (`crear-turno-evitando-solapamientos`) — estado `pendiente`, governance **CRÍTICO**.

**Antes de cualquier `/opsx:propose`**: leé [CHANGES.md](CHANGES.md), identificá las dependencias del change y los archivos de "Leer antes".

---

## Reglas Duras (específicas del proyecto)

Reglas globales ya definidas en `~/.claude/CLAUDE.md` (orquestador, governance, TDD, engram): el proyecto las hereda. Acá viven solo las reglas **específicas de este proyecto** + las universales que el global no cubra.

Confirmadas por el usuario (stack TypeScript + Vitest, dominio puro):

- **NUNCA** usar el tipo `any` en el módulo de dominio → `tsconfig` con `strict: true` obligatorio; tipar todo explícitamente.
- **NUNCA** importar infraestructura/UI/frameworks dentro del módulo de dominio → el dominio solo depende de TypeScript puro; en los tests, solo de Vitest.
- **NUNCA** usar `new Date()` sin argumentos dentro del dominio → el reloj se inyecta como parámetro (o se recibe el instante actual explícitamente); los tests no pueden depender de la hora ni la zona horaria de la máquina que los ejecuta.
- **NUNCA** escribir fechas sin offset explícito en tests y ejemplos → siempre ISO con offset `-03:00` (`America/Argentina/Buenos_Aires`), nunca fechas ambiguas sin zona.
- **NUNCA** usar datos reales de pacientes en fixtures o tests → siempre datos ficticios.
- **NUNCA** implementar un cambio de reglas de negocio sin un change de OpenSpec con spec aprobado → si el código y el spec difieren, manda el spec: se corrige el código, no el spec.

---

## Flujo de Trabajo

```
1. Leer la KB relevante (knowledge-base/)        → entender el dominio
2. Identificar el change en CHANGES.md           → respetar dependencias
3. /opsx:propose C-NN-nombre                     → proposal + design + specs + tasks
4. Implementar las tasks (cargando skills)       → respetando las reglas duras
5. /opsx:archive C-NN-nombre + marcar [x]        → cerrar el change
```

Aplicar TODAS las reglas duras en cada paso. Ante conflicto entre la KB y este archivo, las reglas duras prevalecen.

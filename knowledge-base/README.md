# turnos-odontologia — Base de Conocimiento

Base de conocimiento generada en **Modo A** (ingesta silenciosa) a partir de los documentos de Discovery del proyecto: `docs/discovery/checklist-discovery.md`, `docs/discovery/informe-discovery.md`, `docs/evidencia/verificacion-fuentes.txt` y la sección `discovery` de `.active-orchestrator-state.json`.

## Índice de Archivos

| Archivo | Contenido |
|---------|-----------|
| [01_vision_y_objetivos.md](01_vision_y_objetivos.md) | Propósito, objetivos por actor, alcance del MVP documentado vs. alcance de implementación (un único change), fuera de alcance |
| [02_descripcion_general.md](02_descripcion_general.md) | Naturaleza de dominio puro, stack Node.js + TypeScript + Vitest, arquitectura general, sin integraciones |
| [03_actores_y_roles.md](03_actores_y_roles.md) | Odontólogo, recepcionista/secretaria, administrador, paciente; matriz RBAC conceptual |
| [04_modelo_de_datos.md](04_modelo_de_datos.md) | Entidades de dominio (Turno, Profesional, Sillón, Prestación, Paciente), ERD textual, value objects |
| [05_reglas_de_negocio.md](05_reglas_de_negocio.md) | Reglas RN-TU-*, RN-RE-*, RN-PA-* — con marca de cuáles están implementadas en el change de código |
| [06_funcionalidades.md](06_funcionalidades.md) | Historias de usuario US-001 a US-006, con US-001 marcada como la única implementada |
| [07_flujos_principales.md](07_flujos_principales.md) | Flujo de creación de turnos (implementado), reprogramar/cancelar y configuración (documentados) |
| [08_arquitectura_propuesta.md](08_arquitectura_propuesta.md) | Patrones de dominio, estructura de directorios, seguridad y env vars (no aplica en este alcance) |
| [09_decisiones_y_supuestos.md](09_decisiones_y_supuestos.md) | DD-01 a DD-04 (alcance reducido, dominio puro, stack, zona horaria única) y supuestos SU-01 a SU-03 |
| [10_preguntas_abiertas.md](10_preguntas_abiertas.md) | Penalidad por cancelación tardía, sobreturnos de urgencia, concurrencia — todas sin inventar valores |

## Quick Start para Desarrolladores

1. Entender el dominio → [01](01_vision_y_objetivos.md), [03](03_actores_y_roles.md)
2. Entender los datos → [04](04_modelo_de_datos.md)
3. Entender las reglas → [05](05_reglas_de_negocio.md)
4. Entender la arquitectura → [02](02_descripcion_general.md), [08](08_arquitectura_propuesta.md)
5. Implementar → [07](07_flujos_principales.md), [06](06_funcionalidades.md)
6. Antes de codificar → [10](10_preguntas_abiertas.md)

## Resumen Ejecutivo

Sistema de gestión de turnos odontológicos para consultorios argentinos chicos/medianos, implementado como **módulo de dominio puro en Node.js + TypeScript**, verificado con Vitest, sin UI ni persistencia real. El MVP documentado aquí y en `CHANGES.md` es amplio (agenda, prestaciones, pacientes, vistas), pero en esta entrega académica de 3 días **solo se implementa en código un único change**: "Crear un turno evitando solapamientos por profesional y por sillón/box" (RN-TU-01 a RN-TU-05). El resto queda planificado, no construido. Contexto de mercado (20 competidores relevados, 5 priorizados: DentalTec, Dentia, Dentalink, Bilog, AgendaPro) disponible en `docs/discovery/informe-discovery.md`.

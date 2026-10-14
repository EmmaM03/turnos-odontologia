# Preguntas Abiertas

## Inconsistencias detectadas

Ninguna inconsistencia entre fuentes de Discovery detectada al generar esta Knowledge Base (checklist, informe de mercado, verificación de fuentes y `.active-orchestrator-state.json` son coherentes entre sí sobre el alcance, las reglas de negocio y el stack).

## Preguntas abiertas (priorizadas)

| Prioridad | Pregunta | Bloquea | Decisor |
|-----------|----------|---------|---------|
| Alta | ¿Existe penalidad por cancelación tardía? Sin definir en el checklist de Discovery; queda explícitamente para después del MVP (RN-TU-07 asume "sin penalidad" solo como default del MVP, no como decisión final). | Implementación de US-002 (reprogramar/cancelar) en una fase futura | Product Owner |
| Alta | ¿Cuál es la política de sobreturnos de urgencia? Sin definir en el checklist de Discovery. Mientras no se resuelva, el sistema no debe implementar ningún comportamiento especial de sobreturno — se trata como "no soportado". | Cualquier funcionalidad futura de sobreturnos; también afecta si RN-TU-01/RN-TU-02 admiten alguna excepción | Product Owner |
| Media | ¿Cómo se maneja la concurrencia de creación simultánea de turnos por varios usuarios? Identificado como riesgo en Discovery (sección 10), no probado ni resuelto — depende de que exista persistencia real, que está fuera de alcance de esta entrega. | Diseño de la futura capa de persistencia/infraestructura (post-MVP) | Equipo técnico |
| Media | Todas las funcionalidades marcadas como "No evidenciado" en `docs/discovery/informe-discovery.md` para los competidores relevados (p. ej. manejo real de conflictos de sillón/box en Órbita, OdontoApp y Dentalink — ver gap #7 del informe) quedan sin confirmar sobre cómo las resuelve el mercado; no bloquean el change implementado pero sí cualquier decisión de diferenciación de producto futura. | Decisiones de roadmap/producto post-MVP | Product Owner |
| Baja | ¿El informe de mercado (20 sistemas) es representativo del mercado argentino real? Señalado como supuesto sin probar en Discovery (sección 10) — ninguna de las fuentes fue validada con una demo hands-on, y varias cifras de precio/adopción son "dato del proveedor" sin auditoría independiente (ver `docs/evidencia/verificacion-fuentes.txt`, donde 2 de 5 fuentes verificadas manualmente no respaldaban lo citado originalmente). | Decisiones de posicionamiento de producto a futuro, no bloquea el MVP técnico | Product Owner |

## Notas sobre inferencia de campos `kb.discovery` (Mode A)

No fue necesario marcar ningún campo de `kb.discovery` como de baja confianza: el stack (`Node.js + TypeScript + Vitest`), el tipo de sistema (módulo de dominio puro, sin infraestructura), el dominio de negocio (gestión de turnos odontológicos) y la escala (consultorio chico/mediano, uso interno por recepcionista/odontólogo/administrador — no multi-tenant) están explícitos y sin ambigüedad en `docs/discovery/checklist-discovery.md` y en la sección `discovery` de `.active-orchestrator-state.json`.

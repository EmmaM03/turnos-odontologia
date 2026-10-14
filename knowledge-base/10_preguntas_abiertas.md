# Preguntas Abiertas

## Inconsistencias detectadas

### 1. Inconsistencia de precio de DentalCore entre fuentes (sin corregir — queda documentada)

La sección E "Verificación de fuentes" de `docs/discovery/informe-discovery.md` registra una inconsistencia de precio para **DentalCore** entre dos fuentes citadas en el informe de mercado:
- Web propia de DentalCore (`dentalcore.app`, según cita del informe original): Starter gratis / Pro USD 49/mes / Business USD 149/mes.
- Comparativa de Odonthia (`odonthia.com/blog/mejores-software-odontologicos-argentina-2026`): USD 50/mes con 2 usuarios incluidos, más USD 10 por usuario extra, con garantía de devolución de 14 días.

Ambas cifras no son conciliables entre sí (estructura de planes distinta: por tramos fijos vs. por usuario). No se resolvió cuál es la correcta — queda como dato "No evidenciado" de forma confiable, sin impacto en el MVP ni en el change implementado (es solo contexto de mercado).

### 2. Inconsistencias internas de la Knowledge Base (detectadas y corregidas el 2026-10-13)

Al revisar la KB se detectaron 3 inconsistencias internas, ya corregidas en esta misma fecha:
- **`04_modelo_de_datos.md`**: la restricción de horario de atención citaba el código **RN-TU-05** (que en realidad es la regla de duración del turno, definida por la prestación). Se corrigió la cita al código correcto, **RN-TU-06**, y se agregó la aclaración de que esa regla está documentada pero **no implementada** en el change de código actual.
- **`01_vision_y_objetivos.md`**: el listado de casos de borde del change implementado incluía "turno fuera del horario de atención del profesional", pero esa regla (RN-TU-06) no está implementada en el change de código. Se quitó ese caso borde, dejando únicamente el de turnos contiguos (`[inicio, fin)`).
- **`06_funcionalidades.md`**: en US-002, el criterio de aceptación CA-2 decía que reprogramar cubre "RN-TU-06 a RN-TU-08"; el rango correcto es **RN-TU-01 a RN-TU-06**. Se corrigió el rango.

## Preguntas abiertas (priorizadas)

| Prioridad | Pregunta | Bloquea | Decisor |
|-----------|----------|---------|---------|
| Alta | ¿Existe penalidad por cancelación tardía? Sin definir en el checklist de Discovery; queda explícitamente para después del MVP (RN-TU-07 asume "sin penalidad" solo como default del MVP, no como decisión final). | Implementación de US-002 (reprogramar/cancelar) en una fase futura | Product Owner |
| Alta | ¿Cuál es la política de sobreturnos de urgencia? Sin definir en el checklist de Discovery. Mientras no se resuelva, el sistema no debe implementar ningún comportamiento especial de sobreturno — se trata como "no soportado". | Cualquier funcionalidad futura de sobreturnos; también afecta si RN-TU-01/RN-TU-02 admiten alguna excepción | Product Owner |
| Media | ¿Cómo se maneja la concurrencia de creación simultánea de turnos por varios usuarios? Identificado como riesgo en Discovery (sección 10), no probado ni resuelto — depende de que exista persistencia real, que está fuera de alcance de esta entrega. | Diseño de la futura capa de persistencia/infraestructura (post-MVP) | Equipo técnico |
| Media | ¿Un mismo paciente puede tener dos turnos superpuestos con distintos profesionales y/o sillones? Ninguna regla (RN-TU-01 a RN-TU-05), ni US-001, ni el Flujo 1 lo prohíben, aunque el turno referencia al paciente. Decisión D-01 del explore de `C-01` (`docs/evidencia/explore-c01.md`): no se valida en `C-01` y queda declarado como no cubierto en el spec `gestion-de-turnos`; no se inventa la regla sin fuente. | Cualquier validación futura de solapamiento por paciente (requiere un change con spec aprobado); no bloquea `C-01` | Product Owner |
| Media | Todas las funcionalidades marcadas como "No evidenciado" en `docs/discovery/informe-discovery.md` para los competidores relevados (p. ej. manejo real de conflictos de sillón/box en Órbita, OdontoApp y Dentalink — ver gap #7 del informe) quedan sin confirmar sobre cómo las resuelve el mercado; no bloquean el change implementado pero sí cualquier decisión de diferenciación de producto futura. | Decisiones de roadmap/producto post-MVP | Product Owner |
| Baja | ¿El informe de mercado (20 sistemas) es representativo del mercado argentino real? Señalado como supuesto sin probar en Discovery (sección 10) — ninguna de las fuentes fue validada con una demo hands-on, y varias cifras de precio/adopción son "dato del proveedor" sin auditoría independiente (ver `docs/evidencia/verificacion-fuentes.txt`, donde 2 de 5 fuentes verificadas manualmente no respaldaban lo citado originalmente). | Decisiones de posicionamiento de producto a futuro, no bloquea el MVP técnico | Product Owner |

## Notas sobre inferencia de campos `kb.discovery` (Mode A)

No fue necesario marcar ningún campo de `kb.discovery` como de baja confianza: el stack (`Node.js + TypeScript + Vitest`), el tipo de sistema (módulo de dominio puro, sin infraestructura), el dominio de negocio (gestión de turnos odontológicos) y la escala (consultorio chico/mediano, uso interno por recepcionista/odontólogo/administrador — no multi-tenant) están explícitos y sin ambigüedad en `docs/discovery/checklist-discovery.md` y en la sección `discovery` de `.active-orchestrator-state.json`.

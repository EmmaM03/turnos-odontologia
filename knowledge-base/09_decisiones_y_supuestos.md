# Decisiones y Supuestos

## Decisiones documentadas

### DD-01 — Alcance de implementación reducido a un único change
**Decisión**: de todo el MVP documentado en esta Knowledge Base y en `CHANGES.md`, en código solo se implementa el change "Crear un turno evitando solapamientos por profesional y por sillón/box".
**Contexto**: trabajo académico con entrega en 3 días; la rúbrica de evaluación pide un change con al menos 3 escenarios verificables (feliz, error de negocio, borde) con tests en verde y archivado, no un producto completo.
**Alternativas consideradas**: implementar un subconjunto más amplio del MVP (p. ej. incluir también cancelar/reprogramar); se descartó por riesgo de no llegar a completar nada en verde dentro del plazo.
**Justificación**: un único change bien cubierto por tests es más defendible en la evaluación que varios changes a medio terminar.
**Trade-offs aceptados**: el resto del MVP queda solo planificado (roadmap), no demostrado en código.

### DD-02 — Módulo de dominio puro, sin UI ni persistencia real
**Decisión**: el sistema se implementa como un módulo de lógica de negocio en TypeScript, sin interfaz gráfica y sin base de datos real.
**Contexto**: el checklist de Discovery (sección 9, Restricciones) establece explícitamente "no hace falta interfaz gráfica — alcanza con un módulo de lógica de dominio con tests".
**Alternativas consideradas**: una API REST mínima con persistencia en memoria expuesta por HTTP; se descartó porque agrega superficie de implementación sin aportar valor a la evaluación de las reglas de negocio.
**Justificación**: foco total en la corrección de las reglas de no-solapamiento, que es lo que la rúbrica evalúa.
**Trade-offs aceptados**: no hay demo visual del sistema; todo se verifica por tests.

### DD-03 — Stack: Node.js + TypeScript + Vitest
**Decisión**: usar Node.js + TypeScript + Vitest como stack completo del proyecto.
**Contexto**: Node.js ya estaba instalado en el entorno de desarrollo; el checklist de Discovery (sección 9) indica "Stack: libre, elegido Node.js + TypeScript + Vitest".
**Alternativas consideradas**: ninguna otra evaluada explícitamente — elección directa por disponibilidad y familiaridad.
**Justificación**: minimizar fricción de setup dado el plazo de 3 días.
**Trade-offs aceptados**: ninguno relevante identificado.

### DD-04 — Zona horaria única
**Decisión**: el sistema opera en una sola zona horaria, `America/Argentina/Buenos_Aires`, sin soporte multi-zona.
**Contexto**: Discovery, sección 9 — "el MVP opera en una sola zona horaria; no se manejan múltiples zonas".
**Alternativas consideradas**: ninguna — decisión explícita del checklist, no una elección de diseño abierta.
**Justificación**: simplifica el cálculo de solapamientos (no hay que normalizar zonas).
**Trade-offs aceptados**: el sistema no sería válido tal cual para consultorios fuera de Argentina sin rediseño.

## Supuestos inferidos

### SU-01 — Estado de turno limitado a `confirmado` / `cancelado` en el MVP implementado
**Supuesto**: para el change implementado alcanza con que un turno nuevo se cree en estado `confirmado`; no se infiere un estado intermedio (p. ej. "pendiente de confirmación del paciente") porque la confirmación por el paciente es una funcionalidad post-MVP (recordatorios/WhatsApp).
**Origen**: inferido de Discovery sección 5 (funcionalidades necesarias) vs. sección 6 (opcionales, donde está la confirmación por WhatsApp).
**Riesgo si es falso**: si se asume mal el modelo de estados, el change implementado podría no encajar con el flujo de reprogramar/cancelar cuando se implemente después.
**Cómo validar**: confirmar con el usuario/evaluador si el modelo de estados de `04_modelo_de_datos.md` es suficiente para el change implementado (solo necesita `confirmado` para validar solapamientos).

### SU-02 — Validación de solapamiento solo contra turnos `confirmados`
**Supuesto**: las validaciones RN-TU-01/RN-TU-02 comparan el nuevo turno solo contra turnos existentes en estado `confirmado` (un turno `cancelado` no bloquea el horario).
**Origen**: se infiere de la regla "cancelar libera el horario del profesional y del sillón" (RN-TU-07) — si un turno cancelado siguiera bloqueando, cancelar no "liberaría" nada.
**Riesgo si es falso**: si en una fase futura se agregan más estados (p. ej. "pendiente"), habría que decidir explícitamente si bloquean o no.
**Cómo validar**: no bloqueante para el change implementado (no hay estado "pendiente" en este alcance); revisar si se agrega un estado intermedio en el roadmap.

### SU-03 — El informe de mercado (20 competidores) es contexto de negocio, no un requisito funcional directo
**Supuesto**: las funcionalidades diferenciadoras identificadas en `docs/discovery/informe-discovery.md` (p. ej. WhatsApp oficial de Meta, CDSS, certificaciones ISO 27001) son inspiración de roadmap futuro, no reglas de negocio a implementar en el MVP ni en el change actual.
**Origen**: el propio informe de mercado, sección D ("MVP sugerido"), alinea explícitamente su V1 con el checklist de Discovery del proyecto (sección 5) y deja el resto para V2+.
**Riesgo si es falso**: ninguno relevante para el change implementado — el riesgo solo existiría si alguien interpretara el informe de mercado como fuente de requisitos obligatorios del MVP, lo cual el propio informe desmiente.
**Cómo validar**: no bloqueante; ya validado por la nota de alineación explícita en la sección D del informe.

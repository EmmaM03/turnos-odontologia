# Reglas de Negocio

Cada regla tiene un código único `RN-{DOMINIO}-{NN}` para trazabilidad. Fuente primaria: `docs/discovery/checklist-discovery.md` (secciones 7 y 9) y la sección `discovery` de `.active-orchestrator-state.json`.

> Marca de implementación: las reglas marcadas **[IMPLEMENTADA]** son las que cubre el único change de código de esta entrega ("Crear un turno evitando solapamientos por profesional y por sillón/box", ver `01_vision_y_objetivos.md`). El resto está documentado para el MVP completo pero **no** se implementa en código en esta entrega.

## Dominio: Turnos (RN-TU)

- **RN-TU-01** [IMPLEMENTADA]: Un profesional no puede tener dos turnos superpuestos (no se permiten solapamientos por profesional).
- **RN-TU-02** [IMPLEMENTADA]: Un sillón/box no puede tener dos turnos superpuestos (no se permiten solapamientos por sillón/box) — justificación: el sillón es un recurso físico compartido entre profesionales (ver RN-RE-01), por lo que el conflicto de sillón es independiente del conflicto de profesional.
- **RN-TU-03** [IMPLEMENTADA]: Los intervalos de un turno son `[inicio, fin)` — un turno que empieza exactamente cuando termina otro NO se considera solapado. Dos intervalos A y B solapan si y solo si `A.inicio < B.fin && B.inicio < A.fin`.
- **RN-TU-04** [IMPLEMENTADA]: No se pueden crear turnos en el pasado (la fecha/hora de inicio debe ser posterior al momento de creación).
- **RN-TU-05** [IMPLEMENTADA]: La duración del turno la define la prestación elegida (ej. control 30 min, extracción 60 min) — el `fin` del turno se calcula como `inicio + duración de la prestación`, no se ingresa manualmente.
- **RN-TU-06** [documentada, no implementada]: Cada profesional tiene su propio horario de atención por día de la semana; no se pueden dar turnos fuera de ese horario.
- **RN-TU-07** [documentada, no implementada]: Cancelar un turno libera el horario del profesional y del sillón. En el MVP documentado no hay penalidad por cancelar tarde (ver `10_preguntas_abiertas.md`, pregunta de prioridad Alta).
- **RN-TU-08** [documentada, no implementada]: Reprogramar un turno aplica las mismas validaciones que crearlo (incluyendo RN-TU-01 a RN-TU-06, con rechazo si el nuevo horario cae fuera del horario de atención del profesional o genera un solapamiento).

## Dominio: Recursos (RN-RE)

- **RN-RE-01** [documentada, relevante para el change implementado]: Los sillones/boxes son un recurso **compartido** entre profesionales — no existe un sillón fijo asignado a un profesional. Esto es lo que justifica que RN-TU-02 (solapamiento por sillón) sea una validación independiente de RN-TU-01 (solapamiento por profesional): dos profesionales distintos pueden chocar por el mismo sillón aunque no choquen entre sí por agenda propia.

## Dominio: Pacientes (RN-PA)

- **RN-PA-01** [documentada, no implementada en el change]: El paciente es una entidad con identidad propia (no un dato suelto dentro del turno) — puede tener historial de turnos.
- **RN-PA-02** [regla de proceso, aplica a todo el proyecto, incluidos tests]: Nunca se usan datos reales de pacientes; todo ejemplo, fixture o dato de test debe ser ficticio.

## Dominio: Excepciones globales

- Ninguna regla de este dominio tiene excepciones documentadas en el MVP. Dos riesgos quedan explícitamente abiertos y **no** están resueltos como regla de negocio (ver `10_preguntas_abiertas.md`): la penalidad por cancelación tardía y la política de sobreturnos de urgencia. Hasta que se resuelvan, el sistema no debe implementar ningún comportamiento especial para esos dos casos — se tratan como "no soportado" en el MVP, nunca se debe inventar un valor.

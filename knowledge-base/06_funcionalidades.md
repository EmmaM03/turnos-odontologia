# Funcionalidades

Organizadas por **épica** y luego por **historia de usuario** (formato US-NNN). Fuente: `docs/discovery/checklist-discovery.md` (secciones 3, 5 y 6).

> Marca de implementación: solo **US-001** corresponde al único change implementado en código en esta entrega (ver `01_vision_y_objetivos.md`). El resto son historias del MVP documentado, planificadas en `CHANGES.md` pero no implementadas.

## Épica 1: Gestión de turnos (MVP necesario)

### US-001 — Crear un turno evitando solapamientos por profesional y por sillón/box [IMPLEMENTADA — único change de código de esta entrega]
**Como** recepcionista/secretaria
**Quiero** crear un turno eligiendo profesional, sillón y prestación
**Para** que el sistema evite solapamientos de agenda

**Criterios de aceptación**:
- [ ] CA-1 (caso feliz): se crea el turno cuando el profesional y el sillón están libres en el intervalo `[inicio, fin)` calculado a partir de la prestación.
- [ ] CA-2 (error de negocio): se rechaza la creación si el profesional ya tiene otro turno que se solapa (RN-TU-01).
- [ ] CA-3 (error de negocio): se rechaza la creación si el sillón ya tiene otro turno que se solapa (RN-TU-02).
- [ ] CA-4 (borde): dos turnos contiguos (uno termina exactamente cuando el otro empieza) no se consideran solapados y ambos se crean correctamente (RN-TU-03).
- [ ] CA-5 (error de negocio): se rechaza la creación si `inicio` está en el pasado (RN-TU-04).

**Reglas relacionadas**: RN-TU-01, RN-TU-02, RN-TU-03, RN-TU-04, RN-TU-05, RN-RE-01.

### US-002 — Reprogramar o cancelar un turno [documentada, no implementada]
**Como** recepcionista/secretaria
**Quiero** reprogramar o cancelar un turno
**Para** liberar el horario

**Criterios de aceptación**:
- [ ] CA-1: cancelar un turno libera el horario del profesional y del sillón, sin penalidad (MVP).
- [ ] CA-2: reprogramar aplica las mismas validaciones que crear un turno nuevo (RN-TU-06 a RN-TU-08).

**Reglas relacionadas**: RN-TU-07, RN-TU-08.

### US-003 — Ver agenda diaria y semanal por profesional [documentada, no implementada]
**Como** odontólogo
**Quiero** ver mi agenda diaria y semanal
**Para** organizar mi jornada

**Reglas relacionadas**: RN-TU-06.

### US-004 — Configurar duración de prestaciones [documentada, no implementada]
**Como** administrador
**Quiero** configurar la duración de cada prestación
**Para** que los turnos ocupen el tiempo real

**Reglas relacionadas**: RN-TU-05.

### US-005 — Registro básico de pacientes [documentada, no implementada]
**Como** recepcionista/secretaria
**Quiero** registrar los datos de contacto de un paciente
**Para** asociar el turno a una persona con identidad propia

**Reglas relacionadas**: RN-PA-01, RN-PA-02.

## Épica 2: Confirmación y recordatorios [documentada, post-MVP — no implementada]

### US-006 — Recibir recordatorio y confirmar turno
**Como** paciente
**Quiero** recibir un recordatorio y confirmar mi turno
**Para** no olvidarme

**Nota**: requiere integración externa (WhatsApp/email), fuera de alcance del MVP documentado (ver `docs/discovery/checklist-discovery.md`, sección 8).

## Funcionalidades opcionales (post-MVP, solo roadmap — ver `docs/discovery/informe-discovery.md` para contexto de mercado)

- Recordatorios y confirmación automática por WhatsApp.
- Reserva online 24/7 para pacientes.
- Lista de espera.
- Ficha clínica y odontograma.
- Cobros con Mercado Pago y señas.
- Facturación electrónica ARCA.
- Integración con obras sociales y prepagas.
- Reportes de ausentismo y campañas de recall.

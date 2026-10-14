# Visión y Objetivos

## Propósito del sistema

Digitalizar la gestión de turnos de consultorios odontológicos chicos y medianos de Argentina, evitando solapamientos de agenda por profesional y por sillón/box, para reemplazar la gestión manual (WhatsApp, papel, planilla) y reducir el ausentismo.

Consultorios con uno o varios profesionales y sillones hoy gestionan su agenda a mano. Esto genera errores de doble reserva (un profesional o un sillón con dos turnos superpuestos), falta de visibilidad de la disponibilidad real y ausentismo no gestionado. El sistema resuelve el núcleo de ese problema: la asignación de turnos sin conflictos de recursos (profesional, sillón/box) respetando duración de la prestación y horario de atención.

## Objetivos por actor

| Actor | Objetivo principal | Objetivos secundarios |
|---|---|---|
| Odontólogo | Ver su agenda diaria/semanal sin solapamientos | Organizar su jornada; confiar en que el sistema no le asigna dos pacientes a la vez |
| Recepcionista/secretaria | Crear, reprogramar y cancelar turnos sin generar conflictos | Elegir profesional, sillón y prestación en una sola operación; liberar el horario al cancelar |
| Dueño/administrador del consultorio | Configurar profesionales, sillones, prestaciones y horarios | Ver reportes (post-MVP); asegurar el uso eficiente de sillones compartidos |
| Paciente | Tener un turno reservado y confirmado sin errores de superposición | Recibir recordatorio y confirmar turno (post-MVP); reservar online (post-MVP) |

## Alcance v1 (MVP documentado en esta Knowledge Base y en `CHANGES.md`)

- Agenda multi-profesional y multi-sillón con prevención de solapamientos por profesional y por sillón/box.
- Prestaciones con duración configurable (la duración del turno la define la prestación elegida).
- Crear, reprogramar y cancelar turnos, liberando el horario del profesional y del sillón al cancelar.
- Vista de agenda diaria y semanal por profesional.
- Registro básico de pacientes (datos de contacto, identidad propia con historial de turnos).
- Horario de atención propio por profesional y por día de la semana, con rechazo de turnos fuera de ese horario.
- Validación de que no se crean turnos en el pasado.

## ⚠️ Alcance de IMPLEMENTACIÓN en código (distinto del alcance documentado arriba)

Este es un trabajo académico con entrega en 3 días. El MVP de arriba es lo que está **documentado** en esta Knowledge Base y en el roadmap (`CHANGES.md`) como visión del producto completo. Sin embargo, **en código solo se implementa un único change de OpenSpec**:

> **"Crear un turno evitando solapamientos por profesional y por sillón/box"**

Este change cubre, como mínimo, 3 escenarios verificables con tests en verde: un caso feliz (turno creado sin conflictos), un caso de error de negocio (intento de solapamiento por profesional o por sillón) y un caso de borde (turnos contiguos en el límite `[inicio, fin)` — un turno que empieza exactamente cuando termina otro no se considera solapado). Todo el resto del MVP documentado —reprogramar, cancelar, vistas de agenda, registro de pacientes, etc.— queda **planificado pero NO implementado** en esta entrega; ver `CHANGES.md` para el detalle de changes pendientes.

Esta distinción (KB/roadmap amplios vs. un único change implementado) es intencional y debe mantenerse coherente en toda la documentación generada a partir de aquí — ningún archivo de esta KB debe dar a entender que el resto del MVP ya está construido.

## Fuera de alcance

- Interfaz gráfica de cualquier tipo (web, móvil, escritorio). El sistema es un **módulo de dominio puro**, sin UI.
- Persistencia real (base de datos, archivos). Ver `02_descripcion_general.md` y `08_arquitectura_propuesta.md`.
- Recordatorios y confirmación automática por WhatsApp/email.
- Reserva online 24/7 para pacientes.
- Lista de espera.
- Ficha clínica y odontograma.
- Cobros con Mercado Pago y señas.
- Facturación electrónica ARCA.
- Integración con obras sociales y prepagas.
- Reportes de ausentismo y campañas de recall.
- Multi-zona horaria (el sistema opera en una sola zona: `America/Argentina/Buenos_Aires`).
- Datos reales de pacientes (siempre ficticios, en ejemplos y tests).
- Concurrencia multi-usuario sobre persistencia real (no hay persistencia real en este alcance).

## Contexto de mercado (referencia)

Se investigaron 20 sistemas competidores de gestión de turnos/agenda odontológica (Argentina, LatAm y referencias internacionales). Los 5 priorizados para demo, por relevancia para el mercado argentino, son **DentalTec, Dentia, Dentalink, Bilog y AgendaPro**. El detalle completo (tabla comparativa, matriz de puntuación ponderada, análisis competitivo, gaps de mercado y recomendación final) está en `docs/discovery/informe-discovery.md`; la verificación manual de 5 fuentes está en `docs/evidencia/verificacion-fuentes.txt`. No se repite la tabla completa aquí para evitar duplicación — este archivo solo señala que el alcance v1 (arriba) está alineado con el MVP mínimo que el informe de mercado valida como viable y diferenciable (prevención de solapamientos por sillón/box es, según el informe, una funcionalidad "mencionada pero no demostrada" por la competencia — ver gap #7 del informe).

## Métricas de éxito

Métricas de **producto** (valor para el consultorio, no del trabajo académico):
- 0 turnos solapados por profesional y 0 turnos solapados por sillón/box (RN-TU-01, RN-TU-02 en `05_reglas_de_negocio.md`).
- Reducción del tiempo que le toma a la secretaria/recepcionista cargar un turno nuevo, frente a la gestión manual actual (WhatsApp, papel, planilla).
- Reducción del ausentismo de pacientes respecto de la gestión manual actual.

Métrica técnica (separada de las de producto):
- Tests en verde / cobertura de los escenarios del change implementado (caso feliz, error de negocio y borde — ver `06_funcionalidades.md`, US-001).

# Discovery — turnos-odontologia

**Fecha**: 2026-10-13
**Fuentes investigadas**: 20 sistemas (ver `docs/discovery/informe-discovery.md`) — sin scraping de URLs propias, investigación de mercado delegada.

## 1. Problema que resuelve

Consultorios odontológicos chicos y medianos de Argentina, con uno o varios
profesionales y sillones, hoy gestionan sus turnos a mano (WhatsApp, papel,
planilla). Necesitan digitalizar la agenda, evitar solapamientos entre
profesionales y sillones, y reducir el ausentismo.

## 2. Usuarios / roles

- **Odontólogo**: ve su agenda y atiende.
- **Recepcionista/secretaria**: carga, confirma, reprograma y cancela turnos.
- **Dueño/administrador del consultorio**: configura profesionales, sillones,
  prestaciones y horarios; ve reportes.
- **Paciente**: reserva, confirma o cancela su turno.

## 3. Casos de uso

1. Como recepcionista, quiero crear un turno eligiendo profesional, sillón y
   prestación, para que el sistema evite solapamientos.
2. Como recepcionista, quiero reprogramar o cancelar un turno, para liberar
   el horario.
3. Como paciente, quiero recibir un recordatorio y confirmar mi turno, para
   no olvidarme.
4. Como odontólogo, quiero ver mi agenda diaria y semanal, para organizar mi
   jornada.
5. Como administrador, quiero configurar la duración de cada prestación,
   para que los turnos ocupen el tiempo real.

## 4. Competidores / soluciones existentes

Sin referencia propia del usuario (no conoce ninguna solución de primera
mano). Se toma como base el relevamiento de 20 sistemas en
`docs/discovery/informe-discovery.md`, priorizando los 5 recomendados para
demo:

| Competidor | Por qué prioritario |
|---|---|
| DentalTec | Top del ranking ponderado para Argentina |
| Dentia | Fuerte en gestión odontológica clínica |
| Dentalink | Referencia regional LatAm |
| Bilog | Jugador argentino consolidado |
| AgendaPro | Referencia regional de agenda/turnos digitales |

**Notas**: ver el informe completo para la tabla comparativa de los 20
sistemas, la matriz de puntuación ponderada y el análisis competitivo
(estándares de mercado, diferenciadores reales, vacíos y oportunidades).

## 5. Funcionalidades necesarias (MVP documentado)

1. Agenda multi-profesional y multi-sillón con prevención de solapamientos
   por profesional y por sillón/box.
2. Prestaciones con duración configurable, para que cada turno ocupe el
   tiempo real.
3. Crear, reprogramar y cancelar turnos, liberando el horario al cancelar.
4. Vista de agenda diaria y semanal por profesional.
5. Registro básico de pacientes (datos de contacto).

## 6. Funcionalidades opcionales (post-MVP)

- Recordatorios y confirmación automática por WhatsApp.
- Reserva online 24/7 para pacientes.
- Lista de espera.
- Ficha clínica y odontograma.
- Cobros con Mercado Pago y señas.
- Facturación electrónica ARCA.
- Integración con obras sociales y prepagas.
- Reportes de ausentismo y campañas de recall.

## 7. Reglas de negocio

- No se permiten sobreturnos ni solapamientos: un profesional no puede tener
  dos turnos superpuestos, y un sillón/box tampoco.
- Los intervalos son `[inicio, fin)` — un turno que empieza exactamente
  cuando termina otro NO se considera solapado.
- La duración del turno la define la prestación elegida (ej. control 30
  min, extracción 60 min).
- Cada profesional tiene su propio horario de atención por día de la
  semana; no se pueden dar turnos fuera de ese horario.
- No se pueden crear turnos en el pasado.
- Cancelar un turno libera el horario del profesional y del sillón. En el
  MVP no hay penalidad por cancelar tarde (queda como pregunta abierta).
- Reprogramar un turno aplica las mismas validaciones que crearlo
  (incluyendo el rechazo si el nuevo horario cae fuera de la atención del
  profesional).
- Los sillones/boxes son un recurso compartido entre profesionales — no hay
  sillón fijo asignado a un profesional.
- El paciente es una entidad con identidad propia (puede tener historial de
  turnos), siempre con datos ficticios en ejemplos y tests — nunca datos
  reales de pacientes.

## 8. Integraciones

Ninguna integración externa en el MVP documentado — todo autocontenido. Las
notificaciones (email/WhatsApp) quedan para etapas posteriores.

## 9. Restricciones

- **Plazo**: trabajo académico con entrega en 3 días.
- **Alcance de implementación**: del MVP documentado en la knowledge base y
  el roadmap, en este trabajo se **implementa en código un único change**:
  *"Crear un turno evitando solapamientos por profesional y por sillón/box"*.
  El resto del MVP queda planificado en `CHANGES.md`, no implementado.
- **Stack**: libre, elegido Node.js + TypeScript + Vitest (Node ya
  instalado).
- **Interfaz**: no hace falta interfaz gráfica — alcanza con un módulo de
  lógica de dominio con tests.
- **Datos**: nunca usar datos reales de pacientes; todo con datos ficticios.
- **Zona horaria**: el MVP opera en una sola zona horaria
  (`America/Argentina/Buenos_Aires`); no se manejan múltiples zonas.

## 10. Riesgos

- **Rúbrica de evaluación** (no es un supuesto, es un hecho dado): se
  evalúa el informe de Discovery (completitud, 15+ sistemas, fuentes con
  URL y fecha, uso de "No evidenciado"), la verificación personal de al
  menos 5 fuentes, la coherencia de knowledge-base/roadmap/AGENTS.md con el
  Discovery, y el change OPSX con al menos 3 escenarios verificables
  (feliz, error de negocio y borde) cubiertos por tests en verde y
  archivado.
- **Alcance ya acotado por decisión explícita**: solo se implementa un
  change; el riesgo de "no llegar" con todo el MVP documentado queda
  mitigado porque el resto se deja planificado, no implementado.
- **Concurrencia**: en el MVP no se contempla la creación simultánea de
  turnos por varios usuarios — supuesto sin probar, riesgo diferido a
  cuando haya persistencia real.
- **Supuesto sin probar**: que las 20 soluciones relevadas en el informe de
  mercado sean representativas del mercado argentino real sin haber hecho
  ninguna demo — varias quedaron con precios o adopción "No evidenciado" o
  solo declarados por el proveedor.

## 11. Preguntas abiertas

- Penalidad por cancelación tardía: sin definir, queda para después del MVP.
- Política de sobreturnos de urgencia: sin definir, queda para después del
  MVP.
- Todas las funcionalidades que el informe de Discovery marcó como "No
  evidenciado" en los competidores (ver `docs/discovery/informe-discovery.md`).

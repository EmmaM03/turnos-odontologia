# Flujos Principales

Cada flujo se documenta extremo a extremo. En esta entrega no hay componentes de UI/API/DB reales (ver `02_descripcion_general.md`): los "componentes" son las piezas de dominio (entidad `Turno`, servicio de creación, value object `IntervaloTiempo`) invocadas directamente por los tests.

## Flujo 1: Crear un turno evitando solapamientos [IMPLEMENTADO — único change de código de esta entrega]

**Disparador**: la recepcionista/secretaria decide reservar un turno para un paciente.
**Actor**: Recepcionista/secretaria.

**Pasos**:
1. La recepcionista provee: `profesionalId`, `sillonId`, `pacienteId`, `prestacionId`, `inicio` (fecha/hora en `America/Argentina/Buenos_Aires`).
2. El servicio de dominio calcula `fin = inicio + duración(prestacion)` (RN-TU-05).
3. El servicio valida que `inicio` no esté en el pasado (RN-TU-04).
4. El servicio valida que `[inicio, fin)` no se solape con ningún turno `confirmado` existente del mismo profesional (RN-TU-01), usando la semántica `[inicio, fin)` de IntervaloTiempo (RN-TU-03).
5. El servicio valida que `[inicio, fin)` no se solape con ningún turno `confirmado` existente del mismo sillón (RN-TU-02), aplicando la misma semántica.
6. Si todas las validaciones pasan, se crea el `Turno` en estado `confirmado` y se retorna.
7. Si alguna validación falla, se retorna/lanza un error de dominio tipado (ver `08_arquitectura_propuesta.md` para la convención de errores) y **no** se crea el turno.

**Diagrama de secuencia** (ASCII, sin componentes de infraestructura):
```
Recepcionista → ServicioDeTurnos.crear(datos)
                       │
                       ├─ calcula fin = inicio + duración(prestación)
                       ├─ valida no-pasado (RN-TU-04)
                       ├─ valida no-solapamiento profesional (RN-TU-01, RN-TU-03)
                       ├─ valida no-solapamiento sillón (RN-TU-02, RN-TU-03)
                       │
                       └─ OK → Turno creado (confirmado)
                          ERROR → error de dominio (SolapamientoError | TurnoEnElPasadoError)
```

**Casos de error**:
- Solapamiento por profesional → `SolapamientoError` (profesional), turno NO se crea.
- Solapamiento por sillón → `SolapamientoError` (sillón), turno NO se crea.
- `inicio` en el pasado → `TurnoEnElPasadoError`, turno NO se crea.

## Flujo 2: Reprogramar o cancelar un turno [documentado, no implementado]

**Disparador**: la recepcionista necesita mover o anular un turno existente.
**Actor**: Recepcionista/secretaria.

**Pasos**:
1. Cancelar: el turno pasa a estado `cancelado`; el horario del profesional y del sillón queda libre inmediatamente, sin penalidad (RN-TU-07).
2. Reprogramar: se valida el nuevo `inicio`/`fin` con las mismas reglas que crear (RN-TU-08) antes de mover el turno; si falla, el turno original permanece sin cambios.

**Casos de error**:
- Nuevo horario fuera de la atención del profesional → se rechaza, turno original intacto.
- Nuevo horario genera un solapamiento → se rechaza, turno original intacto.

## Flujo 3: Configuración de datos maestros [documentado, no implementado]

**Disparador**: el administrador da de alta o actualiza profesionales, sillones, prestaciones u horarios.
**Actor**: Dueño/administrador del consultorio.

**Pasos**:
1. Alta/edición de `Profesional` con sus `HorarioAtencion` por día de semana.
2. Alta/edición de `Sillon` (recurso compartido, sin asignación fija — RN-RE-01).
3. Alta/edición de `Prestacion` con su `duracionMinutos`.

**Casos de error**: no definidos en el MVP documentado (fuera del alcance de esta entrega).

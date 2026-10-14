# Arquitectura Propuesta

> Nota de alcance: esta es la arquitectura de un **módulo de dominio puro** (ver `02_descripcion_general.md`). No hay capas de infraestructura, aplicación HTTP ni presentación en esta entrega — se documentan igual como referencia para cuando el MVP completo se implemente post-entrega, pero marcadas como no construidas.

## Patrones aplicados

| Patrón | Dónde se usa | Por qué |
|---|---|---|
| Value Object | `IntervaloTiempo`, `HorarioAtencion` | Encapsular la semántica `[inicio, fin)` y la comparación de solapamiento en un solo lugar, evitando duplicar lógica de fechas en cada entidad. |
| Domain Error tipado | `SolapamientoError`, `TurnoEnElPasadoError`, `FueraDeHorarioError` | Permitir que los tests distingan el *tipo* de error de negocio (caso de error vs. caso borde) sin parsear strings. |
| Servicio de dominio (Domain Service) | `ServicioDeTurnos.crear(...)` | La validación de no-solapamiento necesita consultar el conjunto de turnos existentes del profesional y del sillón — no es responsabilidad de una sola entidad `Turno`, sino una operación que coordina varias. |
| Fake/In-memory repository (solo para tests) | fixtures de turnos existentes en los tests | Sustituye la persistencia real ausente en este alcance; permite ejercitar RN-TU-01/02 sin una base de datos. |

## Estructura de directorios

```
turnos-odontologia/
├── docs/
│   ├── discovery/
│   │   ├── checklist-discovery.md
│   │   └── informe-discovery.md
│   └── evidencia/
│       └── verificacion-fuentes.txt
├── knowledge-base/           (este directorio — 10 archivos canónicos + README)
├── openspec/
│   ├── config.yaml
│   ├── specs/
│   └── changes/
├── src/
│   └── domain/
│       ├── entidades/        (Turno, Profesional, Paciente, Prestacion, Sillon)
│       ├── value-objects/    (IntervaloTiempo, HorarioAtencion)
│       ├── servicios/        (ServicioDeTurnos)
│       └── errores/          (SolapamientoError, TurnoEnElPasadoError, FueraDeHorarioError)
└── (tests junto a cada módulo o en __tests__/, usando Vitest)
```

No hay `backend/`, `frontend/`, `infrastructure/` ni `application/` en esta entrega — esas capas solo tendrían sentido si se implementara el MVP completo con persistencia y UI (fuera de alcance, ver `01_vision_y_objetivos.md`).

## Seguridad

- Autenticación: no aplica (no hay actores autenticándose contra un sistema real en este alcance).
- Autorización: no aplica como control de acceso implementado; el modelo RBAC de `03_actores_y_roles.md` es conceptual, para guiar el diseño del dominio, no código de autorización.
- Validación de input: a cargo del propio dominio — el servicio de creación de turnos valida tipos, rangos y las reglas de negocio (RN-TU-*) antes de construir la entidad `Turno`. No hay validación de payloads HTTP porque no hay HTTP.
- Secrets management: no aplica (no hay credenciales, API keys ni conexiones externas en este alcance).

## Variables de entorno

No aplica — el módulo no depende de configuración de entorno en esta entrega (sin base de datos, sin servicios externos, sin despliegue).

| Variable | Descripción | Ejemplo | Sensible (Y/N) |
|---|---|---|---|
| — | Ninguna variable de entorno requerida en este alcance | — | — |

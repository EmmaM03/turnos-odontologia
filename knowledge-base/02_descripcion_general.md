# Descripción General

## Naturaleza del sistema: dominio puro

Este proyecto es un **módulo de lógica de dominio puro** (domain layer), sin interfaz de usuario y sin persistencia real. No es una aplicación web, móvil ni de escritorio en esta entrega. El comportamiento del sistema se verifica exclusivamente mediante **tests automatizados** (Vitest) que ejercitan las entidades y servicios de dominio directamente, en memoria.

Esta decisión no es una limitación técnica sino una elección de alcance explícita (ver `01_vision_y_objetivos.md`): el trabajo es académico, con 3 días de plazo, y el criterio de evaluación pide un change de OpenSpec con escenarios verificables por tests, no un producto end-to-end. La arquitectura, por lo tanto, no necesita (ni debe, en esta entrega) resolver UI, HTTP, base de datos o despliegue.

## Stack tecnológico

| Capa | Tecnologías | Versión mínima |
|---|---|---|
| Lenguaje | TypeScript | LTS compatible con Node.js instalado |
| Runtime | Node.js | Versión ya instalada en el entorno de desarrollo |
| Testing | Vitest | Última estable al momento de instalación |
| Persistencia | Ninguna (en memoria, dentro de los propios tests/fixtures) | N/A |
| UI | Ninguna | N/A |

**Por qué este stack**: elegido libremente por el equipo (Node.js ya estaba instalado); TypeScript da tipado estático para modelar entidades y reglas de negocio con contratos explícitos; Vitest es el test runner elegido para ejercitar el dominio bajo TDD estricto (ver `AGENTS.md`/`CLAUDE.md` del proyecto para el modo TDD).

## Arquitectura general

```
turnos-odontologia/
└── src/
    └── domain/
        ├── entidades/        (Turno, Profesional, Paciente, Prestacion, Sillon)
        ├── value-objects/     (IntervaloTiempo, HorarioAtencion)
        ├── servicios/         (p. ej. ServicioDeTurnos: creación con validación de solapamientos)
        └── errores/           (errores de dominio: SolapamientoError, FueraDeHorarioError, TurnoEnElPasadoError)
    └── __tests__/ o *.spec.ts junto a cada módulo
```

No hay capa de infraestructura, aplicación (casos de uso HTTP) ni presentación en esta entrega — ver `08_arquitectura_propuesta.md` para el detalle y la justificación de por qué esas capas quedan fuera de alcance.

**Justificación de alto nivel**: al no haber persistencia ni UI, el diseño se concentra en que las entidades y el servicio de creación de turnos expongan un contrato claro (inputs/outputs, errores de dominio tipados) que los tests puedan ejercitar sin mocks de infraestructura.

## Integraciones externas

Ninguna integración externa en el alcance implementado ni en el MVP documentado (ver `01_vision_y_objetivos.md` → Fuera de alcance). Las integraciones mencionadas en Discovery (WhatsApp, Mercado Pago, ARCA, obras sociales) son funcionalidades post-MVP, documentadas como roadmap futuro, no como parte de esta arquitectura.

| Servicio | Propósito | Tipo | Estado |
|---|---|---|---|
| — | — | — | Ninguna integración en este alcance |

## API REST

No aplica. El sistema no expone una API HTTP en esta entrega — es un módulo de dominio consumido directamente por tests (y, a futuro, por una capa de aplicación/API que hoy no existe).

# Spec Delta

## Purpose

Gestionar la creación de turnos de la agenda del consultorio odontológico garantizando que ningún profesional ni sillón/box quede reservado dos veces en el mismo intervalo, que no se reserven turnos en el pasado y que la duración de cada turno la defina la prestación elegida.

**Convenciones de los escenarios.** Salvo que el escenario indique otra cosa, todos los escenarios usan estos datos ficticios (RN-PA-02) y todas las fechas son instantes ISO 8601 con offset `-03:00` (`America/Argentina/Buenos_Aires`, DD-04):

- Momento actual del reloj ("ahora"): `2026-11-02T08:00:00-03:00`.
- Profesionales: `prof-1` ("Dra. Ficticia Uno"), `prof-2` ("Dr. Ficticio Dos").
- Sillones: `sillon-1` ("Box 1"), `sillon-2` ("Box 2").
- Prestaciones: `prest-consulta` ("Consulta", 30 minutos), `prest-extraccion` ("Extracción", 60 minutos).
- Pacientes: `pac-1` ("Paciente de Prueba 1"), `pac-2` ("Paciente de Prueba 2").
- Los intervalos se escriben `[inicio, fin)`: incluyen `inicio` y excluyen `fin` (RN-TU-03).

## ADDED Requirements

### Requirement: Creación de un turno confirmado con duración definida por la prestación
El sistema SHALL crear un turno a partir de profesional, sillón, paciente, prestación e instante de inicio, calculando `fin = inicio + duración de la prestación en minutos` (RN-TU-05). El `fin` nunca se ingresa manualmente. Si todas las validaciones pasan, el turno queda registrado en estado `confirmado` y se devuelve con sus referencias, `inicio`, `fin` y estado (CA-1).

#### Scenario: Caso feliz con profesional y sillón libres (CA-1)
- **GIVEN** no existe ningún turno registrado
- **WHEN** se crea un turno con `prof-1`, `sillon-1`, `pac-1`, `prest-consulta` e inicio `2026-11-02T10:00:00-03:00`
- **THEN** el turno se crea en estado `confirmado`
- **AND** su intervalo es `[2026-11-02T10:00:00-03:00, 2026-11-02T10:30:00-03:00)`
- **AND** el turno queda registrado en la agenda

#### Scenario: La duración la define la prestación elegida
- **GIVEN** no existe ningún turno registrado
- **WHEN** se crea un turno con `prof-1`, `sillon-1`, `pac-1`, `prest-extraccion` e inicio `2026-11-02T11:00:00-03:00`
- **THEN** el turno se crea con fin `2026-11-02T12:00:00-03:00`

#### Scenario: Un turno creado bloquea las creaciones posteriores
- **GIVEN** se creó un turno con `prof-1`, `sillon-1`, `pac-1`, `prest-consulta` e inicio `2026-11-02T10:00:00-03:00`
- **WHEN** se crea otro turno con `prof-1`, `sillon-2`, `pac-2`, `prest-consulta` e inicio `2026-11-02T10:15:00-03:00`
- **THEN** la creación se rechaza con un error de solapamiento por `profesional`

### Requirement: Rechazo de turnos en el pasado
El sistema SHALL rechazar la creación de un turno cuyo `inicio` no sea estrictamente posterior al momento actual provisto por el reloj (`inicio > ahora`, RN-TU-04). Un `inicio` igual a "ahora" se rechaza. El rechazo se informa con el error tipado `TurnoEnElPasadoError` y el turno no se registra (CA-5).

#### Scenario: Turno con inicio en el pasado (CA-5)
- **GIVEN** no existe ningún turno registrado
- **WHEN** se crea un turno con `prof-1`, `sillon-1`, `pac-1`, `prest-consulta` e inicio `2026-11-01T10:00:00-03:00`
- **THEN** la creación se rechaza con `TurnoEnElPasadoError`
- **AND** no se registra ningún turno

#### Scenario: Turno con inicio exactamente igual a ahora (borde)
- **GIVEN** no existe ningún turno registrado
- **WHEN** se crea un turno con `prof-1`, `sillon-1`, `pac-1`, `prest-consulta` e inicio `2026-11-02T08:00:00-03:00`
- **THEN** la creación se rechaza con `TurnoEnElPasadoError`

#### Scenario: Turno con inicio un minuto después de ahora
- **GIVEN** no existe ningún turno registrado
- **WHEN** se crea un turno con `prof-1`, `sillon-1`, `pac-1`, `prest-consulta` e inicio `2026-11-02T08:01:00-03:00`
- **THEN** el turno se crea en estado `confirmado`

### Requirement: No solapamiento por profesional
El sistema SHALL rechazar la creación de un turno cuyo intervalo `[inicio, fin)` se solape con el de otro turno `confirmado` del mismo profesional, aunque use otro sillón (RN-TU-01). Dos intervalos A y B se solapan si y solo si `A.inicio < B.fin` y `B.inicio < A.fin`. El rechazo se informa con `SolapamientoError` con `recurso = 'profesional'` y el turno no se registra (CA-2).

#### Scenario: Solapamiento parcial por profesional (CA-2)
- **GIVEN** existe un turno `confirmado` de `prof-1` en `sillon-1` con intervalo `[2026-11-02T10:00:00-03:00, 2026-11-02T10:30:00-03:00)`
- **WHEN** se crea un turno con `prof-1`, `sillon-2`, `pac-2`, `prest-consulta` e inicio `2026-11-02T10:15:00-03:00`
- **THEN** la creación se rechaza con `SolapamientoError` con `recurso = 'profesional'`
- **AND** el único turno registrado sigue siendo el existente

#### Scenario: Turno nuevo que contiene por completo a uno existente del profesional
- **GIVEN** existe un turno `confirmado` de `prof-1` en `sillon-1` con intervalo `[2026-11-02T10:15:00-03:00, 2026-11-02T10:45:00-03:00)`
- **WHEN** se crea un turno con `prof-1`, `sillon-2`, `pac-2`, `prest-extraccion` e inicio `2026-11-02T10:00:00-03:00`
- **THEN** la creación se rechaza con `SolapamientoError` con `recurso = 'profesional'`

#### Scenario: Otro profesional en otro sillón no genera conflicto
- **GIVEN** existe un turno `confirmado` de `prof-1` en `sillon-1` con intervalo `[2026-11-02T10:00:00-03:00, 2026-11-02T10:30:00-03:00)`
- **WHEN** se crea un turno con `prof-2`, `sillon-2`, `pac-2`, `prest-consulta` e inicio `2026-11-02T10:00:00-03:00`
- **THEN** el turno se crea en estado `confirmado`

### Requirement: No solapamiento por sillón
El sistema SHALL rechazar la creación de un turno cuyo intervalo `[inicio, fin)` se solape con el de otro turno `confirmado` del mismo sillón, aunque sea de otro profesional, porque el sillón es un recurso físico compartido (RN-TU-02, RN-RE-01). El rechazo se informa con `SolapamientoError` con `recurso = 'sillon'` y el turno no se registra (CA-3).

#### Scenario: Solapamiento por sillón entre profesionales distintos (CA-3)
- **GIVEN** existe un turno `confirmado` de `prof-1` en `sillon-1` con intervalo `[2026-11-02T10:00:00-03:00, 2026-11-02T11:00:00-03:00)`
- **WHEN** se crea un turno con `prof-2`, `sillon-1`, `pac-2`, `prest-consulta` e inicio `2026-11-02T10:30:00-03:00`
- **THEN** la creación se rechaza con `SolapamientoError` con `recurso = 'sillon'`
- **AND** el único turno registrado sigue siendo el existente

### Requirement: Turnos contiguos no se solapan
El sistema SHALL tratar como no solapados dos intervalos contiguos, es decir, cuando uno termina exactamente en el instante en que empieza el otro (semántica `[inicio, fin)`, RN-TU-03). Ambos turnos se crean correctamente, tanto para el mismo profesional como para el mismo sillón (CA-4).

#### Scenario: Turno que empieza cuando termina otro del mismo profesional y sillón (CA-4)
- **GIVEN** existe un turno `confirmado` de `prof-1` en `sillon-1` con intervalo `[2026-11-02T10:00:00-03:00, 2026-11-02T10:30:00-03:00)`
- **WHEN** se crea un turno con `prof-1`, `sillon-1`, `pac-2`, `prest-consulta` e inicio `2026-11-02T10:30:00-03:00`
- **THEN** el turno se crea en estado `confirmado` con intervalo `[2026-11-02T10:30:00-03:00, 2026-11-02T11:00:00-03:00)`
- **AND** quedan registrados ambos turnos

#### Scenario: Turno que termina cuando empieza otro del mismo profesional y sillón
- **GIVEN** existe un turno `confirmado` de `prof-1` en `sillon-1` con intervalo `[2026-11-02T10:30:00-03:00, 2026-11-02T11:00:00-03:00)`
- **WHEN** se crea un turno con `prof-1`, `sillon-1`, `pac-2`, `prest-consulta` e inicio `2026-11-02T10:00:00-03:00`
- **THEN** el turno se crea en estado `confirmado` con fin `2026-11-02T10:30:00-03:00`

### Requirement: Solo los turnos confirmados bloquean la agenda
El sistema SHALL considerar únicamente los turnos en estado `confirmado` al validar solapamientos por profesional y por sillón. Un turno en estado `cancelado` no bloquea su intervalo (SU-02). Los estados posibles de un turno son `confirmado` y `cancelado`.

#### Scenario: Un turno cancelado no bloquea al profesional ni al sillón
- **GIVEN** existe un turno `cancelado` de `prof-1` en `sillon-1` con intervalo `[2026-11-02T10:00:00-03:00, 2026-11-02T10:30:00-03:00)`
- **WHEN** se crea un turno con `prof-1`, `sillon-1`, `pac-2`, `prest-consulta` e inicio `2026-11-02T10:00:00-03:00`
- **THEN** el turno se crea en estado `confirmado`

### Requirement: Orden de validación y primer error
El sistema SHALL evaluar las validaciones en este orden fijo: (1) turno en el pasado, (2) solapamiento por profesional, (3) solapamiento por sillón. Ante varias violaciones simultáneas, se informa solo el error de la primera que falla. Ninguna validación fallida registra el turno. El orden SHALL admitir nuevas validaciones posteriores sin alterar las existentes.

#### Scenario: Turno en el pasado que además se solapa
- **GIVEN** el reloj marca "ahora" en `2026-11-02T12:00:00-03:00`
- **AND** existe un turno `confirmado` de `prof-1` en `sillon-1` con intervalo `[2026-11-02T10:00:00-03:00, 2026-11-02T10:30:00-03:00)`
- **WHEN** se crea un turno con `prof-1`, `sillon-1`, `pac-2`, `prest-consulta` e inicio `2026-11-02T10:00:00-03:00`
- **THEN** la creación se rechaza con `TurnoEnElPasadoError`

#### Scenario: Conflicto simultáneo de profesional y sillón
- **GIVEN** existe un turno `confirmado` de `prof-1` en `sillon-1` con intervalo `[2026-11-02T10:00:00-03:00, 2026-11-02T10:30:00-03:00)`
- **WHEN** se crea un turno con `prof-1`, `sillon-1`, `pac-2`, `prest-consulta` e inicio `2026-11-02T10:00:00-03:00`
- **THEN** la creación se rechaza con `SolapamientoError` con `recurso = 'profesional'`

#### Scenario: Conflicto de profesional y de sillón contra turnos distintos
- **GIVEN** existe un turno `confirmado` de `prof-1` en `sillon-2` con intervalo `[2026-11-02T10:00:00-03:00, 2026-11-02T10:30:00-03:00)`
- **AND** existe un turno `confirmado` de `prof-2` en `sillon-1` con intervalo `[2026-11-02T10:00:00-03:00, 2026-11-02T10:30:00-03:00)`
- **WHEN** se crea un turno con `prof-1`, `sillon-1`, `pac-1`, `prest-consulta` e inicio `2026-11-02T10:00:00-03:00`
- **THEN** la creación se rechaza con `SolapamientoError` con `recurso = 'profesional'`

### Requirement: Referencias inexistentes
El sistema SHALL rechazar la creación de un turno si el profesional, el sillón, el paciente o la prestación referenciados no existen, con el error tipado `EntidadNoEncontradaError`, que identifica el tipo de entidad y el identificador buscado. Esta verificación ocurre antes que las validaciones de negocio, porque el `fin` depende de la prestación. El turno no se registra.

#### Scenario: Profesional inexistente
- **GIVEN** no existe ningún profesional con id `prof-999`
- **WHEN** se crea un turno con `prof-999`, `sillon-1`, `pac-1`, `prest-consulta` e inicio `2026-11-02T10:00:00-03:00`
- **THEN** la creación se rechaza con `EntidadNoEncontradaError` que identifica la entidad `profesional` y el id `prof-999`
- **AND** no se registra ningún turno

#### Scenario: Sillón inexistente
- **WHEN** se crea un turno con `prof-1`, `sillon-999`, `pac-1`, `prest-consulta` e inicio `2026-11-02T10:00:00-03:00`
- **THEN** la creación se rechaza con `EntidadNoEncontradaError` que identifica la entidad `sillon` y el id `sillon-999`

#### Scenario: Paciente inexistente
- **WHEN** se crea un turno con `prof-1`, `sillon-1`, `pac-999`, `prest-consulta` e inicio `2026-11-02T10:00:00-03:00`
- **THEN** la creación se rechaza con `EntidadNoEncontradaError` que identifica la entidad `paciente` y el id `pac-999`

#### Scenario: Prestación inexistente
- **WHEN** se crea un turno con `prof-1`, `sillon-1`, `pac-1`, `prest-999` e inicio `2026-11-02T10:00:00-03:00`
- **THEN** la creación se rechaza con `EntidadNoEncontradaError` que identifica la entidad `prestacion` y el id `prest-999`

### Requirement: Invariante de intervalo de tiempo
El sistema SHALL exigir que todo intervalo de tiempo cumpla `inicio < fin`. Un intervalo vacío (`inicio == fin`) o invertido (`inicio > fin`) se rechaza al construirse con el error tipado `IntervaloInvalidoError`. La comparación de solapamiento entre intervalos válidos sigue la fórmula de RN-TU-03.

#### Scenario: Intervalo válido
- **WHEN** se construye el intervalo `[2026-11-02T10:00:00-03:00, 2026-11-02T10:30:00-03:00)`
- **THEN** el intervalo se construye correctamente

#### Scenario: Intervalo vacío
- **WHEN** se construye un intervalo con inicio y fin `2026-11-02T10:00:00-03:00`
- **THEN** la construcción se rechaza con `IntervaloInvalidoError`

#### Scenario: Intervalo invertido
- **WHEN** se construye un intervalo con inicio `2026-11-02T10:30:00-03:00` y fin `2026-11-02T10:00:00-03:00`
- **THEN** la construcción se rechaza con `IntervaloInvalidoError`

#### Scenario: Intervalos solapados y contiguos
- **GIVEN** el intervalo A `[2026-11-02T10:00:00-03:00, 2026-11-02T10:30:00-03:00)`
- **WHEN** se lo compara con B `[2026-11-02T10:29:00-03:00, 2026-11-02T11:00:00-03:00)` y con C `[2026-11-02T10:30:00-03:00, 2026-11-02T11:00:00-03:00)`
- **THEN** A se solapa con B
- **AND** A no se solapa con C

### Requirement: Duración de la prestación válida
El sistema SHALL exigir que la duración de una prestación sea un número entero de minutos mayor que cero. Una prestación con duración cero, negativa o no entera se rechaza al construirse con el error tipado `DuracionInvalidaError`.

#### Scenario: Duración válida
- **WHEN** se construye la prestación `prest-consulta` con duración 30 minutos
- **THEN** la prestación se construye correctamente

#### Scenario: Duración cero
- **WHEN** se construye una prestación con duración 0 minutos
- **THEN** la construcción se rechaza con `DuracionInvalidaError`

#### Scenario: Duración negativa
- **WHEN** se construye una prestación con duración -30 minutos
- **THEN** la construcción se rechaza con `DuracionInvalidaError`

#### Scenario: Duración no entera
- **WHEN** se construye una prestación con duración 30.5 minutos
- **THEN** la construcción se rechaza con `DuracionInvalidaError`

### Requirement: Errores de dominio tipados
El sistema SHALL informar cada rechazo mediante un error tipado distinguible por su tipo, sin depender del texto del mensaje. Todos los errores de esta capability SHALL ser también reconocibles como error de dominio genérico (`ErrorDeDominio`). `SolapamientoError` SHALL exponer el recurso en conflicto (`profesional` o `sillon`).

#### Scenario: El error de solapamiento es reconocible como error de dominio
- **GIVEN** existe un turno `confirmado` de `prof-1` en `sillon-1` con intervalo `[2026-11-02T10:00:00-03:00, 2026-11-02T10:30:00-03:00)`
- **WHEN** se crea un turno con `prof-2`, `sillon-1`, `pac-2`, `prest-consulta` e inicio `2026-11-02T10:00:00-03:00`
- **THEN** el error es un `SolapamientoError` con `recurso = 'sillon'`
- **AND** el error es también un `ErrorDeDominio`

#### Scenario: El error de turno en el pasado es reconocible como error de dominio
- **WHEN** se crea un turno con `prof-1`, `sillon-1`, `pac-1`, `prest-consulta` e inicio `2026-11-01T10:00:00-03:00`
- **THEN** el error es un `TurnoEnElPasadoError`
- **AND** el error es también un `ErrorDeDominio`

### Requirement: Sobreturnos no soportados
El sistema SHALL NOT ofrecer ninguna excepción a las reglas de no solapamiento: no existe sobreturno de urgencia ni forma de forzar un turno superpuesto. Un turno con exactamente el mismo intervalo que otro `confirmado` del mismo profesional o sillón se rechaza por las reglas de solapamiento (política abierta en `10_preguntas_abiertas.md`).

#### Scenario: Intento de sobreturno en el mismo intervalo y sillón
- **GIVEN** existe un turno `confirmado` de `prof-1` en `sillon-1` con intervalo `[2026-11-02T10:00:00-03:00, 2026-11-02T10:30:00-03:00)`
- **WHEN** se crea un turno con `prof-2`, `sillon-1`, `pac-2`, `prest-consulta` e inicio `2026-11-02T10:00:00-03:00`
- **THEN** la creación se rechaza con `SolapamientoError` con `recurso = 'sillon'`

### Requirement: Solapamiento por paciente explícitamente no cubierto
El sistema SHALL NOT validar en esta capability que un mismo paciente tenga turnos superpuestos con distintos profesionales y sillones: ninguna regla de negocio lo exige y queda registrado como pregunta abierta en `knowledge-base/10_preguntas_abiertas.md`. Incorporarlo requiere un change con spec aprobado.

#### Scenario: Mismo paciente en dos turnos superpuestos con recursos distintos
- **GIVEN** existe un turno `confirmado` de `pac-1` con `prof-1` en `sillon-1` con intervalo `[2026-11-02T10:00:00-03:00, 2026-11-02T10:30:00-03:00)`
- **WHEN** se crea un turno con `prof-2`, `sillon-2`, `pac-1`, `prest-consulta` e inicio `2026-11-02T10:00:00-03:00`
- **THEN** el turno se crea en estado `confirmado`

# Actores y Roles

> Nota de alcance: al ser un módulo de dominio puro sin UI ni autenticación (ver `02_descripcion_general.md`), no existe un sistema de login ni sesiones reales. Los actores y la matriz RBAC de abajo describen el **modelo de negocio** (quién hace qué en el dominio del consultorio), no un control de acceso implementado en código. Sirven para modelar correctamente las reglas de negocio y las futuras interfaces (post-MVP).

## Actores del sistema

| Actor | Descripción | Cómo interactúa |
|---|---|---|
| Odontólogo | Profesional que atiende turnos. Tiene horario de atención propio por día de la semana. | Ve su agenda diaria/semanal (post-MVP); es el "recurso profesional" sobre el que se valida el no-solapamiento. |
| Recepcionista/secretaria | Administra la agenda operativa del consultorio. | Crea, reprograma y cancela turnos eligiendo profesional, sillón y prestación. Actor principal del change implementado. |
| Dueño/administrador del consultorio | Configura los datos maestros del consultorio. | Configura profesionales, sillones/boxes, prestaciones (con su duración) y horarios de atención; ve reportes (post-MVP). |
| Paciente | Persona que recibe la atención odontológica. | Es titular del turno; tiene identidad propia con historial de turnos. Reserva/confirma/cancela de forma self-service solo en fases post-MVP (reserva online). |

## RBAC — Matriz de permisos (modelo de negocio, no implementado como control de acceso)

| Rol | Recurso | Permisos |
|---|---|---|
| Recepcionista/secretaria | Turno | Crear, Leer, Actualizar (reprogramar), Cancelar |
| Recepcionista/secretaria | Paciente | Crear, Leer, Actualizar |
| Dueño/administrador | Profesional, Sillón, Prestación, Horario de atención | Crear, Leer, Actualizar, Eliminar |
| Dueño/administrador | Turno, Paciente | Leer (reportes, post-MVP) |
| Odontólogo | Turno (propio) | Leer |
| Paciente | Turno (propio) | Leer, Cancelar/Reprogramar (self-service, post-MVP) |

## Rutas públicas

No aplica — no hay rutas HTTP en este alcance (ver `02_descripcion_general.md`, sección API REST). Cuando exista una capa de API/UI (post-MVP), este archivo deberá documentar qué queda público (p. ej. un endpoint de reserva online para pacientes, mencionado en el informe de mercado como diferenciador común: `docs/discovery/informe-discovery.md`).

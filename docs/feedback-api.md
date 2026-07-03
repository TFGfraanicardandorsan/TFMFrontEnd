# Contrato de API: satisfacción y sugerencias

El frontend concentra la integración en `src/services/feedback.js`. Todas las rutas
requieren una sesión válida y el backend obtiene el usuario y el rol desde esa sesión.

## Crear una aportación

`POST /api/v1/feedback/crear`

```json
{
  "satisfaccion_general": 4,
  "facilidad_uso": 5,
  "recomendacion": 9,
  "tipo_aporte": "mejora",
  "comentario": "Sería útil filtrar por curso.",
  "solicita_seguimiento": true
}
```

Las tres puntuaciones son obligatorias. Los rangos son 1–5, 1–5 y 0–10.
`tipo_aporte` admite `mejora`, `problema`, `nueva_funcionalidad` y `otro`.

## Consultar las aportaciones propias

`POST /api/v1/feedback/mis-respuestas`

Devuelve `result` con un array de aportaciones del usuario autenticado. Cada elemento
incluye `id_feedback`, los campos enviados, `fecha_creacion`, `estado` y
`respuesta_administracion`.

## Consultar todas las aportaciones

`POST /api/v1/feedback/listar`

Solo para administración. Devuelve los mismos campos, además de `uvus` y `rol`.

## Actualizar el seguimiento

`POST /api/v1/feedback/actualizar-estado`

```json
{
  "id_feedback": 42,
  "estado": "planificada",
  "respuesta_administracion": "La incluiremos en la próxima iteración."
}
```

Los estados válidos son `recibida`, `en_revision`, `planificada`, `implementada` y
`descartada`. Solo administración puede actualizar el seguimiento.

## Criterios recomendados

- Limitar a una respuesta de satisfacción por usuario y periodo, permitiendo nuevas
  sugerencias cuando cambie el periodo.
- No confiar en `rol`, `uvus` ni fechas recibidas desde el cliente.
- Registrar auditoría de los cambios de estado.
- Excluir identificadores personales de analíticas agregadas.
- Limitar comentarios y respuestas a 1.500 caracteres.

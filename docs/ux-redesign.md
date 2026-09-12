# Revisión UX/UI y rediseño

## Diagnóstico del frontend

Revisión basada en rutas, componentes, estados y servicios del repositorio. No se han realizado entrevistas ni pruebas con usuarios reales.

- La portada solo mostraba avisos; faltaba un punto de entrada al trabajo principal.
- Cinco destinos de navegación relacionados con permutas tenían nombres similares y no explicaban su relación.
- Las propuestas, acuerdos y documentos estaban dispersos sin una visión conjunta.
- La navegación dependía de la carga de notificaciones y algunos controles eran iconos sin botón accesible.
- Los menús de escritorio dependían de desplegables; en móvil se repetía una estructura diferente.
- Las asignaturas sin grupo provocaban redirecciones automáticas, interrumpiendo la consulta de solicitudes e incidencias.
- Había anchos mínimos de 300–350 px dentro de contenedores con padding, cuadrículas que desbordaban en móvil y carruseles que ocultaban registros.
- Colores, sombras, títulos, formularios y márgenes variaban por pantalla y rol. Existían varios elementos main anidados.

## Implementación

- Navegación compartida para estudiantes, administración y delegación. Menú lateral en escritorio y accesos principales persistentes en móvil.
- Portada orientada a tareas, con acceso directo al siguiente trabajo y guía de cuatro etapas.
- Ruta `/seguimiento`: solicitudes, acuerdos y documentación con datos de los servicios existentes, agrupación por bloques, recarga y distinción entre error y lista vacía. No se cruzan los UUID de solicitudes con los de propuestas.
- Contexto de etapa visible en matrícula, solicitud, propuestas y documentos. Indica ubicación dentro del proceso, no progreso completado de una permuta concreta.
- Aviso de matrícula incompleta con enlace explícito, sin expulsar al usuario de la pantalla actual. La validación del formulario de solicitudes se mantiene.
- Registros de acuerdos visibles como listas en vez de carruseles. Acceso a nueva incidencia incluso cuando ya existen incidencias.
- Acceso público rediseñado conservando SAML y el código de Telegram.
- Sistema visual común, modo oscuro, controles de idioma compactos, foco visible, enlace para saltar contenido, notificaciones con gestión de foco, reducción de movimiento y cuadrículas adaptables.
- Se conservan las rutas previas, permisos, servicios, creación por curso, edición, cancelaciones, aceptación, firmas, exportaciones, administración y delegación.
- Nuevos textos traducidos a español, inglés y francés.

## Verificación y límites

Pruebas automatizadas de navegación, errores, recarga, deduplicación, bloques y enlaces de seguimiento, junto a la suite funcional existente y compilación de producción.

No se ha podido realizar revisión visual en navegador: el entorno de automatización informa que no hay ningún navegador disponible. Conviene validar visualmente a 360, 390, 768, 1024 y 1440 px con una sesión real antes de publicar, especialmente documentos, tablas administrativas y modo oscuro. Las pruebas de componentes no sustituyen esa revisión ni verifican una firma SAML/AutoFirma real.

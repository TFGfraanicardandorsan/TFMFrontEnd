# Permutas ETSII

Permutas ETSII es una plataforma web desarrollada en React y Vite para la gestión eficiente de permutas de asignaturas y grupos en la Escuela Técnica Superior de Ingeniería Informática (ETSII) de la Universidad de Sevilla. Permite a estudiantes y administradores gestionar solicitudes de permuta, incidencias, notificaciones y visualizar estadísticas.

## Características principales

- **Gestión de permutas:** Solicita, acepta, valida y completa permutas de asignaturas y grupos.
- **Gestión de incidencias:** Reporta y resuelve incidencias relacionadas con el proceso de permutas.
- **Panel de administración:** Exporta datos, crea grados y asignaturas, y gestiona notificaciones.
- **Notificaciones:** Visualiza notificaciones relevantes en tiempo real.
- **Estadísticas:** Consulta dashboards con estadísticas de uso y actividad.
- **Generación de documentación:** Descarga y firma digitalmente la documentación necesaria para las permutas.
- **Gestión de usuario:** Selecciona estudios, asignaturas y grupos, y marca asignaturas como superadas.

## Estructura del proyecto

```
├── public/
│   ├── faviconEtsii.png
│   └── assets/
│       ├── logo-etsii-color.png
│       └── telegram-qr.png
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── App.css
│   ├── components/
│   │   ├── home.jsx
│   │   ├── login.jsx
│   │   ├── footer.jsx
│   │   ├── NavbarEstudiante.jsx
│   │   ├── NavbarAdmin.jsx
│   │   ├── miPerfil.jsx
│   │   ├── miPerfilAdmin.jsx
│   │   ├── selectorAsignatura.jsx
│   │   ├── seleccionarEstudio.jsx
│   │   ├── seleccionarGrupos.jsx
│   │   ├── solicitarPermuta.jsx
│   │   ├── solicitudesPermuta.jsx
│   │   ├── permutas.jsx
│   │   ├── misPermutas.jsx
│   │   ├── permutasAceptadas.jsx
│   │   ├── generacionPDF.jsx
│   │   ├── reportarIncidencia.jsx
│   │   ├── misIncidencias.jsx
│   │   ├── incidenciasSinAsignar.jsx
│   │   ├── incidenciasAsignadasAdmin.jsx
│   │   ├── detalleIncidencia.jsx
│   │   ├── Estadisticas.jsx
│   │   ├── crearNotificacion.jsx
│   │   ├── CrearAsignatura.jsx
│   │   ├── CrearGradoAdmin.jsx
│   │   └── cookies.jsx
│   ├── contexts/
│   ├── hooks/
│   ├── layouts/
│   ├── lib/
│   ├── routes/
│   ├── services/
│   └── styles/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── .gitignore
```

## Instalación

1. **Clona el repositorio:**
   ```sh
   git clone <URL-del-repositorio>
   cd TFMFrontEnd
   ```

2. **Instala las dependencias:**
   ```sh
   npm install
   ```

3. **Configura las variables de entorno:**
   - Si es necesario, crea un archivo `.env` con las variables requeridas para la conexión con el backend.

4. **Inicia el servidor de desarrollo:**
   ```sh
   npm run dev
   ```

5. **Accede a la aplicación:**
   - Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## Scripts disponibles

- `npm run dev` — Inicia el servidor de desarrollo con Vite.
- `npm run build` — Genera la build de producción.
- `npm run preview` — Previsualiza la build de producción localmente.
- `npm run lint` — Ejecuta ESLint para comprobar la calidad del código.

## Tecnologías utilizadas

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [React Toastify](https://fkhadra.github.io/react-toastify/)
- [pdf-lib](https://pdf-lib.js.org/) y [file-saver](https://github.com/eligrey/FileSaver.js/)
- [Chart.js](https://www.chartjs.org/) y [react-chartjs-2](https://react-chartjs-2.js.org/)
- [Swiper](https://swiperjs.com/) para carruseles
- [FontAwesome](https://fontawesome.com/) para iconos

## Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias o mejoras.

## Licencia

Este proyecto está bajo la licencia MIT.

---

**Contacto:**  
delegacion_etsii@us.es  
Avda. Reina Mercedes s/n, 41012 Sevilla

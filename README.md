Este proyecto es el resultado de tu trabajo final para la asignatura y combina un API REST hecho con Node.js/Express y una aplicación web construida con React/Vite. La solución permite administrar eventos, vender boletos y gestionar usuarios con roles diferenciados.

Descripción general

El repositorio se divide en dos carpetas principales:

Carpeta	Descripción
eventos‑backend/	Código del API REST en Node.js/Express con PostgreSQL.
frontend/	Aplicación web en React/Vite que consume el API.
Funcionalidades principales

Registro e inicio de sesión: los usuarios se registran y autentican mediante JSON Web Tokens (JWT). Los tokens y datos del usuario se guardan en localStorage para mantener la sesión en el navegador.

Listado de eventos: la página principal consulta /api/events y muestra eventos en una grilla con búsqueda y paginación
raw.githubusercontent.com
. Los visitantes pueden filtrar por título o descripción y navegar entre páginas
raw.githubusercontent.com
. Cada tarjeta muestra el título, descripción, ubicación, fecha, precio y la capacidad restante
raw.githubusercontent.com
.

Compra de boletos: los usuarios autenticados pueden comprar un ticket directamente desde la lista o desde la vista de detalle. Si no hay sesión iniciada, se muestra un mensaje de error; de lo contrario, se realiza una petición POST a /tickets/purchase con el eventId y la cantidad
raw.githubusercontent.com
. La respuesta actualiza el mensaje de confirmación o muestra errores de capacidad o autenticación
raw.githubusercontent.com
.

Detalle de evento: permite ver la información completa de un evento. Se carga llamando a /events/:id y muestra la ubicación, categoría, capacidad total y disponible, precio y fecha. Desde esta vista también es posible comprar boletos
raw.githubusercontent.com
.

Gestión administrativa de eventos: los usuarios con rol admin disponen de un panel donde pueden crear nuevos eventos. Este panel valida que el usuario tenga rol admin y que se completen campos como título, descripción, fecha, capacidad y precio
raw.githubusercontent.com
. Al guardar, se envía una petición POST a /events que crea el nuevo registro y actualiza la lista
raw.githubusercontent.com
.

Mis boletos: cada usuario autenticado puede consultar sus tickets comprados. Se realiza una petición GET a /tickets/my y se muestran los eventos, cantidades, fecha de compra y total pagado.

Roles y seguridad: las rutas protegidas requieren token. Si no se envía el token se devuelve HTTP 401 y si el rol no tiene permiso se devuelve HTTP 403
raw.githubusercontent.com
. La capa de servicios del backend valida autenticación, roles y datos obligatorios; por ejemplo, EventService impide crear o modificar eventos sin usuario autenticado o con rol distinto de organizer/admin
raw.githubusercontent.com
 y valida que la capacidad sea positiva
raw.githubusercontent.com
.

Pruebas unitarias e integración: el backend incluye un conjunto completo de tests con Jest y Supertest. Para cumplir con las métricas de calidad se mantiene un umbral global mínimo de 80 % de coverage en declaraciones y 70 % en ramas. El workflow de GitHub Actions ejecuta estos tests en cada push y reporta la cobertura.

Instalación y puesta en marcha del backend

1.Prerequisitos. Asegúrate de tener instalado Node.js 18 o superior, Docker Compose y Git. Si prefieres gestionar tu propia base de datos puedes instalar PostgreSQL localmente, pero se recomienda usar Docker.

2. Arrancar la base de datos con Docker. Desde la carpeta eventos‑backend/ ejecuta:

docker compose up -d

Esto levanta un contenedor PostgreSQL accesible en localhost:15432 con la base de datos eventos_db

3. Configurar variables de entorno. Crea un archivo .env en eventos‑backend/ con el siguiente contenido (puedes ajustar las credenciales a tus necesidades):

PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=15432
DATABASE_USER=eventos_app_user
DATABASE_PASSWORD=eventos_app_password
DATABASE_NAME=eventos_db

JWT_SECRET=supersecreto
JWT_EXPIRES_IN=1h

4. Instalar dependencias y correr el servidor. Ejecuta los comandos:

cd eventos-backend
npm install
npm run dev

La API estará disponible en http://localhost:3000

5. Ejecutar pruebas. Para correr todos los tests ejecuta:

npm test

Para ver el reporte de cobertura usa:

npm test -- --coverage

La configuración de Jest exige al menos 80 % en declaraciones y 70 % en ramas. Si deseas replicar el mismo entorno que GitHub Actions emplea para CI, utiliza el script npm run test:ci, que ejecuta Jest con cobertura y en modo banda.

6. Promover un usuario a administrador. Al registrar usuarios mediante /auth/register el rol asignado por defecto es USER. Para otorgar privilegios de ADMIN ejecuta el script incluido:

node scripts/promote-admin.js

Instalación y puesta en marcha del frontend

1. Instalar dependencias. Dentro de la carpeta frontend/ ejecuta:
npm install

2. Configurar el cliente. El cliente utiliza la variable VITE_API_URL para conectarse al backend. Crea un archivo .env en frontend/ con esta línea (ajusta el puerto si modificaste el backend):
VITE_API_URL=http://localhost:3000

3. Correr la aplicación web. Ejecuta: npm run dev

Vite abrirá la aplicación en http://localhost:5173 
raw.githubusercontent.com
. Desde ahí podrás navegar por todas las páginas.

Resumen de endpoints principales
Módulo	Ruta	Método	Descripción
Auth	/api/auth/register	POST	Crea un usuario. Devuelve el usuario sin contraseña.
	/api/auth/login	POST	Autentica y devuelve { token, user }.
Eventos	/api/events	GET	Lista eventos con paginación y búsqueda (page, pageSize, search)
raw.githubusercontent.com
.
	/api/events/:id	GET	Devuelve un evento específico.
	/api/events	POST	Crea un evento (requiere rol ORGANIZER/ADMIN)
raw.githubusercontent.com
.
	/api/events/:id	PUT	Actualiza un evento (solo organizador o admin)
raw.githubusercontent.com
.
	/api/events/:id	DELETE	Elimina un evento (solo organizador o admin)
raw.githubusercontent.com
.
Categorías	/api/categories	GET	Devuelve todas las categorías.
	/api/categories	POST	Crea una categoría (solo admin).
Tickets	/api/tickets/purchase	POST	Compra boletos (requiere token). Valida que eventId y quantity sean correctos
raw.githubusercontent.com
.
	/api/tickets/my	GET	Lista los tickets del usuario autenticado.

  Los errores se devuelven con códigos HTTP estándar; por ejemplo, falta de token produce 401 Unauthorized, y rol incorrecto produce 403 Forbidden

  El middleware de errores mapea códigos específicos (VALIDATION_ERROR, NOT_FOUND, etc.) a códigos HTTP adecuados.

Consideraciones finales

La arquitectura utiliza un patrón de capas: las rutas se encargan de recibir las peticiones, delegan en controladores/servicios y estos utilizan repositorios para interactuar con la base de datos. Esto facilita el testeo y la reutilización de lógica. Por ejemplo, EventService.createEvent valida rol y campos necesarios antes de llamar al repositorio

La autenticación se implementa con JWT y un middleware (auth.middleware.js) que extrae el token del encabezado Authorization y carga el usuario en req.user. Otro middleware (role.middleware.js) verifica si el usuario posee alguno de los roles permitidos para la ruta.

La UI está construida con componentes funcionales de React y utiliza useState y useEffect para gestionar estado y efectos secundarios. El contexto de autenticación se implementa en frontend/src/api/auth.js y Navbar.jsx, actualizando la interfaz cuando el usuario inicia o cierra sesión

Este proyecto incluye un flujo CI/CD con GitHub Actions. Cada push a la rama principal ejecuta la instalación, las pruebas y reporta cobertura. Así se asegura que el código permanezca estable y con cobertura mínima.

Proyecto Final – Plataforma de Eventos y Venta de Boletos

El proyecto incluye backend con Node/Express, frontend con React/Vite, base de datos PostgreSQL en Docker, autenticación con JWT, paginación, filtrados y pruebas unitarias e integración con cobertura mínima del 80%.

🚀 Tecnologías principales
Backend
Node.js + Express 5
PostgreSQL (Docker)
pg (Pool)
JWT (autenticación)
Bcrypt (password hashing)
Jest + Supertest (tests unitarios e integración)
Docker Compose
Arquitectura por capas (routes → controllers → services → repositories)

Frontend
React + Vite
React Router
Context API (autenticación global)
Fetch/Axios API Client
UI con estilos propios (tema oscuro)
DevOps
GitHub Actions
Coverage con Jest (--coverage)
CI/CD simple para validar builds y pruebas

proyecto-final-eventos/
│
├── eventos-backend/        # API REST (Node + Express + PostgreSQL)
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   ├── prisma/
│   ├── jest.config.cjs
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   ├── context/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md


⚙️ Requisitos previos

Asegúrate de tener instalados:
Node.js 18+
Docker + Docker Compose
Git
PostgreSQL (solo si no usas Docker)

🐳 Levantar el backend con Docker
El backend usa Docker para la base de datos.
Desde la carpeta eventos-backend/:

docker compose up -d

Esto levanta PostgreSQL en:
host: localhost
puerto: 15432
base de datos: eventos_db

🔧 Variables de entorno (backend)

Crea un archivo .env dentro de eventos-backend/:

PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=15432
DATABASE_USER=eventos_app_user
DATABASE_PASSWORD=eventos_app_password
DATABASE_NAME=eventos_db

JWT_SECRET=supersecreto
JWT_EXPIRES_IN=1h

▶️ Iniciar el backend

Dentro de eventos-backend/:
npm install
npm run dev

Servidor en: http://localhost:3000

🧪 Ejecutar pruebas y cobertura

El backend incluye tests unitarios y de integración con cobertura >80%.
npm test

Con cobertura: npm test -- --coverage

🤖 GitHub Actions (CI/CD)
El proyecto incluye un workflow que ejecuta automáticamente:
Instalación de dependencias
Pruebas unitarias y de integración
Reporte de cobertura
En .github/workflows/.
Esto asegura que cualquier nuevo push mantiene la calidad del código.

🔐 Crear un usuario administrador (ADMIN)

El sistema crea usuarios con rol USER por defecto.
Para promover uno a ADMIN, usa este script: eventos-backend/scripts/promote-admin.js

Ejecuta:node scripts/promote-admin.js
Esto actualiza el usuario admin@example.com a rol ADMIN.

🌐 Frontend – Inicio

Dentro de frontend/: npm install
npm run dev

http://localhost:5173

📲 Funcionalidades del frontend
✔ Login / Registro

Token y usuario guardados en localStorage

AuthContext sincroniza sesión global

✔ Rutas protegidas

AdminEvents solo para ORGANIZER / ADMIN

MyTickets para usuarios autenticados

✔ Home

Lista de eventos desde /api/events

Filtros (búsqueda, categoría, precios)

Paginación real

✔ Detalle de evento

Info individual

Comprar ticket mediante /api/tickets/purchase

📚 Resumen de la API
🔑 Autenticación
POST /api/auth/register
POST /api/auth/login
🎫 Tickets
POST /api/tickets/purchase (requiere token)
🎉 Eventos
GET /api/events?page=&limit=&search=...
GET /api/events/:id
POST /api/events (ADMIN/ORGANIZER)
👮 Roles y seguridad
Sin token → 401 Unauthorized
Rol incorrecto → 403 Forbidden



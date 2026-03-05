# Portafolio de Acciones (Node.js + Express + Docker)

Aplicación full-stack sencilla para gestionar un portafolio de acciones por usuario, con persistencia en archivos JSON locales y una interfaz web estática.

## Requisitos

- Docker
- Docker Compose (plugin `docker compose`)

## Ejecutar con Docker Compose

1. En la raíz del proyecto, construir y levantar:

```bash
docker compose up --build
```

2. Abrir en el navegador:

```text
http://localhost:3000
```

3. Para detener:

```bash
Ctrl + C
```

Si quieres apagar y borrar contenedores/red:

```bash
docker compose down
```

## Probar endpoints con curl

### 1) Agregar acción al portafolio

```bash
curl -X POST http://localhost:3000/api/users/alice/portfolio \
  -H "Content-Type: application/json" \
  -d '{"symbol":" aapl ","shares":10,"price":123.45}'
```

### 2) Ver portafolio de un usuario

```bash
curl http://localhost:3000/api/users/alice/portfolio
```

### 3) Calcular valor total del portafolio

```bash
curl http://localhost:3000/api/users/alice/portfolio/value
```

### 4) Ejemplo de validación fallida

```bash
curl -X POST http://localhost:3000/api/users/alice/portfolio \
  -H "Content-Type: application/json" \
  -d '{"symbol":"","shares":0,"price":-5}'
```

## Estructura de carpetas

```text
.
├── data/                  # Archivos JSON por usuario (persistencia)
├── public/
│   └── index.html         # UI estática (HTML/CSS/JS)
├── server.js              # API REST + static server
├── package.json
├── Dockerfile
├── docker-compose.yml
└── .dockerignore
```

## Formato de datos

Cada usuario se guarda en:

```text
./data/<userId>.json
```

Estructura:

```json
{
  "holdings": [
    { "symbol": "AAPL", "shares": 10, "price": 123.45 }
  ]
}
```

## Notas de validación y comportamiento

- `userId` se valida para permitir solo: `[a-zA-Z0-9_-]`. Si es inválido, responde `400`.
- `symbol` se normaliza con `trim()` y `toUpperCase()`.
- Validaciones de holding:
  - `symbol` no vacío.
  - `shares` numérico y `> 0`.
  - `price` numérico y `> 0`.
- Si el archivo del usuario no existe, el portafolio se considera vacío:
  - `GET /api/users/:userId/portfolio` devuelve `{ "holdings": [] }`.
- `POST /api/users/:userId/portfolio` agrega una nueva entrada (no mergea símbolos repetidos).
- `GET /api/users/:userId/portfolio/value` calcula:
  - `totalValue = sum(shares * price)` redondeado a 2 decimales.
  - Respuesta incluye `currency: "USD"` y `computedAt` (ISO string).

# DEBER-2 - Portafolio de Acciones con Express.js

**CMP-5001-202520 - Aplicaciones Distribuidas**
Universidad San Francisco de Quito

## Integrantes y Colaboración

1. **Andrés Proaño (00326003)**
   - Configuración del entorno Docker (Dockerfile y docker-compose.yml).
   - Construcción y publicación de la imagen multiplataforma en Docker Hub.
   - Pruebas de despliegue y verificación del funcionamiento en contenedores.

2. **Pablo Alvarado (00344965)**
   - Desarrollo del servidor REST con Express.js (rutas POST y GET).
   - Lógica de persistencia de datos en archivos JSON por usuario.
   - Creación de la página web (index.html) con formularios y comunicación al servidor mediante fetch y async/await.

## Instrucciones para ejecutar

### Opción 1: Desde Docker Hub

```bash
docker run -p 3000:3000 byandyx/express-distributed-stock-portfolio:latest
```

Abrir en el navegador: http://localhost:3000

Para detener: `Ctrl + C`

### Opción 2: Usando Docker Compose (con el código fuente)

```bash
docker compose up --build
```

Abrir en el navegador: http://localhost:3000

Para detener: `Ctrl + C`. Para eliminar contenedores y red:

```bash
docker compose down
```

## Uso de la Aplicación

1. Ingresar un nombre de usuario en el campo "userId" (ej: juan_01).
2. Completar el formulario con:
   - Símbolo de la acción (ej: AAPL)
   - Número de acciones (ej: 10)
   - Precio de cada acción (ej: 150.00)
3. Presionar **"Agregar acción"** para guardar la acción en el portafolio.
4. Presionar **"Calcular valor total"** para obtener el valor total del portafolio.
5. Los resultados se muestran en la tabla y en el cuadro JSON de la página.

## Estructura de carpetas

```text
.
├── public/
│   └── index.html         # UI estática (HTML/CSS/JS)
├── server.js              # API REST + static server
├── package.json
├── Dockerfile
├── docker-compose.yml
├── readme.txt
└── .dockerignore
```

## Formato de datos

Cada usuario se guarda en el volume de la imagen de docker`./data/<userId>.json`:

```json
{
  "holdings": [
    { "symbol": "AAPL", "shares": 10, "price": 123.45 }
  ]
}

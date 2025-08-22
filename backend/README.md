# TrackMyExpenses - Backend API

Sistema de gestión de gastos y facturas con autenticación JWT, gestión de productos y estadísticas avanzadas.

## 🚀 Características

- **Autenticación JWT** completa
- **Gestión de usuarios** con perfiles
- **CRUD de productos** con códigos únicos
- **Gestión de facturas** con múltiples productos
- **Cálculo automático** de totales y descuentos
- **Filtros avanzados** por fecha, método de pago, lugar
- **Estadísticas** de gastos con gráficas
- **Paginación** en todos los listados
- **Validación** de datos con express-validator
- **Base de datos** MySQL con Prisma ORM

## 📋 Requisitos

- Node.js 18+ 
- MySQL 8.0+
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd trackmyexpenses/backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
DATABASE_URL="mysql://usuario:password@localhost:3306/trackmyexpenses"
JWT_SECRET="tu-secreto-super-seguro"
PORT=3000
```

4. **Configurar la base de datos**
```bash
# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# O si prefieres hacer push directo
npm run db:push
```

5. **Generar datos de prueba (opcional)**
```bash
npm run seed
```

6. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📊 Estructura de la Base de Datos

### Usuarios
- `id`: Identificador único
- `tipoDocumento`: CC, CE, TI, etc.
- `documento`: Número de documento (único)
- `nombres`: Nombres del usuario
- `apellidos`: Apellidos del usuario
- `correo`: Email (único)
- `contrasena`: Contraseña hasheada
- `foto`: URL de la foto (opcional)
- `fechaIngreso`: Fecha de registro automática
- `fechaUltimaEdicion`: Fecha de última edición

### Productos
- `id`: Identificador único
- `codigo`: Código del producto (único)
- `nombre`: Nombre del producto
- `precioUnitario`: Precio por unidad

### Facturas
- `id`: Identificador único
- `codigoFactura`: Código de la factura (único)
- `metodoPago`: EFECTIVO, TARJETA_CREDITO, TARJETA_DEBITO, TRANSFERENCIA, OTRO
- `lugarCompra`: Nombre del establecimiento
- `nitProveedor`: NIT del proveedor (opcional)
- `fechaHoraCompra`: Fecha y hora de la compra
- `totalPagar`: Total calculado automáticamente
- `usuarioId`: ID del usuario que creó la factura

### FacturaProducto (Tabla intermedia)
- `id`: Identificador único
- `facturaId`: ID de la factura
- `productoId`: ID del producto
- `cantidad`: Cantidad comprada
- `descuento`: Porcentaje de descuento (opcional)
- `precioTotal`: Precio total con descuento

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación.

### Headers requeridos:
```
Authorization: Bearer <token>
```
o
```
token: <token>
```

## 📡 Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Usuarios
- `GET /api/users/me` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil
- `GET /api/users` - Listar usuarios (admin)
- `DELETE /api/users/:id` - Eliminar usuario (admin)

### Productos
- `POST /api/productos` - Crear producto
- `GET /api/productos` - Listar productos
- `GET /api/productos/:id` - Obtener producto
- `GET /api/productos/codigo/:codigo` - Buscar por código
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto
- `GET /api/productos/mas-vendidos` - Productos más vendidos

### Facturas
- `POST /api/facturas` - Crear factura
- `GET /api/facturas` - Listar facturas
- `GET /api/facturas/:id` - Obtener factura
- `PUT /api/facturas/:id` - Actualizar factura
- `DELETE /api/facturas/:id` - Eliminar factura
- `GET /api/facturas/estadisticas` - Estadísticas de gastos

## 🔍 Filtros Disponibles

### Facturas
- `usuarioId`: Filtrar por usuario
- `fechaInicio` / `fechaFin`: Rango de fechas
- `metodoPago`: Método de pago específico
- `lugarCompra`: Búsqueda por lugar
- `page` / `limit`: Paginación

### Productos
- `codigo`: Búsqueda por código
- `nombre`: Búsqueda por nombre
- `page` / `limit`: Paginación

### Estadísticas
- `usuarioId`: Filtrar por usuario
- `fechaInicio` / `fechaFin`: Rango de fechas

## 📈 Estadísticas Disponibles

- **Total gastado** en un período
- **Gasto por método de pago**
- **Gasto por mes** (últimos 12 meses)
- **Lugares más frecuentes** de compra
- **Productos más vendidos**

## 🧪 Datos de Prueba

El script de seed crea:
- 3 usuarios de prueba
- 8 productos comunes
- 20 facturas con datos aleatorios

### Credenciales de prueba:
```
admin@example.com / password123
juan@example.com / password123
maria@example.com / password123
```

## 🛡️ Seguridad

- Contraseñas hasheadas con bcrypt
- JWT con expiración
- Validación de datos en todos los endpoints
- Middleware de autenticación
- Manejo de errores centralizado

## 📝 Ejemplo de Uso

### 1. Registrar usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tipoDocumento": "CC",
    "documento": "12345678",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "correo": "juan@example.com",
    "contrasena": "password123"
  }'
```

### 2. Iniciar sesión
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "juan@example.com",
    "contrasena": "password123"
  }'
```

### 3. Crear factura
```bash
curl -X POST http://localhost:3000/api/facturas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "codigoFactura": "FAC-001-2024",
    "metodoPago": "TARJETA_CREDITO",
    "lugarCompra": "Supermercado Central",
    "usuarioId": 1,
    "productos": [
      {
        "codigo": "PROD-001",
        "cantidad": 2,
        "descuento": 10.5
      }
    ]
  }'
```

## 🚨 Códigos de Error

- `400`: Datos inválidos
- `401`: No autenticado
- `403`: No autorizado
- `404`: Recurso no encontrado
- `409`: Conflicto (código duplicado)
- `500`: Error interno del servidor

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm run start        # Iniciar en producción
npm run seed         # Generar datos de prueba
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Sincronizar esquema con BD
npm run db:migrate   # Ejecutar migraciones
```

## 📚 Documentación Completa

Ver `API_DOCUMENTATION.md` para documentación detallada de todos los endpoints.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.
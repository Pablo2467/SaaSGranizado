# Granizado Express

SaaS de gestión para granizaderos: productos, insumos (inventario), pedidos, empleados, suscripción y reportes de ganancias. Multi-tenant (cada empresa ve solo sus propios datos).

## Tabla de contenido

- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Puesta en marcha](#puesta-en-marcha)
- [Roles y permisos](#roles-y-permisos)
- [Modelo de datos](#modelo-de-datos)
- [Estados de un pedido](#estados-de-un-pedido)
- [Referencia de la API](#referencia-de-la-api)
- [Decisiones de diseño importantes](#decisiones-de-diseño-importantes)
- [Problemas conocidos y pendientes](#problemas-conocidos-y-pendientes)
- [Errores ya resueltos (para no repetirlos)](#errores-ya-resueltos-para-no-repetirlos)

---

## Stack tecnológico

**Backend**
- Java 21 + Spring Boot 3.3.5
- Spring Security + JWT (`jjwt` 0.12.5) — autenticación stateless
- Spring Data JPA + Hibernate
- PostgreSQL
- Flyway — migraciones de base de datos versionadas
- Gradle (con el wrapper `gradlew` / `gradlew.bat`)
- Lombok

**Frontend**
- React 19 + Vite
- React Router 7
- Tailwind CSS v4 (config vía `@theme` en `index.css`, sin `tailwind.config.js`)
- axios
- lucide-react (íconos)

---

## Estructura del proyecto

```
granizado-express-proyecto-completo/
├── backend/
│   └── src/main/java/com/granizadoexpress/
│       ├── controller/     # Endpoints REST
│       ├── service/        # Lógica de negocio
│       ├── repository/     # Acceso a datos (Spring Data JPA)
│       ├── entity/         # Entidades JPA (tablas)
│       ├── dto/            # Request/Response que viajan por la API
│       ├── security/       # JWT, filtros, autenticación
│       └── config/         # CORS, seguridad general
│   └── src/main/resources/
│       ├── application.properties
│       └── db/migration/   # Scripts SQL de Flyway (V1__..., V2__..., etc.)
│
└── frontend/
    └── src/
        ├── pages/           # Una página por sección (Productos, Pedidos, etc.)
        ├── components/      # Piezas reutilizables (modales, tablas, badges)
        ├── context/         # AuthContext (sesión, rol, token)
        ├── api/axios.js     # Cliente HTTP con el token inyectado automáticamente
        └── index.css        # Paleta de colores y estilos globales (Tailwind v4)
```

---

## Requisitos previos

- **Java 21** (JDK)
- **PostgreSQL** corriendo localmente (o accesible por red)
- **Node.js 18+** y npm
- Un cliente de base de datos (opcional, para inspeccionar datos) — pgAdmin, DBeaver, TablePlus, etc.

---

## Puesta en marcha

### 1. Base de datos

Crea la base de datos en PostgreSQL:

```sql
CREATE DATABASE granizado_db;
```

Las credenciales que espera el backend por defecto están en `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://127.0.0.1:5432/granizado_db
spring.datasource.username=postgres
spring.datasource.password=postgres123
```

Ajusta usuario/contraseña ahí si tu Postgres local usa otros. **No hace falta crear tablas a mano** — Flyway corre automáticamente las 11 migraciones (`db/migration/V1__...` a `V11__...`) la primera vez que arranca el backend.

### 2. Backend

```bash
cd backend
./gradlew bootRun          # Mac/Linux
.\gradlew.bat bootRun       # Windows PowerShell
```

Queda escuchando en `http://localhost:8080`.

> ⚠️ Si vas a editar `build.gradle`, siempre corre `./gradlew clean bootRun` después (o "Reload Gradle Project" + reiniciar si usas el botón Run del IDE) — ver la sección de [errores ya resueltos](#errores-ya-resueltos-para-no-repetirlos) más abajo.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Queda escuchando en `http://localhost:5173`. El cliente HTTP (`src/api/axios.js`) apunta a `http://localhost:8080` — si cambias el puerto del backend, actualiza esa constante.

### 4. Primer usuario

No hay seed de datos: regístrate desde la pantalla de Login (`/login` → link de registro). El primer usuario de una empresa nueva queda con rol `DUENO` automáticamente y su empresa arranca en plan `TRIAL`.

---

## Roles y permisos

| Rol | Ve/gestiona | Restringido de |
|---|---|---|
| `DUENO` | Todo: productos, insumos, pedidos, empleados, suscripción, ganancias | — |
| `ENCARGADO_PRODUCCION` | Productos, insumos, pedidos, ganancias | Empleados, cambios de plan |
| `OPERADOR_MAQUINA` | Pedidos, suscripción (solo lectura) | Productos, insumos, empleados, ganancias |
| `CAJERO` | Pedidos, suscripción (solo lectura) | Productos, insumos, empleados, ganancias |

Esto se aplica en **dos capas** (no confiar solo en el frontend):
- **Frontend**: `App.jsx` envuelve cada ruta en `<RutaProtegida rolesPermitidos={[...]}>`, y `DashboardLayout.jsx` oculta los enlaces del menú que el rol no puede usar.
- **Backend**: cada controlador restringido tiene `@PreAuthorize("hasRole('DUENO')")` o `hasAnyRole(...)` a nivel de clase o de método — esta es la que realmente importa para seguridad, la del frontend es solo UX.

---

## Modelo de datos

Entidades principales (todas con `empresa_id` para aislar los datos entre empresas):

- **Empresa** — el tenant. Tiene una Suscripción.
- **Usuario** — pertenece a una Empresa, tiene un rol, puede tener `sabores` asignados (para operadores de máquina).
- **Producto** — lo que se vende (nombre, precio, categoría, disponible).
- **Insumo** — materia prima (nombre, cantidad actual, stock mínimo, costo unitario, unidad de medida).
- **Receta** — relaciona un Producto con los Insumos que consume y en qué cantidad (para descontar inventario automáticamente al vender).
- **Pedido** — una venta: cliente, canal (WhatsApp/Presencial/Web), estado, notas, total. Tiene una lista de `DetallePedido`.
- **DetallePedido** — línea de un pedido (producto, cantidad, precio unitario, subtotal).
- **HistorialInventario** — kárdex: cada movimiento de stock (SALIDA al vender, ENTRADA al reponer/cancelar) queda registrado, ligado al insumo y opcionalmente al pedido que lo originó.
- **Suscripcion** — plan de la empresa (`TRIAL`, `BASICO`, `PRO`), estado (`ACTIVA`, `VENCIDA`, `CANCELADA`, `PAUSADA`), fecha de vencimiento.

---

## Estados de un pedido

```
PENDIENTE → CONFIRMADO → EN_PREPARACION → ENTREGADO
     └──────────────┴───────────────┘
                     ↓
                CANCELADO   (posible desde cualquier estado, excepto ENTREGADO)
```

- Al **crear** un pedido, el inventario se descunta inmediatamente (estado inicial `PENDIENTE`), verificando primero que haya stock suficiente de **todos** los insumos antes de descontar nada (si falta uno, no se descuenta ninguno).
- Al **cancelar** (o "eliminar") un pedido, el sistema busca en `HistorialInventario` todos los movimientos `SALIDA` de ese pedido y genera los `ENTRADA` inversos correspondientes — repone automáticamente el stock.
- **Solo cuentan como venta real** (para las estadísticas de Ganancias) los pedidos en estado `CONFIRMADO`, `EN_PREPARACION` o `ENTREGADO`. `PENDIENTE` no se contabiliza todavía (no es una venta segura) y `CANCELADO` nunca lo fue.
- En el frontend, el estado se muestra como una "píldora" clicable (`EstadoPedidoBadge.jsx`) que avanza al siguiente estado del flujo con un clic — sin necesidad de abrir el pedido.

---

## Referencia de la API

Base URL: `http://localhost:8080`. Todos los endpoints salvo `/auth/registro` y `/auth/login` requieren header `Authorization: Bearer <token>`.

### Auth (`/auth`)
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/auth/registro` | público | Crea empresa + primer usuario (DUENO) |
| POST | `/auth/login` | público | Devuelve JWT + datos básicos |
| GET | `/auth/me` | cualquiera | Usuario autenticado actual |

### Productos (`/productos`)
| Método | Ruta | Rol |
|---|---|---|
| POST | `/productos` | DUENO, ENCARGADO_PRODUCCION |
| GET | `/productos` | cualquiera |
| GET | `/productos/{id}` | cualquiera |
| PUT | `/productos/{id}` | DUENO, ENCARGADO_PRODUCCION |
| DELETE | `/productos/{id}` | DUENO, ENCARGADO_PRODUCCION |

### Recetas (`/productos/{productoId}/recetas`) — todo el controlador requiere DUENO o ENCARGADO_PRODUCCION
| Método | Ruta |
|---|---|
| GET | `/productos/{productoId}/recetas` |
| POST | `/productos/{productoId}/recetas` |
| PUT | `/productos/{productoId}/recetas/{recetaId}` |
| DELETE | `/productos/{productoId}/recetas/{recetaId}` |

### Insumos (`/insumos`) — todo el controlador requiere DUENO o ENCARGADO_PRODUCCION
| Método | Ruta |
|---|---|
| POST | `/insumos` |
| GET | `/insumos` |
| GET | `/insumos/{id}` |
| PUT | `/insumos/{id}` |
| DELETE | `/insumos/{id}` |

### Pedidos (`/pedidos`)
| Método | Ruta | Rol |
|---|---|---|
| POST | `/pedidos` | DUENO, CAJERO |
| GET | `/pedidos` | cualquiera |
| GET | `/pedidos/{id}` | cualquiera |
| PUT | `/pedidos/{id}` | DUENO, CAJERO — edita solo cliente/canal/notas, no los productos |
| PATCH | `/pedidos/{id}/estado` | DUENO, CAJERO — body: `{ "estado": "CONFIRMADO" }` |
| DELETE | `/pedidos/{id}` | DUENO, CAJERO — cancela y repone inventario |

### Empleados (`/empleados`) — todo el controlador requiere DUENO
| Método | Ruta |
|---|---|
| POST | `/empleados` |
| GET | `/empleados` |
| PUT | `/empleados/{id}` |
| PATCH | `/empleados/{id}/estado` — body: `{ "activo": true }` |
| DELETE | `/empleados/{id}` |

### Suscripción (`/suscripcion`)
| Método | Ruta | Rol |
|---|---|---|
| GET | `/suscripcion/estado` | cualquiera |
| POST | `/suscripcion/cambiar-plan` | DUENO |
| POST | `/suscripcion/cancelar` | DUENO |
| POST | `/suscripcion/reactivar` | DUENO |

### Estadísticas / Ganancias (`/estadisticas/ganancias`) — todo el controlador requiere DUENO o ENCARGADO_PRODUCCION
| Método | Ruta | Query params | Descripción |
|---|---|---|---|
| GET | `/estadisticas/ganancias/resumen` | — | Totales de hoy / semana / mes / año |
| GET | `/estadisticas/ganancias/serie` | `periodo` (`dia`\|`semana`\|`mes`\|`anio`), `anio`, `mes` (opcionales) | Serie de puntos para el gráfico y el calendario |
| GET | `/estadisticas/ganancias/por-producto` | mismos que arriba | Ranking de ventas por producto en ese periodo |

---

## Decisiones de diseño importantes

- **Multi-tenant por `empresa_id`**: cada consulta a la base de datos filtra por la empresa del usuario autenticado (obtenida del JWT vía `SecurityUtils.obtenerEmpresaId()`). Nunca se confía en un `empresaId` que venga del cliente.
- **"Eliminar" pedido = cancelar, no borrar**: se conserva el registro histórico y se repone el inventario, en vez de un DELETE físico — así el kárdex de insumos siempre cuadra.
- **Ganancias con datos reales, no simulados**: `EstadisticasService` calcula todo a partir de los pedidos reales (filtrando por estado y rango de fechas), no hay datos hardcodeados.
- **Paleta de marca**: azul (`azul-*`) como color principal, `frambuesa` (rosa) reservado para estados de error/peligro/cancelado — no se usa como color de marca.

---

## Problemas conocidos y pendientes

- **Pago real de la suscripción**: el cambio de plan (`/suscripcion/cambiar-plan`) activa el plan directamente sin pasar por una pasarela de pago real — pendiente de integrar (Wompi, Stripe, etc.) antes de cobrar en producción.
- **Sin pruebas automatizadas**: no hay tests unitarios/de integración todavía (`testImplementation` está en `build.gradle` pero sin tests escritos).
- **CORS fijo a `localhost:5173`**: `application.properties` tiene `spring.web.cors.allowed-origins=http://localhost:5173` — hay que actualizarlo (o mover a variable de entorno) antes de desplegar a un dominio real.
- **Secretos en texto plano**: `jwt.secret` y las credenciales de la base de datos están directo en `application.properties` — antes de producción, mover a variables de entorno.
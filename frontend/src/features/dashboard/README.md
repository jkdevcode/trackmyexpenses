# frontend/src/features/dashboard

Feature de analitica y visualizacion de resumen financiero.

## Responsibilities

- Consultar estadisticas agregadas desde backend.
- Transformar datos de facturas a series para graficas.
- Renderizar KPIs, tablas y filtros por periodo.

## Main Files

- **`pages/Dashboard.tsx`**: Composicion principal del dashboard.
- **`hooks/useDashboardData.ts`**: Query por periodo + manejo de errores.
- **`services/dashboardService.ts`**: Mapeo tipado de respuestas API.
- **`components/RevenueChart.tsx`**: Grafica de gasto mensual.

## Usage

- Accedido en ruta protegida `/dashboard`.
- Depende de React Query y `axiosClient`.
- Reutiliza tipos de `types.ts` para contratos de vista.

# 💸 Finanza Pro — Sistema de Gastos Minimalista

Sistema moderno, profesional y minimalista para el control y gestión de gastos e ingresos personales, desarrollado con un stack actual (**Next.js**, **React 19**, **TypeScript**, **Tailwind CSS** y **Lucide React**), con persistencia completa en el **`localStorage`** del navegador.

---

## ✨ Características Principales

- **🎨 Diseño Ultra Minimalista & Moderno**:
  - Estética refinada inspirada en los estándares de diseño de *Linear* y *Vercel* (tonos zinc oscuros, bordes sutiles y micro-interacciones fluidas).
  - **Sidebar de Navegación Profesional**: Menú lateral persistente con balance rápido, botón directo de nuevo movimiento y soporte responsive tipo drawer para móviles.
  - **Gráficos Integrados**:
    - Comparativa mensual de Flujo de Ingresos vs Gastos en barras interactivas con tooltips.
    - Gráfico Donut SVG de distribución porcentual de gastos por categoría.

- **📊 Panel General (Dashboard)**:
  - Tarjetas KPI: Balance Neto, Total Ingresos, Total Gastos y Presupuesto Restante / Tasa de Ahorro.
  - Historial rápido de los últimos 5 movimientos con acciones directas de edición o eliminación.

- **💳 Gestión de Movimientos (Transacciones)**:
  - Registro ágil de Gastos e Ingresos con selector de tipo, monto, concepto, categorías con iconos, métodos de pago (Efectivo, Débito, Crédito, Transferencia), fecha y notas opcionales.
  - Búsqueda en tiempo real por texto o descripción.
  - Filtros instantáneos por tipo (Gasto / Ingreso), por categoría y por método de pago.
  - Ordenamiento (más recientes, más antiguos, mayor o menor monto).
  - Edición y eliminación con actualización en tiempo real.

- **🎯 Presupuestos & Metas de Gasto**:
  - Límite mensual configurable con barra de progreso interactiva.
  - Estados inteligentes de alerta (*Bajo Control*, *Cerca del Límite* o *Presupuesto Excedido*).
  - Desglose del consumo presupuestario por categoría.

- **📈 Estadísticas & Análisis**:
  - Tasa de ahorro neta en porcentaje.
  - Promedio de gasto diario estimado.
  - Registro del gasto individual más alto.
  - Distribución de gastos por método de pago y tabla detallada con ticket promedio.

- **⚙️ Configuración & Gestión de Datos (Local Storage)**:
  - Selector de símbolo de moneda (`S/.`, `$`, `€`, `MX$`, etc.).
  - Nombre de usuario personalizado.
  - **Exportación a CSV / Excel**: Descarga tus movimientos en formato estructurado para hojas de cálculo.
  - **Copia de Seguridad en JSON**: Exporta e importa copias de respaldo completas de tus datos.
  - **Carga de Datos de Demostración**: Botón para restaurar datos de ejemplo cuando lo desees.
  - Opción de borrado total de datos.

---

## 🚀 Cómo Ejecutar el Proyecto

1. **Instalar dependencias** (ya instaladas):
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador**:
   Visita [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Biblioteca UI**: [React](https://react.dev/)
- **Componentes UI**: [shadcn/ui](https://ui.shadcn.com/) (Card, Button, Dialog, Badge, Input, Label, Progress, Table, Separator, Avatar, Tabs)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Almacenamiento**: Browser `localStorage` (sin necesidad de configurar base de datos externa)

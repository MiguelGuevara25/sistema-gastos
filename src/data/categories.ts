import { Category } from "../types/finance";

export const DEFAULT_CATEGORIES: Category[] = [
  // Gastos
  {
    id: "cat-alimentacion",
    name: "Alimentación",
    icon: "Utensils",
    color: "#f97316",
    type: "expense",
  },
  {
    id: "cat-transporte",
    name: "Transporte",
    icon: "Car",
    color: "#3b82f6",
    type: "expense",
  },
  {
    id: "cat-vivienda",
    name: "Vivienda",
    icon: "Home",
    color: "#6366f1",
    type: "expense",
  },
  {
    id: "cat-servicios",
    name: "Servicios",
    icon: "Zap",
    color: "#06b6d4",
    type: "expense",
  },
  {
    id: "cat-entretenimiento",
    name: "Entretenimiento",
    icon: "Film",
    color: "#a855f7",
    type: "expense",
  },
  {
    id: "cat-salud",
    name: "Salud & Cuidado",
    icon: "HeartPulse",
    color: "#f43f5e",
    type: "expense",
  },
  {
    id: "cat-educacion",
    name: "Educación",
    icon: "GraduationCap",
    color: "#10b981",
    type: "expense",
  },
  {
    id: "cat-compras",
    name: "Compras",
    icon: "ShoppingBag",
    color: "#ec4899",
    type: "expense",
  },
  {
    id: "cat-otros-gastos",
    name: "Otros Gastos",
    icon: "MoreHorizontal",
    color: "#64748b",
    type: "expense",
  },

  // Ingresos
  {
    id: "cat-salario",
    name: "Salario / Nómina",
    icon: "Briefcase",
    color: "#10b981",
    type: "income",
  },
  {
    id: "cat-freelance",
    name: "Freelance & Extras",
    icon: "Laptop",
    color: "#14b8a6",
    type: "income",
  },
  {
    id: "cat-inversiones",
    name: "Inversiones",
    icon: "TrendingUp",
    color: "#8b5cf6",
    type: "income",
  },
  {
    id: "cat-ventas",
    name: "Ventas",
    icon: "Tag",
    color: "#f59e0b",
    type: "income",
  },
  {
    id: "cat-otros-ingresos",
    name: "Otros Ingresos",
    icon: "PlusCircle",
    color: "#64748b",
    type: "income",
  },
];

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta_debito: "Tarjeta de Débito",
  tarjeta_credito: "Tarjeta de Crédito",
  transferencia: "Transferencia Bancaria",
  otro: "Otro",
};

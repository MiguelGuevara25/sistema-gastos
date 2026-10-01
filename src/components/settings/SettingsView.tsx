'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useFinance } from '../../context/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  User,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Check,
  AlertCircle,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { PwaInstallPrompt } from '../pwa/PwaInstallPrompt';

interface SettingsFormData {
  userName: string;
  currency: string;
  currencyCode: string;
  monthlyBudget: number | string;
}

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDefaultData,
    clearAllData,
    exportToCSV,
    exportToJSON,
    importFromJSON,
    transactions,
  } = useFinance();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch } = useForm<SettingsFormData>({
    values: {
      userName: settings.userName,
      currency: settings.currency,
      currencyCode: settings.currencyCode,
      monthlyBudget: settings.monthlyBudget.toString(),
    },
  });

  const currentCurrency = watch('currency');

  const onSaveProfile = (data: SettingsFormData) => {
    const budgetNum = parseFloat(String(data.monthlyBudget));
    updateSettings({
      userName: data.userName.trim() || 'Usuario',
      currency: data.currency,
      currencyCode: data.currencyCode,
      monthlyBudget: !isNaN(budgetNum) && budgetNum > 0 ? budgetNum : settings.monthlyBudget,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importFromJSON(content);
        if (success) {
          setImportStatus('Datos importados exitosamente.');
        } else {
          setImportStatus('Error: El archivo JSON no tiene un formato válido.');
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Save Toast Notification */}
      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="size-4" />
          Configuración guardada correctamente
        </div>
      )}

      {importStatus && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            importStatus.includes('Error')
              ? 'bg-destructive/10 border-destructive/20 text-destructive'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}
        >
          <AlertCircle className="size-4" />
          {importStatus}
        </div>
      )}

      {/* Profile & Currency Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            Preferencias Generales
          </CardTitle>
          <CardDescription className="text-xs">
            Personaliza tu moneda, nombre y límite presupuestario base
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Nombre de Usuario
                </Label>
                <Input
                  type="text"
                  {...register('userName')}
                  placeholder="Tu nombre"
                  className="h-10 bg-muted/40"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Símbolo de Moneda
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { symbol: 'S/.', code: 'PEN', label: 'Soles' },
                    { symbol: '$', code: 'USD', label: 'USD' },
                    { symbol: '€', code: 'EUR', label: 'Euros' },
                    { symbol: 'MX$', code: 'MXN', label: 'Pesos' },
                  ].map((cur) => (
                    <Button
                      key={cur.code}
                      type="button"
                      variant={currentCurrency === cur.symbol ? 'secondary' : 'outline'}
                      onClick={() => {
                        setValue('currency', cur.symbol);
                        setValue('currencyCode', cur.code);
                      }}
                      className={`h-auto py-1.5 px-2 flex flex-col items-center cursor-pointer ${
                        currentCurrency === cur.symbol ? 'border-primary/50 font-bold' : ''
                      }`}
                    >
                      <span className="text-xs">{cur.symbol}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">{cur.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Presupuesto Mensual por Defecto ({currentCurrency})
              </Label>
              <Input
                type="number"
                step="50"
                {...register('monthlyBudget')}
                className="w-full sm:w-1/2 h-10 bg-muted/40"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="cursor-pointer font-semibold shadow-xs"
              >
                Guardar Preferencias
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Mobile App PWA Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Smartphone className="size-4 text-primary" />
            Aplicación Móvil (PWA)
          </CardTitle>
          <CardDescription className="text-xs">
            Instala Finanza en tu iPhone, Android o PC para tener acceso instantáneo a pantalla completa y sin barras de navegación.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/20 border border-border">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">
                Instalación Directa y Segura
              </p>
              <p className="text-[11px] text-muted-foreground">
                No necesitas descargar nada de la App Store ni Google Play. Funciona como una Web App Progresiva instalable.
              </p>
            </div>
            <PwaInstallPrompt />
          </div>
        </CardContent>
      </Card>

      {/* Storage and Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <HardDrive className="size-4 text-muted-foreground" />
            Almacenamiento Local (Local Storage)
          </CardTitle>
          <CardDescription className="text-xs">
            Tus datos se guardan de forma privada en tu navegador. Puedes exportar copias de respaldo en cualquier momento.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Almacenamiento Privado Activo
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {transactions.length} transacciones almacenadas localmente en este dispositivo.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons using shadcn Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Export JSON */}
            <Button
              variant="outline"
              onClick={exportToJSON}
              className="h-auto p-3.5 flex items-center justify-between text-left cursor-pointer group"
            >
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary">
                  Exportar Copia (JSON)
                </p>
                <p className="text-[11px] text-muted-foreground">Respaldo íntegro de configuración y gastos</p>
              </div>
              <Download className="size-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-2" />
            </Button>

            {/* Export CSV */}
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="h-auto p-3.5 flex items-center justify-between text-left cursor-pointer group"
            >
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary">
                  Exportar a Excel (CSV)
                </p>
                <p className="text-[11px] text-muted-foreground">Para hojas de cálculo y reportes externos</p>
              </div>
              <Download className="size-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-2" />
            </Button>

            {/* Import JSON */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-auto p-3.5 flex items-center justify-between text-left cursor-pointer group"
              >
                <div>
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary">
                    Restaurar Copia (JSON)
                  </p>
                  <p className="text-[11px] text-muted-foreground">Cargar un respaldo anterior</p>
                </div>
                <Upload className="size-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-2" />
              </Button>
            </div>

            {/* Reset sample data */}
            <Button
              variant="outline"
              onClick={() => {
                if (confirm('¿Deseas restablecer los datos con los ejemplos predeterminados?')) {
                  resetToDefaultData();
                }
              }}
              className="h-auto p-3.5 flex items-center justify-between text-left cursor-pointer group"
            >
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary">
                  Cargar Datos de Demostración
                </p>
                <p className="text-[11px] text-muted-foreground">Restablece los datos de prueba iniciales</p>
              </div>
              <RefreshCw className="size-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-2" />
            </Button>
          </div>

          <Separator className="my-2" />

          {/* Danger Zone */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-destructive">Zona de Riesgo</p>
              <p className="text-[11px] text-muted-foreground">Borra todos los movimientos registrados</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm('¿Estás seguro de que deseas eliminar TODOS los movimientos? Esta acción no se puede deshacer.')) {
                  clearAllData();
                }
              }}
              className="gap-1.5 cursor-pointer text-xs"
            >
              <Trash2 className="size-3.5" />
              Borrar Todo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

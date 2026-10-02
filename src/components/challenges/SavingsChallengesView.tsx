"use client";

import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { SavingsChallenge } from "../../types/finance";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trophy,
  Award,
  Zap,
  CalendarDays,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Plus,
  Sparkles,
  Coins,
  Check,
  Star,
  Target,
} from "lucide-react";

export const SavingsChallengesView: React.FC = () => {
  const {
    challenges,
    addChallenge,
    toggleChallengeStep,
    deleteChallenge,
    accounts,
    formatCurrency,
  } = useFinance();

  const [activeTabChallengeId, setActiveTabChallengeId] = useState<string>(
    challenges[0]?.id || "",
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New challenge form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTargetAmount, setNewTargetAmount] = useState("1000");
  const [newDurationUnits, setNewDurationUnits] = useState("30");
  const [newUnitType, setNewUnitType] = useState<"weeks" | "days">("days");

  const currentChallenge =
    challenges.find((c) => c.id === activeTabChallengeId) || challenges[0];

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addChallenge({
      title: newTitle.trim(),
      description: newDescription.trim() || "Desafío personalizado de ahorro.",
      type: "custom",
      targetAmount: Number(newTargetAmount) || 1000,
      currentAmount: 0,
      startDate: new Date().toISOString().split("T")[0],
      durationUnits: Number(newDurationUnits) || 30,
      unitType: newUnitType,
      completedSteps: [],
      status: "active",
      badgeIcon: "Target",
      rewardBadge: "Ahorrador Estrella",
    });

    setNewTitle("");
    setNewDescription("");
    setIsAddModalOpen(false);
  };

  // Badges system
  const totalCompletedSteps = challenges.reduce(
    (sum, c) => sum + c.completedSteps.length,
    0,
  );
  const totalSavedInChallenges = challenges.reduce(
    (sum, c) => sum + c.currentAmount,
    0,
  );

  const badges = [
    {
      id: "b1",
      title: "Primer Paso",
      desc: "Completaste tu primer hito de ahorro",
      unlocked: totalCompletedSteps >= 1,
      icon: "🌱",
    },
    {
      id: "b2",
      title: "Racha de 7 Días",
      desc: "7 pasos consecutivos cumplidos",
      unlocked: totalCompletedSteps >= 7,
      icon: "🔥",
    },
    {
      id: "b3",
      title: "Escudo Anti-Fugas",
      desc: "14 días sin gastos hormiga",
      unlocked: totalCompletedSteps >= 14,
      icon: "🛡️",
    },
    {
      id: "b4",
      title: "Club de los S/ 500",
      desc: "Más de S/ 500 ahorrados en retos",
      unlocked: totalSavedInChallenges >= 500,
      icon: "💎",
    },
    {
      id: "b5",
      title: "Ahorrador Titán",
      desc: "Completaste más de 30 hitos",
      unlocked: totalCompletedSteps >= 30,
      icon: "👑",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="size-5 sm:size-6 text-amber-400" />
            Retos de Ahorro Gamificados
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Convierte tus metas en un juego interactivo con pasos diarios/semanales y medallas
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="cursor-pointer gap-1.5 font-semibold shadow-xs text-xs h-8"
        >
          <Plus className="size-3.5" />
          <span>Crear Reto Personalizado</span>
        </Button>
      </div>

      {/* Badges / Medallas Banner */}
      <Card className="border-border/80 shadow-xs bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Award className="size-4 text-primary" /> Vitrina de Logros & Medallas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-3 rounded-xl border text-center transition-all ${
                  b.unlocked
                    ? "border-amber-500/40 bg-amber-500/10 text-foreground"
                    : "border-border/40 bg-muted/20 opacity-50 grayscale"
                }`}
              >
                <div className="text-2xl mb-1">{b.icon}</div>
                <p className="text-xs font-bold truncate">{b.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                  {b.desc}
                </p>
                <Badge
                  variant={b.unlocked ? "default" : "outline"}
                  className="mt-2 text-[9px] px-1.5 py-0"
                >
                  {b.unlocked ? "Desbloqueado" : "Bloqueado"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Challenge Selector Tabs & Detail */}
      {challenges.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center border-dashed border-border/80">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Trophy className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No tienes retos de ahorro creados</h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto">
            Crea retos de ahorro gamificados como el de las 52 Semanas o 30 Días para motivarte a acumular dinero paso a paso.
          </p>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" />
            Crear mi primer reto
          </Button>
        </Card>
      ) : (
        <>
          {/* Challenge Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/70 scrollbar-none">
            {challenges.map((c) => {
              const isActive = (currentChallenge?.id || "") === c.id;
              const pct = Math.min(
                100,
                Math.round((c.completedSteps.length / c.durationUnits) * 100),
              );

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveTabChallengeId(c.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-2.5 shrink-0 border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <span>{c.title}</span>
                  <Badge
                    variant={isActive ? "secondary" : "outline"}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {pct}%
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* Active Challenge Detail Card */}
          {currentChallenge && (
            <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  {currentChallenge.title}
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                    Recompensa: {currentChallenge.rewardBadge}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {currentChallenge.description}
                </CardDescription>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">Progreso Acumulado</p>
                  <p className="text-base font-bold font-mono text-emerald-400">
                    {formatCurrency(currentChallenge.currentAmount)}{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      / {formatCurrency(currentChallenge.targetAmount)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>
                  {currentChallenge.completedSteps.length} de {currentChallenge.durationUnits}{" "}
                  {currentChallenge.unitType === "weeks" ? "semanas" : "días"} completados
                </span>
                <span className="font-semibold text-foreground">
                  {Math.round(
                    (currentChallenge.completedSteps.length / currentChallenge.durationUnits) * 100,
                  )}
                  %
                </span>
              </div>
              <Progress
                value={(currentChallenge.completedSteps.length / currentChallenge.durationUnits) * 100}
                className="h-2"
              />
            </div>
          </CardHeader>

          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Target className="size-3.5 text-primary" /> Casillas de Cumplimiento (Haz click para marcar)
              </h4>
              <span className="text-[11px] text-muted-foreground">
                Monto sugerido por paso:{" "}
                <strong className="text-foreground">
                  {formatCurrency(
                    Number(
                      (currentChallenge.targetAmount / currentChallenge.durationUnits).toFixed(2),
                    ),
                  )}
                </strong>
              </span>
            </div>

            {/* Interactive Steps Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-13 gap-2">
              {Array.from({ length: currentChallenge.durationUnits }, (_, i) => i + 1).map(
                (stepNum) => {
                  const isChecked = currentChallenge.completedSteps.includes(stepNum);
                  const stepAmount = Number(
                    (currentChallenge.targetAmount / currentChallenge.durationUnits).toFixed(2),
                  );

                  return (
                    <button
                      key={stepNum}
                      type="button"
                      onClick={() =>
                        toggleChallengeStep(
                          currentChallenge.id,
                          stepNum,
                          stepAmount,
                        )
                      }
                      className={`p-2 rounded-xl text-center flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-emerald-500 text-white border-emerald-600 shadow-xs scale-98"
                          : "bg-background/60 hover:bg-muted/50 border-border/70 text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                    >
                      <div className="flex items-center justify-center size-5 rounded-full mb-1">
                        {isChecked ? (
                          <Check className="size-3.5 stroke-[3]" />
                        ) : (
                          <span className="text-[11px] font-bold">{stepNum}</span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono opacity-80">
                        {currentChallenge.unitType === "weeks" ? `S${stepNum}` : `D${stepNum}`}
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          </CardContent>
        </Card>
      )}
      </>
      )}

      {/* Create Custom Challenge Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Crear Nuevo Reto de Ahorro
            </DialogTitle>
            <DialogDescription>
              Configura tu propio desafío gamificado para motivarte paso a paso.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateChallenge} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cTitle" className="text-xs font-semibold">
                Nombre del Reto
              </Label>
              <Input
                id="cTitle"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej. Reto Navidad, Reto Cero Delivery, Ahorro Laptop..."
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cDesc" className="text-xs font-semibold">
                Descripción / Regla
              </Label>
              <Input
                id="cDesc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Ej. Guardar S/ 20 cada día sin pedir comida rápida"
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cTarget" className="text-xs font-semibold">
                  Monto Objetivo Total
                </Label>
                <Input
                  id="cTarget"
                  type="number"
                  min="10"
                  value={newTargetAmount}
                  onChange={(e) => setNewTargetAmount(e.target.value)}
                  className="text-sm font-bold font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cUnits" className="text-xs font-semibold">
                  Duración ({newUnitType === "weeks" ? "Semanas" : "Días"})
                </Label>
                <Input
                  id="cUnits"
                  type="number"
                  min="5"
                  max="100"
                  value={newDurationUnits}
                  onChange={(e) => setNewDurationUnits(e.target.value)}
                  className="text-sm font-bold font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Frecuencia</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewUnitType("days")}
                  className={`p-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                    newUnitType === "days"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/60 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  Días (Diario)
                </button>
                <button
                  type="button"
                  onClick={() => setNewUnitType("weeks")}
                  className={`p-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                    newUnitType === "weeks"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/60 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  Semanas (Semanal)
                </button>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer font-semibold">
                Comenzar Reto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

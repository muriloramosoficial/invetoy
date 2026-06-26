"use client";

import { useState, useEffect } from "react";
import { BentoGrid, BentoCard } from "@/components/bento-grid";
import { KpiCard } from "@/components/kpi-card";
import { TechBadge } from "@/components/tech-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Box, TrendingUp, TrendingDown, AlertTriangle, CalendarClock, Package } from "lucide-react";
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Sample data for demonstration
const chartData = [
  { date: "01/06", entries: 45, exits: 32 },
  { date: "02/06", entries: 52, exits: 28 },
  { date: "03/06", entries: 38, exits: 41 },
  { date: "04/06", entries: 61, exits: 35 },
  { date: "05/06", entries: 47, exits: 29 },
  { date: "06/06", entries: 55, exits: 44 },
  { date: "07/06", entries: 42, exits: 38 },
  { date: "08/06", entries: 58, exits: 31 },
  { date: "09/06", entries: 63, exits: 47 },
  { date: "10/06", entries: 49, exits: 52 },
  { date: "11/06", entries: 71, exits: 43 },
  { date: "12/06", entries: 66, exits: 39 },
  { date: "13/06", entries: 54, exits: 55 },
  { date: "14/06", entries: 48, exits: 36 },
  { date: "15/06", entries: 59, exits: 42 },
];

const lowStockItems = [
  { sku: "ELT-001", name: "Resistor 10kΩ", quantity: 5, min: 50 },
  { sku: "MEC-042", name: "Parafuso M8", quantity: 12, min: 100 },
  { sku: "HID-007", name: "Óleo Hidráulico", quantity: 2, min: 20 },
  { sku: "PNE-003", name: "O-ring 25mm", quantity: 8, min: 30 },
  { sku: "ELT-015", name: "Capacitor 100µF", quantity: 3, min: 25 },
  { sku: "FERR-09", name: "Chave Allen 5mm", quantity: 1, min: 15 },
];

const expiringItems = [
  { sku: "QUI-023", name: "Solvente Limpeza", days: 15, quantity: 34 },
  { sku: "ALI-008", name: "Lubrificante Food Grade", days: 22, quantity: 18 },
  { sku: "MED-001", name: "Luvas Descartáveis M", days: 30, quantity: 200 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-secondary border border-border-default rounded-[4px] p-3 shadow-lg">
        <p className="text-xs text-text-muted mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-mono" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Overview of your inventory operations
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Items"
          value="2,847"
          accent="brand"
          trend={{ direction: "up", percentage: 12 }}
          subtitle="vs last month"
        />
        <KpiCard
          label="Total Value"
          value="R$ 487.2K"
          accent="info"
          trend={{ direction: "up", percentage: 8.3 }}
          subtitle="vs last month"
        />
        <KpiCard
          label="Low Stock"
          value="6"
          accent="warning"
          trend={{ direction: "down", percentage: 2 }}
          subtitle="alerts active"
        />
        <KpiCard
          label="Movements Today"
          value="43"
          accent="brand"
          subtitle="12 entries · 31 exits"
        />
      </div>

      {/* Bento Grid */}
      <BentoGrid>
        {/* Chart card - spans 2 cols */}
        <BentoCard colSpan={2} className="min-h-[320px]">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-text-primary">
                  Entries × Exits (Last 15 Days)
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Daily inventory movement volume
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand" />
                  <span className="text-text-muted">Entries</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-danger" />
                  <span className="text-text-muted">Exits</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="entriesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="exitsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E5484D" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#E5484D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#52525B", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "#333" }}
                  />
                  <YAxis
                    tick={{ fill: "#52525B", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="entries"
                    stroke="#3ECF8E"
                    strokeWidth={2}
                    fill="url(#entriesGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#3ECF8E", stroke: "#121212", strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="exits"
                    stroke="#E5484D"
                    strokeWidth={2}
                    fill="url(#exitsGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#E5484D", stroke: "#121212", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </BentoCard>

        {/* Low Stock Alerts */}
        <BentoCard className="min-h-[320px]">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-brand-warning" />
              <h3 className="text-sm font-medium text-text-primary">
                Low Stock Alerts
              </h3>
              <TechBadge variant="yellow" className="ml-auto">
                {lowStockItems.length} items
              </TechBadge>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 -mx-1">
              {lowStockItems.map((item) => (
                <div
                  key={item.sku}
                  className="flex items-center justify-between p-2 rounded-[4px] hover:bg-bg-surface-hover transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono text-brand truncate">{item.sku}</p>
                    <p className="text-sm text-text-primary truncate">{item.name}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold text-brand-danger">{item.quantity}</p>
                    <p className="text-[10px] text-text-muted">min: {item.min}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BentoCard>

        {/* Expiring Items */}
        <BentoCard className="min-h-[320px]">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <CalendarClock className="h-4 w-4 text-brand-info" />
              <h3 className="text-sm font-medium text-text-primary">
                Expiring Soon
              </h3>
              <TechBadge variant="blue" className="ml-auto">
                {expiringItems.length} items
              </TechBadge>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 -mx-1">
              {expiringItems.map((item) => (
                <div
                  key={item.sku}
                  className="flex items-center justify-between p-2 rounded-[4px] hover:bg-bg-surface-hover transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono text-brand-info truncate">{item.sku}</p>
                    <p className="text-sm text-text-primary truncate">{item.name}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold text-brand-info">{item.days}d</p>
                    <p className="text-[10px] text-text-muted">{item.quantity} units</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  );
}

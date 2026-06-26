"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TechBadge } from "@/components/tech-badge";
import { Globe, User, Building2, CreditCard, Bell, Shield, Check, ChevronRight } from "lucide-react";

const locales = [
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

const plans = [
  { id: "free", name: "Free", price: "R$ 0", description: "Up to 100 products", current: true },
  { id: "starter", name: "Starter", price: "R$ 49", description: "Up to 1,000 products", current: false },
  { id: "pro", name: "Professional", price: "R$ 149", description: "Up to 10,000 products", current: false },
  { id: "enterprise", name: "Enterprise", price: "Custom", description: "Unlimited products", current: false },
];

export default function SettingsPage() {
  const [selectedLocale, setSelectedLocale] = useState("pt-BR");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Manage your account, billing, and preferences
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-text-muted" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>
            Your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" defaultValue="Admin" />
            <Input label="Email" type="email" defaultValue="admin@inventoy.com" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Tenant */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-text-muted" />
            <CardTitle>Organization</CardTitle>
          </div>
          <CardDescription>
            Your company or tenant information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Company Name" defaultValue="Minha Empresa Ltda" />
          <Input label="Tenant Slug" defaultValue="minha-empresa" />
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Plan & Billing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-text-muted" />
            <CardTitle>Plan & Billing</CardTitle>
          </div>
          <CardDescription>
            Manage your subscription and payment methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-4 rounded-[6px] border transition-all cursor-pointer ${
                  plan.current
                    ? "border-brand bg-brand/[0.05]"
                    : "border-border-default bg-bg-surface hover:border-[#444]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">{plan.name}</span>
                  {plan.current && <Check className="h-4 w-4 text-brand" />}
                </div>
                <p className="text-2xl font-semibold text-text-primary font-mono">{plan.price}</p>
                <p className="text-xs text-text-muted mt-1">{plan.description}</p>
                {!plan.current && (
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Upgrade
                  </Button>
                )}
                {plan.current && (
                  <TechBadge variant="green" className="w-full justify-center mt-3">
                    Current
                  </TechBadge>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
              Payment Method
            </h4>
            <div className="flex items-center justify-between p-3 rounded-[4px] border border-border-default bg-bg-surface">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-text-muted" />
                <div>
                  <p className="text-sm text-text-primary">No payment method configured</p>
                  <p className="text-xs text-text-muted">Add a card or PIX for Brazilian customers</p>
                </div>
              </div>
              <Button variant="secondary" size="sm">
                Configure
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locale */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-text-muted" />
            <CardTitle>Language & Region</CardTitle>
          </div>
          <CardDescription>
            Choose your preferred language and currency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            {locales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => setSelectedLocale(loc.code)}
                className={`flex items-center gap-2 p-3 rounded-[4px] border transition-all ${
                  selectedLocale === loc.code
                    ? "border-brand bg-brand/[0.05]"
                    : "border-border-default bg-bg-surface hover:border-[#444]"
                }`}
              >
                <span className="text-lg">{loc.flag}</span>
                <span className="text-sm text-text-primary">{loc.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-text-muted" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure email and in-app notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {["Low stock alerts", "Expiring items", "Daily summary", "Weekly report"].map(
            (item) => (
              <label
                key={item}
                className="flex items-center justify-between p-2 rounded-[4px] hover:bg-bg-surface-hover cursor-pointer"
              >
                <span className="text-sm text-text-primary">{item}</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 rounded-full bg-bg-elevated peer-checked:bg-brand transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
                </div>
              </label>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}

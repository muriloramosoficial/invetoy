"use client";

import { useState, useCallback, useEffect } from "react";

interface MenuPosition {
  top: number;
  right: number;
}

/**
 * Hook gerenciador de dropdown menus com:
 * - Posicionamento fixed para evitar overflow clipping
 * - Fechamento automático ao scrollar a página
 * - Fechamento ao clicar fora (backdrop)
 */
export function useDropdownMenu() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);

  // Close menu on scroll
  useEffect(() => {
    if (!openId) return;
    const handleScroll = () => {
      setOpenId(null);
      setMenuPos(null);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [openId]);

  const toggle = useCallback((id: string, event: React.MouseEvent<HTMLElement>) => {
    if (openId === id) {
      setOpenId(null);
      setMenuPos(null);
    } else {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
      setOpenId(id);
    }
  }, [openId]);

  const close = useCallback(() => {
    setOpenId(null);
    setMenuPos(null);
  }, []);

  return {
    openId,
    menuPos,
    toggle,
    close,
    isOpen: (id: string) => openId === id,
  };
}

/**
 * Componente de backdrop para fechar o menu ao clicar fora.
 */
export function MenuBackdrop({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60]"
      onClick={onClick}
    />
  );
}

interface MenuPanelProps {
  children: React.ReactNode;
  menuPos: MenuPosition;
  width?: string;
}

/**
 * Componente do painel do menu dropdown com posicionamento fixed.
 */
export function MenuPanel({ children, menuPos, width = "w-52" }: MenuPanelProps) {
  return (
    <div
      className={`fixed z-[70] ${width} bg-bg-surface border border-border-default rounded-[6px] shadow-xl py-1`}
      style={{ top: menuPos.top, right: menuPos.right }}
    >
      {children}
    </div>
  );
}

export interface MenuItemProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Item de menu individual.
 */
export function MenuItem({ onClick, disabled, className = "", children }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

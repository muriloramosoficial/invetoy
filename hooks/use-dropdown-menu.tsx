"use client";

import { useState, useCallback, useEffect } from "react";

interface MenuPosition {
  top: number;
  right: number;
}

type MenuDirection = "down" | "up";

/**
 * Hook gerenciador de dropdown menus com:
 * - Posicionamento fixed para evitar overflow clipping
 * - Abre para cima se nao houver espaco suficiente abaixo
 * - Fechamento automático ao scrollar a página
 * - Fechamento ao clicar fora (backdrop)
 */
export function useDropdownMenu(menuHeight: number = 300) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
  const [direction, setDirection] = useState<MenuDirection>("down");

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
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow >= menuHeight + 8 || spaceBelow >= spaceAbove) {
        // Abre para baixo
        setDirection("down");
        setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
      } else {
        // Abre para cima
        setDirection("up");
        setMenuPos({ top: rect.top - 4, right: window.innerWidth - rect.right });
      }
      setOpenId(id);
    }
  }, [openId, menuHeight]);

  const close = useCallback(() => {
    setOpenId(null);
    setMenuPos(null);
  }, []);

  return {
    openId,
    menuPos,
    direction,
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

interface MenuPanelProps {
  children: React.ReactNode;
  menuPos: MenuPosition;
  direction: MenuDirection;
  width?: string;
}

/**
 * Componente do painel do menu dropdown com posicionamento fixed.
 * - Abre para baixo: top = bottom do botao, bordas arredondadas normais
 * - Abre para cima: top = top do botao - altura, bordas invertidas
 */
export function MenuPanel({ children, menuPos, direction, width = "w-52" }: MenuPanelProps) {
  return (
    <div
      className={`fixed z-[70] ${width} bg-bg-surface border border-border-default rounded-[6px] shadow-xl py-1`}
      style={{
        top: direction === "down" ? menuPos.top : menuPos.top,
        right: menuPos.right,
        transform: direction === "up" ? "translateY(-100%)" : undefined,
      }}
    >
      {children}
    </div>
  );
}

export type { MenuPosition, MenuDirection };

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

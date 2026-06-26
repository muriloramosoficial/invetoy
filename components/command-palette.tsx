"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Search, Command, FileBox, ArrowRightLeft, Plus, Settings, BarChart3, Package } from "lucide-react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands: CommandItem[] = [
    {
      id: "add-product",
      label: "> add product",
      description: "Create a new product in inventory",
      icon: <Plus className="h-4 w-4" />,
      action: () => router.push("/inventory?action=add"),
    },
    {
      id: "move-item",
      label: "> move item",
      description: "Transfer inventory between locations",
      icon: <ArrowRightLeft className="h-4 w-4" />,
      action: () => router.push("/inventory?action=move"),
    },
    {
      id: "view-dashboard",
      label: "> view dashboard",
      description: "Go to the analytics dashboard",
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => router.push("/dashboard"),
    },
    {
      id: "list-inventory",
      label: "> list inventory",
      description: "View all inventory items",
      icon: <Package className="h-4 w-4" />,
      action: () => router.push("/inventory"),
    },
    {
      id: "view-movements",
      label: "> view movements",
      description: "Check recent inventory movements",
      icon: <FileBox className="h-4 w-4" />,
      action: () => router.push("/movements"),
    },
    {
      id: "open-settings",
      label: "> open settings",
      description: "Configure your account and preferences",
      icon: <Settings className="h-4 w-4" />,
      action: () => router.push("/settings"),
    },
  ];

  const filteredCommands = query
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.description.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      }

      if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    },
    [filteredCommands, selectedIndex, onClose]
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Overlay escuro com 90% opacidade */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Terminal-style dialog */}
      <div className="relative z-10 w-full max-w-xl rounded-[8px] border border-border-default bg-bg-secondary shadow-2xl overflow-hidden">
        {/* Input area - terminal style */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-default">
          <Command className="h-4 w-4 text-brand shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/60 outline-none font-mono"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border-default bg-bg-surface px-2 py-0.5 text-[10px] font-mono text-text-muted">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-text-muted">
              <Search className="h-6 w-6" />
              <p className="text-sm">No results for &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[4px] px-3 py-2.5 text-left transition-colors",
                    index === selectedIndex
                      ? "bg-brand-dim text-text-primary"
                      : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0",
                      index === selectedIndex ? "text-brand" : "text-text-muted"
                    )}
                  >
                    {cmd.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono truncate">{cmd.label}</p>
                    <p className="text-xs text-text-muted truncate">
                      {cmd.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-border-default bg-bg-surface/50">
          <span className="flex items-center gap-1 text-[10px] text-text-muted">
            <kbd className="rounded border border-border-default px-1.5 py-0.5 text-[10px] font-mono">
              ↑↓
            </kbd>
            navigate
          </span>
          <span className="flex items-center gap-1 text-[10px] text-text-muted">
            <kbd className="rounded border border-border-default px-1.5 py-0.5 text-[10px] font-mono">
              ↵
            </kbd>
            select
          </span>
          <span className="flex items-center gap-1 text-[10px] text-text-muted">
            <kbd className="rounded border border-border-default px-1.5 py-0.5 text-[10px] font-mono">
              esc
            </kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}

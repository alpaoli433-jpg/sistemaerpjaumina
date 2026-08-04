"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronUp, Receipt } from "lucide-react";
import { formatGuaranies } from "@/lib/format";
import type { QuoteResult } from "@/lib/quote";

interface QuoteTicketProps {
  quote: QuoteResult;
  guestsCount: number;
}

export function QuoteTicket({ quote, guestsCount }: QuoteTicketProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const hasLines = quote.lines.length > 0;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="pointer-events-auto w-full max-w-lg">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
              className="mb-[-1px] overflow-hidden rounded-t-2xl border border-b-0 border-glass-border bg-obsidian-card"
            >
              <div className="max-h-[45vh] overflow-y-auto px-5 pb-2 pt-5">
                <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-smoke">
                  Comanda · {guestsCount} invitados
                </p>
                {hasLines ? (
                  <ul className="flex flex-col gap-2.5">
                    {quote.lines.map((line) => (
                      <li
                        key={line.recipe.id}
                        className="flex items-baseline justify-between gap-3 text-sm"
                      >
                        <span className="text-smoke-light">
                          {line.recipe.name}
                          <span className="ml-1.5 text-xs text-smoke">
                            ×{Math.round(line.estimatedUnits)}
                          </span>
                        </span>
                        <span className="shrink-0 tabular-nums text-ivory">
                          {formatGuaranies(line.subtotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="pb-2 text-sm text-smoke">
                    Elegí al menos un trago para ver el desglose.
                  </p>
                )}
              </div>
              <div className="comanda-perforation" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          className="glass-panel flex w-full items-center justify-between rounded-b-2xl px-5 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.35)]"
          style={isExpanded ? { borderTopColor: "transparent" } : undefined}
        >
          <span className="flex items-center gap-2.5">
            <Receipt className="h-4 w-4 text-champagne-gold" strokeWidth={1.75} />
            <span className="text-left">
              <span className="block text-[11px] uppercase tracking-[0.14em] text-smoke">
                Total estimado
              </span>
              <motion.span
                key={quote.totalAmount}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.25 }}
                className="block font-display text-lg font-semibold tabular-nums text-champagne-gold"
                aria-live="polite"
              >
                {formatGuaranies(quote.totalAmount)}
              </motion.span>
            </span>
          </span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-glass-border text-smoke-light"
          >
            <ChevronUp className="h-4 w-4" strokeWidth={2} />
          </motion.span>
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DocumentType } from "@prisma/client";

interface Props {
  filter: DocumentType | undefined;
  sort: "newest" | "oldest";
  onFilter: (f: DocumentType | undefined) => void;
  onSort: (s: "newest" | "oldest") => void;
}

export function FilterMenu({ filter, sort, onFilter, onSort }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="text-zinc-400"
        onClick={() => setOpen((o) => !o)}
      >
        <Filter className="w-4 h-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-52 rounded-xl bg-zinc-900 border border-zinc-700 p-4 space-y-3 shadow-xl">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wide">Tipo</p>
          {(["TIMESTAMP", "NDA", "CONTRACT"] as DocumentType[]).map((type) => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                id={type}
                checked={filter === type}
                onCheckedChange={(checked) => {
                  onFilter(checked ? type : undefined);
                  setOpen(false);
                }}
              />
              <Label htmlFor={type} className="text-sm text-white cursor-pointer">
                {type === "TIMESTAMP" ? "Timestamp" : type === "NDA" ? "NDA" : "Contratto"}
              </Label>
            </div>
          ))}

          <hr className="border-zinc-700" />
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wide">Ordine</p>
          {(["newest", "oldest"] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <Checkbox
                id={s}
                checked={sort === s}
                onCheckedChange={() => { onSort(s); setOpen(false); }}
              />
              <Label htmlFor={s} className="text-sm text-white cursor-pointer">
                {s === "newest" ? "Più recenti" : "Più vecchi"}
              </Label>
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-zinc-400 text-xs"
            onClick={() => { onFilter(undefined); setOpen(false); }}
          >
            Reset filtri
          </Button>
        </div>
      )}
    </div>
  );
}

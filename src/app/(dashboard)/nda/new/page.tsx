"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { trpc } from "@/lib/trpc/client";

const DURATION_OPTIONS = ["Illimitata", "6 mesi", "1 anno", "2 anni"];

export default function NdaNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("Illimitata");
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [error, setError] = useState("");

  const { data: clauses = [], isLoading: clausesLoading } = trpc.nda.getClauses.useQuery();

  const createNda = trpc.nda.create.useMutation({
    onSuccess: () => router.push("/home"),
    onError: (e) => setError(e.message),
  });

  function toggleClause(id: string) {
    setSelectedClauses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    createNda.mutate({
      title,
      description: description || undefined,
      duration,
      clauseIds: selectedClauses,
      recipientEmail: recipientEmail || undefined,
    });
  }

  const mainClauses = clauses.slice(0, 3);
  const moreClauses = clauses.slice(3);

  return (
    <div className="min-h-screen bg-black text-white max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-black px-4 pt-6 pb-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">Nuovo NDA</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pb-8 space-y-5">
        <div className="space-y-2">
          <Label>Titolo *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="es. NDA con Cliente XYZ"
            className="bg-zinc-900 border-zinc-700"
          />
        </div>

        <div className="space-y-2">
          <Label>Descrizione (opzionale)</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descrizione dell'accordo..."
            rows={3}
            className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-400 resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label>Durata</Label>
          <div className="grid grid-cols-2 gap-2">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`rounded-lg border py-2 px-3 text-sm transition ${
                  duration === d
                    ? "border-green-400 bg-zinc-800 text-green-400"
                    : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Clausole NDA</Label>
          {clausesLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-700 bg-zinc-900 divide-y divide-zinc-800">
              {mainClauses.map((clause) => (
                <div key={clause.id} className="flex items-center gap-3 px-4 py-3">
                  <Checkbox
                    id={clause.id}
                    checked={selectedClauses.includes(clause.id)}
                    onCheckedChange={() => toggleClause(clause.id)}
                  />
                  <Label htmlFor={clause.id} className="text-sm text-white cursor-pointer">
                    {clause.name}
                  </Label>
                </div>
              ))}
              {moreClauses.length > 0 && (
                <Accordion type="single" collapsible>
                  <AccordionItem value="more" className="border-0">
                    <AccordionTrigger className="px-4 py-3 text-sm text-zinc-400 hover:no-underline">
                      Altre clausole
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      {moreClauses.map((clause) => (
                        <div key={clause.id} className="flex items-center gap-3 py-2">
                          <Checkbox
                            id={clause.id}
                            checked={selectedClauses.includes(clause.id)}
                            onCheckedChange={() => toggleClause(clause.id)}
                          />
                          <div>
                            <Label htmlFor={clause.id} className="text-sm text-white cursor-pointer">
                              {clause.name}
                            </Label>
                            {clause.description && (
                              <p className="text-xs text-zinc-500">{clause.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Email destinatario (opzionale)</Label>
          <Input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="destinatario@example.com"
            className="bg-zinc-900 border-zinc-700"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold"
          disabled={createNda.isPending}
        >
          {createNda.isPending ? "Creazione..." : "Crea NDA"}
        </Button>
      </form>
    </div>
  );
}

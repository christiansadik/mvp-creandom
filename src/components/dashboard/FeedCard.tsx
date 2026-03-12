import { DocumentType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/lib/trpc/router";

const TYPE_LABELS: Record<DocumentType, string> = {
  TIMESTAMP: "Timestamp",
  NDA: "NDA",
  CONTRACT: "Contratto",
};

type DocItem = inferRouterOutputs<AppRouter>["document"]["list"][number];

const TYPE_COLORS: Record<DocumentType, string> = {
  TIMESTAMP: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  NDA: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  CONTRACT: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

interface Props {
  doc: DocItem;
}

export function FeedCard({ doc }: Props) {
  const date = new Date(doc.createdAt).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      {/* Preview area */}
      <div className="h-28 bg-zinc-800 flex items-center justify-center">
        <span className="text-zinc-600 text-xs">{doc.mimeType}</span>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">{doc.title}</h3>
          <Badge className={`text-xs shrink-0 border ${TYPE_COLORS[doc.type]}`}>
            {TYPE_LABELS[doc.type]}
          </Badge>
        </div>

        {doc.description && (
          <p className="text-zinc-400 text-xs line-clamp-2">{doc.description}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-zinc-500 text-xs">{date}</span>
          <Button variant="ghost" size="sm" className="text-zinc-400 text-xs gap-1 h-7 px-2">
            <MessageCircle className="w-3 h-3" />
            Commenti
          </Button>
        </div>

        <p className="text-zinc-600 text-xs font-mono truncate">SHA: {doc.sha256Hash.slice(0, 20)}…</p>
      </div>
    </div>
  );
}

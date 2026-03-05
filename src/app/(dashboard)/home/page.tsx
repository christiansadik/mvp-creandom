"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { FeedCard } from "@/components/dashboard/FeedCard";
import { FilterMenu } from "@/components/dashboard/FilterMenu";
import { DocumentType } from "@prisma/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";

type TabValue = "all" | "sent" | "unsent";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<TabValue>("all");
  const [filter, setFilter] = useState<DocumentType | undefined>(undefined);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const { data: docs, isLoading } = trpc.document.list.useQuery({ filter, sort });

  const filteredDocs = docs?.filter((doc) => {
    if (tab === "sent") return doc.type === "NDA";
    if (tab === "unsent") return doc.type !== "NDA";
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black px-4 pt-6 pb-2 space-y-3">
        <div className="flex items-center justify-between">
          <h1><BrandLogo className="text-xl" /></h1>
          <div className="flex items-center gap-2">
            <FilterMenu filter={filter} sort={sort} onFilter={setFilter} onSort={setSort} />
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
              {session?.user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
          <TabsList className="bg-zinc-900 w-full">
            <TabsTrigger value="all" className="flex-1">Tutti</TabsTrigger>
            <TabsTrigger value="sent" className="flex-1">Inviati</TabsTrigger>
            <TabsTrigger value="unsent" className="flex-1">Non inviati</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Feed */}
      <div className="flex-1 px-4 py-3 space-y-3 pb-20">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !filteredDocs?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-2">
            <p>Nessun documento ancora.</p>
            <p className="text-sm">Usa il + per aggiungerne uno.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => <FeedCard key={doc.id} doc={doc} />)
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2">
        <Button
          onClick={() => router.push("/nda/new")}
          className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-2 rounded-full"
        >
          Nuovo NDA
        </Button>
        <Button
          onClick={() => router.push("/document/upload")}
          className="bg-green-500 hover:bg-green-400 text-black font-bold w-14 h-14 rounded-full text-2xl p-0"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}

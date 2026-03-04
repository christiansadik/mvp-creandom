"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";

async function computeSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function DocumentUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const createDoc = trpc.document.create.useMutation({
    onSuccess: () => router.push("/home"),
    onError: (e) => setError(e.message),
  });

  async function handleFile(f: File) {
    setFile(f);
    setTitle(f.name.replace(/\.[^.]+$/, ""));
    const h = await computeSHA256(f);
    setHash(h);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError("");
    // Stub: use object URL as fileUrl (no real S3 in MVP)
    const fileUrl = `/uploads/${file.name}`;
    createDoc.mutate({
      title,
      description: description || undefined,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
      sha256Hash: hash,
    });
  }

  return (
    <div className="min-h-screen bg-black text-white max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-black px-4 pt-6 pb-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">Carica documento</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pb-8 space-y-5">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById("fileInput")?.click()}
          className={`rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-3 cursor-pointer transition ${
            dragging ? "border-green-400 bg-zinc-800" : "border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
          }`}
        >
          {file ? (
            <>
              <FileText className="w-10 h-10 text-green-400" />
              <p className="text-white text-sm font-medium text-center">{file.name}</p>
              <p className="text-zinc-400 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-zinc-500" />
              <p className="text-zinc-400 text-sm text-center">Trascina un file qui o clicca per selezionarlo</p>
            </>
          )}
        </div>
        <input
          id="fileInput"
          type="file"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {hash && (
          <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-3 space-y-1">
            <p className="text-xs text-zinc-400 font-semibold">SHA-256 Hash</p>
            <p className="text-xs font-mono text-green-400 break-all">{hash}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Titolo *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="bg-zinc-900 border-zinc-700"
          />
        </div>

        <div className="space-y-2">
          <Label>Descrizione (opzionale)</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-400 resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold"
          disabled={!file || !hash || createDoc.isPending}
        >
          {createDoc.isPending ? "Caricamento..." : "Conferma timestamp"}
        </Button>
      </form>
    </div>
  );
}

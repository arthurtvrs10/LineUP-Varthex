"use client";

import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { readImageAsCompressedDataUrl } from "@/lib/image";

export function AvatarUpload({
  photoData,
  initials,
  onChange,
  size = 80,
}: {
  photoData: string | null | undefined;
  initials: string;
  onChange: (photoData: string) => void;
  size?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("A imagem precisa ter no máximo 8MB.");
      return;
    }

    try {
      const dataUrl = await readImageAsCompressedDataUrl(file);
      onChange(dataUrl);
      setError(undefined);
    } catch {
      setError("Não foi possível processar essa imagem.");
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {photoData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoData}
            alt="Foto de perfil"
            className="size-full rounded-full object-cover"
            style={{ width: size, height: size }}
          />
        ) : (
          <span
            className="grid place-items-center rounded-full bg-accent-subtle font-bold text-accent-strong"
            style={{ width: size, height: size, fontSize: size / 2.8 }}
          >
            {initials}
          </span>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Alterar foto de perfil"
          className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-2 border-white bg-accent text-on-accent shadow-sm transition hover:bg-accent-hover"
        >
          <Camera size={14} strokeWidth={2} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs font-bold text-accent-strong hover:underline"
        >
          Alterar foto
        </button>
        {photoData && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex items-center gap-1 text-xs font-bold text-[#c84a4a] hover:underline"
          >
            <Trash2 size={12} strokeWidth={2} />
            Remover
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {error && <p className="text-xs text-[#e0333f]">{error}</p>}
    </div>
  );
}

import Image from "next/image";

type BrandProps = {
  compact?: boolean;
  light?: boolean;
  align?: "center" | "start";
};

export function Brand({ compact = false, light = false, align = "center" }: BrandProps) {
  const centered = align === "center";

  return (
    <span
      className={`flex w-full items-center gap-3 whitespace-nowrap ${
        centered ? "justify-center" : "justify-start"
      }`}
      aria-label="Varthex Barber"
    >
      <Image
        src="/brand/varthex-brandmark-violet.svg"
        alt=""
        width={160}
        height={160}
        aria-hidden="true"
        className="h-[42px] w-[42px] shrink-0 object-contain drop-shadow-[0_8px_16px_rgba(95,50,222,0.22)]"
      />

      {!compact && (
        <span
          className={`flex flex-col gap-1.5 leading-none ${
            centered ? "items-center text-center" : "items-start text-left"
          }`}
        >
          <strong
            className={`text-base font-extrabold tracking-[0.1em] ${
              light ? "text-white" : "text-[#0d1831]"
            }`}
          >
            VARTHEX
          </strong>

          <small
            className={`text-[8px] font-extrabold tracking-[0.42em] ${
              centered ? "w-full text-center" : "text-left"
            } ${light ? "text-white/60" : "text-[#5f6f87]"}`}
          >
            BARBER
          </small>
        </span>
      )}
    </span>
  );
}
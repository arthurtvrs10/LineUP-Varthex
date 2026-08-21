type SectionLabelProps = {
  children: string;
  className?: string;
};

export function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <span
      className={`flex items-center gap-3 text-[11px] font-bold tracking-[0.1em] text-[#7247f3] uppercase before:h-0.5 before:w-8 before:bg-[#7247f3] before:content-[''] ${className}`}
    >
      {children}
    </span>
  );
}

// Generated from the LINEUP identity source. Do not hand-edit the path data —
// it is the outlined vector of the approved mark, so it needs no font to render.
// Colour comes from `currentColor`: the component inherits the text colour of
// whatever wraps it. See references/03-logo-and-icons.md.
import type { SVGProps } from "react";

type Variant = "horizontal" | "stacked" | "symbol";

const ART: Record<Variant, { viewBox: string; body: string }> = {
  horizontal: { viewBox: "0 0 469.58 87.81", body: `<g fill="currentColor"><g transform="translate(0,0.000)"><g transform="scale(0.91467)"><path fill="currentColor" d="M0 0 H36 V24 H24 V48 H36 V60 H72 V96 H0 Z"/></g></g><g transform="translate(98.784,9.604)"><g transform="translate(0,68.600)"><path d="M7.60 0.00V-68.60H22.50V-12.70H57.10V0.00Z M65.70 0.00V-68.60H80.60V0.00Z M94.80 0.00V-68.60H108.50L136.10 -31.60Q136.70 -30.90 137.60 -29.65Q138.50 -28.40 139.30 -27.20Q140.10 -26.00 140.40 -25.30H140.90V-68.60H155.00V0.00H141.30L113.10 -37.90Q112.10 -39.30 111.00 -41.00Q109.90 -42.70 109.40 -43.60H108.90V0.00Z M169.20 0.00V-68.60H224.00V-56.40H184.20V-41.10H219.40V-29.00H184.20V-12.30H224.60V0.00Z M266.20 1.20Q256.80 1.20 250.05 -1.80Q243.30 -4.80 239.70 -10.85Q236.10 -16.90 236.10 -25.90V-68.60H251.10V-26.30Q251.10 -18.90 255.00 -14.95Q258.90 -11.00 266.20 -11.00Q273.50 -11.00 277.45 -14.95Q281.40 -18.90 281.40 -26.30V-68.60H296.40V-25.90Q296.40 -16.90 292.80 -10.85Q289.20 -4.80 282.45 -1.80Q275.70 1.20 266.20 1.20Z M310.30 0.00V-68.60H346.00Q353.40 -68.60 358.35 -65.85Q363.30 -63.10 365.85 -58.15Q368.40 -53.20 368.40 -46.40Q368.40 -39.60 365.75 -34.55Q363.10 -29.50 358.00 -26.70Q352.90 -23.90 345.50 -23.90H325.20V0.00ZM325.20 -36.10H343.50Q348.20 -36.10 350.75 -38.80Q353.30 -41.50 353.30 -46.30Q353.30 -49.60 352.20 -51.80Q351.10 -54.00 348.95 -55.20Q346.80 -56.40 343.50 -56.40H325.20Z"/></g></g></g>` },
  stacked: { viewBox: "0 0 370.80 193.29", body: `<g fill="currentColor"><g transform="translate(152.472,0)"><g transform="scale(0.91467)"><path fill="currentColor" d="M0 0 H36 V24 H24 V48 H36 V60 H72 V96 H0 Z"/></g></g><g transform="translate(0.000,124.687)"><g transform="translate(0,68.600)"><path d="M7.60 0.00V-68.60H22.50V-12.70H57.10V0.00Z M65.70 0.00V-68.60H80.60V0.00Z M94.80 0.00V-68.60H108.50L136.10 -31.60Q136.70 -30.90 137.60 -29.65Q138.50 -28.40 139.30 -27.20Q140.10 -26.00 140.40 -25.30H140.90V-68.60H155.00V0.00H141.30L113.10 -37.90Q112.10 -39.30 111.00 -41.00Q109.90 -42.70 109.40 -43.60H108.90V0.00Z M169.20 0.00V-68.60H224.00V-56.40H184.20V-41.10H219.40V-29.00H184.20V-12.30H224.60V0.00Z M266.20 1.20Q256.80 1.20 250.05 -1.80Q243.30 -4.80 239.70 -10.85Q236.10 -16.90 236.10 -25.90V-68.60H251.10V-26.30Q251.10 -18.90 255.00 -14.95Q258.90 -11.00 266.20 -11.00Q273.50 -11.00 277.45 -14.95Q281.40 -18.90 281.40 -26.30V-68.60H296.40V-25.90Q296.40 -16.90 292.80 -10.85Q289.20 -4.80 282.45 -1.80Q275.70 1.20 266.20 1.20Z M310.30 0.00V-68.60H346.00Q353.40 -68.60 358.35 -65.85Q363.30 -63.10 365.85 -58.15Q368.40 -53.20 368.40 -46.40Q368.40 -39.60 365.75 -34.55Q363.10 -29.50 358.00 -26.70Q352.90 -23.90 345.50 -23.90H325.20V0.00ZM325.20 -36.10H343.50Q348.20 -36.10 350.75 -38.80Q353.30 -41.50 353.30 -46.30Q353.30 -49.60 352.20 -51.80Q351.10 -54.00 348.95 -55.20Q346.80 -56.40 343.50 -56.40H325.20Z"/></g></g></g>` },
  symbol: { viewBox: "0 0 72.00 96.00", body: `<g fill="currentColor"><path fill="currentColor" d="M0 0 H36 V24 H24 V48 H36 V60 H72 V96 H0 Z"/></g>` },
};

/** Minimum rendered height per variant, in px. Below it, switch variant — never shrink. */
export const LOGO_MIN_HEIGHT: Record<Variant, number> = {
  horizontal: 18,
  stacked: 34,
  symbol: 16,
};

export interface LogoProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /** horizontal = default (nav, header, documents). stacked = square-ish space. symbol = avatar, favicon, anything under ~96px wide. */
  variant?: Variant;
  height?: number;
  title?: string;
}

export function Logo({
  variant = "horizontal",
  height = 24,
  title = "Lineup",
  ...props
}: LogoProps) {
  const art = ART[variant];
  if (process.env.NODE_ENV !== "production" && height < LOGO_MIN_HEIGHT[variant]) {
    console.warn(
      `[Lineup] <Logo variant="${variant}" height={${height}} /> is below the ` +
        `${LOGO_MIN_HEIGHT[variant]}px minimum. Switch variant instead of shrinking.`
    );
  }
  return (
    <svg
      viewBox={art.viewBox}
      height={height}
      role="img"
      aria-label={title}
      focusable="false"
      style={{ display: "block", width: "auto" }}
      dangerouslySetInnerHTML={{ __html: art.body }}
      {...props}
    />
  );
}

export default Logo;

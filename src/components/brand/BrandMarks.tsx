/** Brand artwork stays local; CSS applies the ink appropriate to each surface. */
export function BbtsLogo({ className = '' }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="BBTS — BB Tecnologia e Serviços"
      className={`bbts-logo ${className}`}
    />
  );
}

export function ZeroClickSymbol({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`zero-click-symbol ${className}`} />;
}

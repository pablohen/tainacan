export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative bg-gradient-to-br from-primary via-secondary to-primary overflow-hidden"
      style={{
        backgroundSize: "200% 200%",
        animation: "gradientWave 20s ease-in-out infinite",
      }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute bottom-0 left-0 w-64 h-64 bg-white mix-blend-overlay filter blur-xl"
          style={{
            animation: "wave 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-white mix-blend-overlay filter blur-xl"
          style={{
            animation: "waveReverse 24s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white mix-blend-overlay filter blur-2xl"
          style={{
            animation: "wave 28s ease-in-out infinite 2s",
          }}
        />
      </div>

      <div className="relative flex flex-col items-center justify-center py-10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-px w-12 bg-white/30" />
          <p className="text-sm font-bold text-white tracking-wide">
            {`Tainacan © ${currentYear}`}
          </p>
          <div className="h-px w-12 bg-white/30" />
        </div>
      </div>
    </footer>
  );
}

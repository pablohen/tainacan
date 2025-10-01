import Link from "next/link";
import { MuseumList } from "./MuseumList";
import { BookOpen } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg border-b border-gray-200/50 transition-all duration-300 relative overflow-hidden">
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 opacity-50"
        style={{
          backgroundSize: "200% 200%",
          animation: "gradientWave 25s ease-in-out infinite",
        }}
      />

      {/* Floating orbs */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-32 h-32 bg-primary/10 filter blur-2xl"
          style={{ animation: "wave 20s ease-in-out infinite" }}
        />
        <div
          className="absolute top-0 right-1/3 w-24 h-24 bg-secondary/10 filter blur-xl"
          style={{ animation: "waveReverse 18s ease-in-out infinite" }}
        />
      </div>

      <div className="flex items-center max-w-screen-2xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row px-6 py-4 items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-primary font-bold text-xl hover:scale-105 transition-transform duration-200"
          >
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Tainacan
            </span>
          </Link>
        </div>
        <MuseumList />
      </div>
    </header>
  );
}

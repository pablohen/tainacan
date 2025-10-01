import Link from "next/link";
import { MuseumList } from "./MuseumList";
import { BookOpen } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg border-b border-gray-200/50 transition-all duration-300">
      <div className="flex items-center max-w-screen-2xl mx-auto">
        <div className="flex flex-col sm:flex-row px-6 py-4 items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-primary font-bold text-xl hover:scale-105 transition-transform duration-200"
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary group-hover:shadow-lg transition-all duration-300">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
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

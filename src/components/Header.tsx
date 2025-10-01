import Link from "next/link";
import { MuseumList } from "./MuseumList";

export function Header() {
  return (
    <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200/80">
      <div className="flex items-center max-w-screen-2xl mx-auto">
        <div className="flex flex-col sm:flex-row px-6 py-5 items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 font-semibold text-2xl text-gray-900 hover:text-gray-600 transition-colors duration-200"
          >
            Tainacan
          </Link>
        </div>
        <MuseumList />
      </div>
    </header>
  );
}

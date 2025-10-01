import { AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />

      <HeroBanner
        title="Casos de Uso"
        description="Lugares onde o sistema foi implementado e pode ser visualizado."
      />

      <div className="flex flex-col items-center justify-center flex-grow px-4 py-16">
        <div className="w-full max-w-3xl">
          <div className="relative group">
            {/* Animated gradient border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />

            {/* Card content */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 space-y-6 border-2 border-gray-200">
              {/* Icon and title */}
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Aviso Importante
                </h3>
              </div>

              {/* Content */}
              <div className="space-y-4 text-center">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Este site não substitui o site oficial do projeto ou o de cada
                  museu. O único objetivo é reunir o conteúdo e facilitar a
                  busca por informação.
                </p>

                <div className="pt-4">
                  <Link
                    href="https://tainacan.org"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <span>Visitar site oficial</span>
                    <ExternalLink className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

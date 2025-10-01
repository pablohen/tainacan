import { AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <HeroBanner
        title="Casos de Uso"
        description="Lugares onde o sistema foi implementado e pode ser visualizado."
      />

      <div className="flex flex-col items-center justify-center flex-grow px-4 py-16">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
            {/* Icon and title */}
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Aviso Importante
              </h3>
            </div>

            {/* Content */}
            <div className="space-y-4 text-center">
              <p className="text-base text-gray-600 leading-relaxed">
                Este site não substitui o site oficial do projeto ou o de cada
                museu. O único objetivo é reunir o conteúdo e facilitar a busca
                por informação.
              </p>

              <div className="pt-4">
                <Link
                  href="https://tainacan.org"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors duration-200"
                >
                  <span>Visitar site oficial</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

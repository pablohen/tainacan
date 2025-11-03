import { AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { FavoritesSection } from "@/components/FavoritesSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col bg-white">
			<Header />

			<HeroBanner
				title="Casos de Uso"
				description="Lugares onde o sistema foi implementado e pode ser visualizado."
			/>

			<div className="flex flex-grow flex-col items-center px-4 py-16">
				<FavoritesSection />

				<div className="flex flex-grow flex-col items-center justify-center">
					<div className="w-full max-w-2xl">
						<div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
							<div className="flex items-center justify-center gap-3">
								<div className="rounded-lg bg-yellow-100 p-2">
									<AlertTriangle className="h-6 w-6 text-yellow-600" />
								</div>
								<h3 className="font-bold text-2xl text-gray-900">
									Aviso Importante
								</h3>
							</div>

							<div className="space-y-4 text-center">
								<p className="text-base text-gray-600 leading-relaxed">
									Este site não substitui o site oficial do projeto ou o de cada
									museu. O único objetivo é reunir o conteúdo e facilitar a
									busca por informação.
								</p>

								<div className="pt-4">
									<Link
										href="https://tainacan.org"
										target="_blank"
										rel="noreferrer"
										className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-gray-800"
									>
										<span>Visitar site oficial</span>
										<ExternalLink className="h-4 w-4" />
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

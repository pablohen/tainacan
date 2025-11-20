"use client";

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { MuseumCard } from "@/components/MuseumCard";
import { SearchBar } from "@/components/SearchBar";
import { museums } from "@/utils/museums";

export default function Home() {
	const [search, setSearch] = useState("");
	const [debouncedSearch] = useDebounce(search, 300);

	const filteredMuseums = museums.filter((museum) =>
		museum.title.toLowerCase().includes(debouncedSearch.toLowerCase()),
	);

	return (
		<div className="flex min-h-screen flex-col bg-white">
			<Header />

			<HeroBanner
				title="Explore Acervos Culturais"
				description="Navegue por dezenas de museus e instituições brasileiras"
			/>

			<div className="container mx-auto flex-grow px-4 py-8">
				<div className="mx-auto max-w-2xl">
					<SearchBar
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Buscar museus..."
					/>
				</div>

				<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredMuseums.map((museum) => (
						<MuseumCard key={museum.id} museum={museum} />
					))}
				</div>

				{filteredMuseums.length === 0 && (
					<div className="mt-12 text-center text-gray-500">
						Nenhum museu encontrado para "{search}"
					</div>
				)}
			</div>

			<Footer />
		</div>
	);
}

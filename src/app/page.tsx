"use client";

import { Grid } from "@astryxdesign/core/Grid";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { useState } from "react";
import { useDebounce } from "use-debounce";
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
		<VStack gap={4}>
			<HeroBanner
				title="Explore Acervos Culturais"
				description="Navegue por dezenas de museus e instituições brasileiras"
			/>

			<VStack gap={4} maxWidth={672}>
				<SearchBar
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Buscar museus..."
				/>
			</VStack>

			<Grid columns={{ minWidth: 240, max: 4 }} gap={4}>
				{filteredMuseums.map((museum) => (
					<MuseumCard key={museum.id} museum={museum} />
				))}
			</Grid>

			{filteredMuseums.length === 0 ? (
				<Text type="supporting" justify="center" as="p">
					Nenhum museu encontrado para "{search}"
				</Text>
			) : null}
		</VStack>
	);
}

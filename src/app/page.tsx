"use client";

import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { HeroBanner } from "@/components/HeroBanner";
import { HomeThemesSection } from "@/components/HomeThemesSection";
import { HeartFilledIcon } from "@/components/icons/HeartIcon";
import { MuseumCard } from "@/components/MuseumCard";
import { SearchBar } from "@/components/SearchBar";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useDebouncedLocalSearch } from "@/hooks/useDebouncedSearch";
import { museums } from "@/utils/museums";
import { partitionMuseumsByFavorite } from "@/utils/partitionMuseumsByFavorite";

export default function Home() {
	const { favoriteMuseums } = useFavorites();
	const { search, setSearch, debouncedSearch } = useDebouncedLocalSearch(300);

	const searchLower = debouncedSearch.toLowerCase();
	const { favorites: favoriteSection, all: filteredMuseums } =
		partitionMuseumsByFavorite({
			museums,
			favoriteIds: favoriteMuseums,
			matches: (museum) => museum.title.toLowerCase().includes(searchLower),
		});

	const hasResults = filteredMuseums.length > 0;

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

			<HomeThemesSection />

			{hasResults ? (
				<VStack gap={6}>
					{favoriteSection.length > 0 ? (
						<VStack gap={3}>
							<HStack gap={2} vAlign="center">
								<Icon icon={HeartFilledIcon} color="error" size="md" />
								<Heading level={2}>Meus museus</Heading>
							</HStack>
							<Grid columns={{ minWidth: 240, max: 4 }} gap={4}>
								{favoriteSection.map((museum) => (
									<MuseumCard key={museum.id} museum={museum} />
								))}
							</Grid>
						</VStack>
					) : null}

					<VStack gap={3}>
						<Heading level={2}>Todos os museus</Heading>
						<Grid columns={{ minWidth: 240, max: 4 }} gap={4}>
							{filteredMuseums.map((museum) => (
								<MuseumCard key={museum.id} museum={museum} />
							))}
						</Grid>
					</VStack>
				</VStack>
			) : (
				<Text type="supporting" justify="center" as="p">
					Nenhum museu encontrado para "{search}"
				</Text>
			)}
		</VStack>
	);
}

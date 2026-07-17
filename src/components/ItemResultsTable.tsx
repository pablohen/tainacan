"use client";

import { Link } from "@astryxdesign/core/Link";
import { Section } from "@astryxdesign/core/Section";
import {
	pixel,
	proportional,
	Table,
	type TableColumn,
} from "@astryxdesign/core/Table";
import { Text } from "@astryxdesign/core/Text";
import Image from "next/image";
import { FavoriteButton } from "@/components/FavoriteButton";
import Loading from "@/components/Loading";
import type { TainacanItem } from "@/types/tainacan";
import { checkImagePath } from "@/utils/checkImagePath";

export type ItemResultsTableProps = {
	museumId: string;
	items: TainacanItem[];
};

type ItemTableRow = {
	id: number;
	title: string;
	imageUrl: string;
	museumId: string;
} & Record<string, unknown>;

function toRows(museumId: string, items: TainacanItem[]): ItemTableRow[] {
	return items.map((item) => ({
		id: item.id,
		title: item.title,
		imageUrl: checkImagePath(item),
		museumId,
	}));
}

const columns: TableColumn<ItemTableRow>[] = [
	{
		key: "imageUrl",
		header: "Imagem",
		width: pixel(72),
		align: "center",
		renderCell: (row) => (
			<Link href={`/${row.museumId}/items/${row.id}`} label={row.title}>
				<Image
					src={row.imageUrl}
					alt=""
					width={48}
					height={48}
					style={{
						width: 48,
						height: 48,
						objectFit: "cover",
						display: "block",
					}}
					unoptimized
				/>
			</Link>
		),
	},
	{
		key: "title",
		header: "Título",
		width: proportional(1, { minWidth: 160 }),
		renderCell: (row) => (
			<Link href={`/${row.museumId}/items/${row.id}`} isStandalone>
				{row.title}
			</Link>
		),
	},
	{
		key: "id",
		header: "ID",
		width: pixel(96),
		renderCell: (row) => (
			<Text type="supporting" as="span">
				{String(row.id)}
			</Text>
		),
	},
	{
		key: "favorite",
		header: "Favorito",
		width: pixel(88),
		align: "center",
		renderCell: (row) => (
			<FavoriteButton
				type="item"
				item={{
					museumId: row.museumId,
					itemId: row.id,
					title: row.title,
					imageUrl: row.imageUrl,
				}}
			/>
		),
	},
];

export function ItemResultsTable({ museumId, items }: ItemResultsTableProps) {
	const data = toRows(museumId, items);

	return (
		<Section variant="transparent" padding={0} width="100%">
			<Table
				data={data}
				columns={columns}
				idKey="id"
				density="compact"
				dividers="rows"
				hasHover
				textOverflow="truncate"
			/>
		</Section>
	);
}

export function ItemResultsTableSkeleton() {
	return <Loading />;
}

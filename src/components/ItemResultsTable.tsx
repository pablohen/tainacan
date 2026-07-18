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
import { Loading } from "@/components/Loading";

export type ItemResultsTableItem = {
	museumId: string;
	itemId: number;
	title: string;
	imageUrl: string;
	museumTitle?: string;
};

export type ItemResultsTableProps = {
	items: ItemResultsTableItem[];
	/** When true, show a Museu column (favorites / cross-museum lists). */
	showMuseum?: boolean;
};

type ItemTableRow = {
	id: number;
	title: string;
	imageUrl: string;
	museumId: string;
	museumTitle: string;
} & Record<string, unknown>;

function toRows(items: ItemResultsTableItem[]): ItemTableRow[] {
	return items.map((item) => ({
		id: item.itemId,
		title: item.title,
		imageUrl: item.imageUrl,
		museumId: item.museumId,
		museumTitle: item.museumTitle ?? "",
	}));
}

function buildColumns(showMuseum: boolean): TableColumn<ItemTableRow>[] {
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
	];

	if (showMuseum) {
		columns.push({
			key: "museumTitle",
			header: "Museu",
			width: proportional(1, { minWidth: 140 }),
			renderCell: (row) => (
				<Link href={`/${row.museumId}`} isStandalone>
					{row.museumTitle || row.museumId}
				</Link>
			),
		});
	}

	columns.push(
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
	);

	return columns;
}

export function ItemResultsTable({
	items,
	showMuseum = false,
}: ItemResultsTableProps) {
	const data = toRows(items);
	const columns = buildColumns(showMuseum);

	return (
		<Section variant="transparent" padding={0} width="100%">
			<Table
				data={data}
				columns={columns}
				idKey={(row) => `${row.museumId}-${row.id}`}
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

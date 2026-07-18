"use client";

import { Button } from "@astryxdesign/core/Button";
import { Collapsible } from "@astryxdesign/core/Collapsible";
import { MultiSelector } from "@astryxdesign/core/MultiSelector";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { useListTaxonomyTerms } from "@/services/generated/taxonomies/taxonomies";
import type { TainacanFilter, TainacanTerm } from "@/types/tainacan";
import {
	countActiveFilters,
	type FilterIntervalValue,
	type FiltersState,
	type FilterValue,
	getFilterFamily,
	getTaxonomyId,
	isSupportedFilter,
} from "@/utils/tainacanFilters";

export type MuseumFiltersPanelProps = {
	museumId: string;
	filters: FiltersState | null;
	filterDefs: TainacanFilter[];
	isLoading?: boolean;
	onChange: (next: FiltersState | null) => void;
};

function TaxonomyFilterControl({
	museumId,
	filter,
	value,
	onChange,
}: {
	museumId: string;
	filter: TainacanFilter;
	value: string[];
	onChange: (next: string[]) => void;
}) {
	const taxonomyId = getTaxonomyId(filter);
	const { data: terms = [], isLoading } = useListTaxonomyTerms<TainacanTerm[]>(
		taxonomyId ?? 0,
		undefined,
		{
			request: { museumId },
			query: {
				queryKey: ["taxonomy-terms", museumId, taxonomyId],
				enabled: taxonomyId !== null,
				select: (response) =>
					[...(response.data as TainacanTerm[])].sort((a, b) =>
						(a.name ?? "").localeCompare(b.name ?? "", "pt-BR", {
							sensitivity: "base",
						}),
					),
			},
		},
	);

	return (
		<MultiSelector
			label={filter.name}
			options={terms.map((term) => ({
				value: String(term.id),
				label: term.name,
			}))}
			value={value}
			onChange={onChange}
			placeholder="Selecionar..."
			hasSearch={terms.length > 8}
			searchPlaceholder="Buscar..."
			triggerDisplay="labels"
			isLoading={isLoading}
			size="sm"
		/>
	);
}

function TextFilterControl({
	filter,
	value,
	onCommit,
}: {
	filter: TainacanFilter;
	value: string;
	onCommit: (next: string) => void;
}) {
	const [local, setLocal] = useState(value);
	const [debounced] = useDebounce(local, 400);

	useEffect(() => {
		setLocal(value);
	}, [value]);

	useEffect(() => {
		if (debounced !== value) onCommit(debounced);
	}, [debounced, value, onCommit]);

	return (
		<TextInput
			label={filter.name}
			value={local}
			onChange={(next) => setLocal(next)}
			size="sm"
			hasClear
		/>
	);
}

function IntervalFilterControl({
	filter,
	value,
	onCommit,
}: {
	filter: TainacanFilter;
	value: FilterIntervalValue;
	onCommit: (next: FilterIntervalValue) => void;
}) {
	const [local, setLocal] = useState<FilterIntervalValue>(value);
	const [debounced] = useDebounce(local, 400);

	useEffect(() => {
		setLocal(value);
	}, [value]);

	useEffect(() => {
		const same =
			(debounced.min ?? "") === (value.min ?? "") &&
			(debounced.max ?? "") === (value.max ?? "");
		if (!same) onCommit(debounced);
	}, [debounced, value, onCommit]);

	return (
		<VStack gap={2}>
			<Text type="label" as="p">
				{filter.name}
			</Text>
			<TextInput
				label="Mínimo"
				value={local.min ?? ""}
				onChange={(min) => setLocal((prev) => ({ ...prev, min }))}
				size="sm"
				hasClear
			/>
			<TextInput
				label="Máximo"
				value={local.max ?? ""}
				onChange={(max) => setLocal((prev) => ({ ...prev, max }))}
				size="sm"
				hasClear
			/>
		</VStack>
	);
}

export function MuseumFiltersPanel({
	museumId,
	filters,
	filterDefs,
	isLoading = false,
	onChange,
}: MuseumFiltersPanelProps) {
	const supported = filterDefs.filter(isSupportedFilter);
	const activeCount = countActiveFilters(filters);
	const hasActive = activeCount > 0;
	const [isOpen, setIsOpen] = useState(hasActive);

	useEffect(() => {
		if (hasActive) {
			setIsOpen(true);
		}
	}, [hasActive]);

	if (isLoading || supported.length === 0) {
		return null;
	}

	const setFilterValue = (filterId: number, value: FilterValue | null) => {
		const key = String(filterId);
		const current = { ...(filters ?? {}) };
		if (value === null) {
			delete current[key];
		} else {
			current[key] = value;
		}
		onChange(Object.keys(current).length > 0 ? current : null);
	};

	return (
		<Collapsible
			isOpen={isOpen}
			onOpenChange={setIsOpen}
			trigger={
				<Text type="label" as="span">
					{hasActive ? `Filtros (${activeCount})` : "Filtros"}
				</Text>
			}
		>
			<VStack gap={4}>
				{supported.map((filter) => {
					const family = getFilterFamily(filter.filter_type);
					const raw = filters?.[String(filter.id)];

					if (family === "taxonomy") {
						const value = Array.isArray(raw) ? raw : [];
						return (
							<TaxonomyFilterControl
								key={filter.id}
								museumId={museumId}
								filter={filter}
								value={value}
								onChange={(next) =>
									setFilterValue(filter.id, next.length > 0 ? next : null)
								}
							/>
						);
					}

					if (family === "text") {
						const value = typeof raw === "string" ? raw : "";
						return (
							<TextFilterControl
								key={filter.id}
								filter={filter}
								value={value}
								onCommit={(next) =>
									setFilterValue(filter.id, next.trim() ? next : null)
								}
							/>
						);
					}

					if (family === "interval") {
						const value: FilterIntervalValue =
							raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
						return (
							<IntervalFilterControl
								key={filter.id}
								filter={filter}
								value={value}
								onCommit={(next) => {
									const empty = !next.min?.trim() && !next.max?.trim();
									setFilterValue(filter.id, empty ? null : next);
								}}
							/>
						);
					}

					return null;
				})}

				{hasActive ? (
					<Button
						variant="secondary"
						size="sm"
						label="Limpar filtros"
						onClick={() => onChange(null)}
					/>
				) : null}
			</VStack>
		</Collapsible>
	);
}

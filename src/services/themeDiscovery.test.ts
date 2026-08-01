import { beforeEach, describe, expect, it, vi } from "vitest";
import { listFilters } from "@/services/generated/filters/filters";
import type { Filter, Term } from "@/services/generated/tainacanV2.schemas";
import { listTaxonomyTerms } from "@/services/generated/taxonomies/taxonomies";
import { discoverMuseumThemes } from "@/services/themeDiscovery";

vi.mock("@/services/generated/filters/filters", () => ({
	listFilters: vi.fn(),
}));

vi.mock("@/services/generated/taxonomies/taxonomies", () => ({
	listTaxonomyTerms: vi.fn(),
}));

const listFiltersMock = vi.mocked(listFilters);
const listTaxonomyTermsMock = vi.mocked(listTaxonomyTerms);

function filter({
	id,
	name,
	filterType = "TaxonomyCheckbox",
	taxonomyId,
	taxonomyDbIdentifier,
}: {
	id: number;
	name: string;
	filterType?: string;
	taxonomyId?: number;
	taxonomyDbIdentifier?: string;
}): Filter {
	return {
		id,
		name,
		filter_type: filterType,
		collection_id: 1,
		metadatum: {
			metadata_type_object: {
				options: {
					taxonomy_id: taxonomyId,
					taxonomy: taxonomyDbIdentifier,
				},
			},
		},
	};
}

function term(id: number, name: string): Term {
	return { id, name };
}

function response<T>(data: T, totalPages = 1) {
	return {
		data,
		status: 200 as const,
		headers: new Headers({ "x-wp-totalpages": String(totalPages) }),
	};
}

describe("discoverMuseumThemes", () => {
	beforeEach(() => {
		listFiltersMock.mockReset();
		listTaxonomyTermsMock.mockReset();
	});

	it("discovers every paginated taxonomy term with the museum request signal", async () => {
		const signal = new AbortController().signal;
		listFiltersMock.mockImplementation(async (params) => {
			if (params?.paged === 1) {
				return response(
					[
						filter({
							id: 11,
							name: "Temas",
							taxonomyId: 101,
							taxonomyDbIdentifier: "temas",
						}),
					],
					2,
				);
			}
			return response([
				filter({
					id: 22,
					name: "Materiais",
					taxonomyId: 202,
					taxonomyDbIdentifier: "materiais",
				}),
			]);
		});
		listTaxonomyTermsMock.mockImplementation(async (taxonomyId, params) => {
			if (taxonomyId === 101 && params?.paged === 1) {
				return response([term(1001, "Arte Sacra")], 2);
			}
			if (taxonomyId === 101) {
				return response([term(1002, "Barroco")]);
			}
			return response([term(2001, "Papel")]);
		});

		await expect(discoverMuseumThemes("masp", signal)).resolves.toEqual({
			museumId: "masp",
			occurrences: [
				{
					museumId: "masp",
					filterId: 11,
					taxonomyId: 101,
					taxonomyDbIdentifier: "temas",
					taxonomyLabel: "Temas",
					termId: 1001,
					termLabel: "Arte Sacra",
				},
				{
					museumId: "masp",
					filterId: 11,
					taxonomyId: 101,
					taxonomyDbIdentifier: "temas",
					taxonomyLabel: "Temas",
					termId: 1002,
					termLabel: "Barroco",
				},
				{
					museumId: "masp",
					filterId: 22,
					taxonomyId: 202,
					taxonomyDbIdentifier: "materiais",
					taxonomyLabel: "Materiais",
					termId: 2001,
					termLabel: "Papel",
				},
			],
		});

		expect(listFiltersMock).toHaveBeenNthCalledWith(
			1,
			{ perpage: 100, paged: 1 },
			{ museumId: "masp", signal },
		);
		expect(listFiltersMock).toHaveBeenNthCalledWith(
			2,
			{ perpage: 100, paged: 2 },
			{ museumId: "masp", signal },
		);
		expect(listTaxonomyTermsMock).toHaveBeenNthCalledWith(
			1,
			101,
			{ perpage: 100, paged: 1 },
			{ museumId: "masp", signal },
		);
		expect(listTaxonomyTermsMock).toHaveBeenNthCalledWith(
			2,
			101,
			{ perpage: 100, paged: 2 },
			{ museumId: "masp", signal },
		);
		expect(listTaxonomyTermsMock).toHaveBeenNthCalledWith(
			3,
			202,
			{ perpage: 100, paged: 1 },
			{ museumId: "masp", signal },
		);
	});

	it("ignores filters that cannot produce a compatible taxonomy query", async () => {
		listFiltersMock.mockResolvedValue(
			response([
				filter({ id: 1, name: "Título", filterType: "Text" }),
				filter({ id: 2, name: "Sem id", taxonomyDbIdentifier: "temas" }),
				filter({ id: 3, name: "Sem identificador", taxonomyId: 3 }),
			]),
		);

		await expect(discoverMuseumThemes("pinacoteca")).resolves.toEqual({
			museumId: "pinacoteca",
			occurrences: [],
		});

		expect(listFiltersMock).toHaveBeenCalledWith(
			{ perpage: 100, paged: 1 },
			{ museumId: "pinacoteca" },
		);
		expect(listTaxonomyTermsMock).not.toHaveBeenCalled();
	});

	it("uses the lowest filter id when filters share a taxonomy", async () => {
		listFiltersMock.mockResolvedValue(
			response([
				filter({
					id: 9,
					name: "Assuntos alternativo",
					taxonomyId: 70,
					taxonomyDbIdentifier: "assuntos",
				}),
				filter({
					id: 4,
					name: "Assuntos",
					taxonomyId: 70,
					taxonomyDbIdentifier: "assuntos",
				}),
			]),
		);
		listTaxonomyTermsMock.mockResolvedValue(response([term(700, "Pintura")]));

		await expect(discoverMuseumThemes("museu-afro")).resolves.toEqual({
			museumId: "museu-afro",
			occurrences: [
				{
					museumId: "museu-afro",
					filterId: 4,
					taxonomyId: 70,
					taxonomyDbIdentifier: "assuntos",
					taxonomyLabel: "Assuntos",
					termId: 700,
					termLabel: "Pintura",
				},
			],
		});

		expect(listTaxonomyTermsMock).toHaveBeenCalledTimes(1);
		expect(listTaxonomyTermsMock).toHaveBeenCalledWith(
			70,
			{ perpage: 100, paged: 1 },
			{ museumId: "museu-afro" },
		);
	});

	it("propagates generated-service errors for React Query to isolate", async () => {
		const error = new Error("Resposta da API em formato inesperado.");
		listFiltersMock.mockRejectedValue(error);

		await expect(discoverMuseumThemes("mam")).rejects.toBe(error);
		expect(listTaxonomyTermsMock).not.toHaveBeenCalled();
	});
});

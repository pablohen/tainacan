export interface ItemDTO {
	status: string;
	id: number;
	title: string;
	description: string;
	collection_id: string;
	author_id: string;
	creation_date: string;
	modification_date: string;
	terms: null;
	document_type: string;
	document: string;
	document_options: string;
	_thumbnail_id: string;
	comment_status: boolean;
	author_name: string;
	url: string;
	document_mimetype: string;
	document_as_html: string;
	exposer_urls: any[];
	metadata: Metadata;
}

export interface Metadata {
	"numero-de-registro": Altura;
	"outros-numeros": OutrosNumeros;
	situacao: Altura;
	"title-3": Altura;
	titulo: Altura;
	autor: Autor;
	classificacao: Classificacao;
	"description-3": Altura;
	altura: Altura;
	largura: Altura;
	comprimento: Altura;
	profundidade: DataDeAquisicao;
	diametro: Altura;
	peso: Altura;
	material: Autor;
	tecnica: DataDeAquisicao;
	"marcas-inscricoes": DataDeAquisicao;
	"local-de-producao": Autor;
	"data-de-producao": Autor;
	localizacao: DataDeAquisicao;
	"modo-de-aquisicao": DataDeAquisicao;
	"data-de-aquisicao": DataDeAquisicao;
	procedencia: DataDeAquisicao;
	"historico-observacao": DataDeAquisicao;
}

export interface Altura {
	name: string;
	id: number;
	value: string;
	value_as_html: string;
	value_as_string: string;
	semantic_uri: string;
	multiple: Multiple;
	mapping: Mapping;
}

export interface Mapping {
	"inbcm-ibram": string;
}

export enum Multiple {
	No = "no",
}

export interface Autor {
	name: string;
	id: number;
	value: ValueElement[];
	value_as_html: string;
	value_as_string: string;
	semantic_uri: string;
	multiple: string;
	mapping: Mapping;
}

export interface ValueElement {
	name: string;
	parent: number;
	description: string;
	taxonomy: string;
	user: string;
	header_image_id: string;
	hide_empty: null;
	id: number;
	header_image: boolean;
	url: string;
	hierarchy_path: string;
}

export interface Classificacao {
	name: string;
	id: number;
	value: ValueElement;
	value_as_html: string;
	value_as_string: string;
	semantic_uri: string;
	multiple: Multiple;
	mapping: Mapping;
}

export interface DataDeAquisicao {
	name: string;
	id: number;
	value: ValueElement[] | null | string;
	value_as_html: string;
	value_as_string: string;
	semantic_uri: string;
	multiple: string;
	mapping: any[];
}

export interface OutrosNumeros {
	name: string;
	id: number;
	value: string[];
	value_as_html: string;
	value_as_string: string;
	semantic_uri: string;
	multiple: string;
	mapping: Mapping;
}

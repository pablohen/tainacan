import type { Metadata } from "../types/Metadata";

interface ItemMetadataProps {
	metadata: Metadata;
}

export function ItemMetadata({ metadata }: ItemMetadataProps) {
	if (!metadata.value_as_string) {
		return null;
	}
	return (
		<div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
			<div className="space-y-1">
				<h3 className="font-semibold text-gray-900 text-sm">{metadata.name}</h3>
				<p className="text-gray-600 text-sm leading-relaxed">
					{metadata.value_as_string}
				</p>
			</div>
		</div>
	);
}

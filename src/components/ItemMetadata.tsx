import type { Metadata } from "../interfaces/Metadata";

interface ItemMetadataProps {
  metadata: Metadata;
}

export function ItemMetadata({ metadata }: ItemMetadataProps) {
  if (!metadata.value_as_string) {
    return null;
  }
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 text-sm">{metadata.name}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {metadata.value_as_string}
        </p>
      </div>
    </div>
  );
}

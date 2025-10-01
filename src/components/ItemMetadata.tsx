import type { Metadata } from "../interfaces/Metadata";

interface ItemMetadataProps {
  metadata: Metadata;
}

export function ItemMetadata({ metadata }: ItemMetadataProps) {
  if (!metadata.value_as_string) {
    return null;
  }
  return (
    <p className="flex flex-col">
      <span className="font-bold text-black dark:text-white text-lg">{`${metadata.name}:`}</span>
      <span> </span>
      <span className="font-semibold text-gray-600 dark:text-gray-300">
        {metadata.value_as_string}
      </span>
    </p>
  );
}

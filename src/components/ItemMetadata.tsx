import { Info } from "lucide-react";
import type { Metadata } from "../interfaces/Metadata";

interface ItemMetadataProps {
  metadata: Metadata;
}

export function ItemMetadata({ metadata }: ItemMetadataProps) {
  if (!metadata.value_as_string) {
    return null;
  }
  return (
    <div className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border-2 border-gray-200 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
            <Info className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-bold text-gray-900 text-base leading-tight">
            {metadata.name}
          </h3>
          <p className="font-medium text-gray-600 text-sm leading-relaxed">
            {metadata.value_as_string}
          </p>
        </div>
      </div>
    </div>
  );
}

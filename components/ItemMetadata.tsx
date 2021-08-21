import Metadata from '../interfaces/Metadata';

interface Props {
  metadata: Metadata;
}

const ItemMetadata = ({ metadata }: Props) => {
  if (!metadata.value_as_string) {
    return null;
  }
  return (
    <p className="flex flex-col">
      <span className="font-bold text-black text-lg">{`${metadata.name}:`}</span>
      <span> </span>
      <span className="font-semibold text-gray-600">
        {metadata.value_as_string}
      </span>
    </p>
  );
};

export default ItemMetadata;

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import checkImagePath from '../utils/checkImagePath';
import isVisible from '../utils/isVisible';

interface Item {
  id: number;
  title: string;
}

interface Props {
  museumId: string;
  item: Item;
  searchTerm: string;
}

const Card = ({ museumId, item, searchTerm }: Props) => (
  <div
    className={`w-6/12 sm:w-4/12 md:w-3/12 lg:w-2/12 ${
      isVisible(item, searchTerm) ? '' : 'hidden'
    }`}
    key={`ItemMuseu__${museumId}`}
  >
    <Link href={`/museums/${museumId}/items/${item.id}`} passHref>
      <a>
        <div className="m-2 bg-white border shadow transform transition-all ease-in-out duration-500 hover:shadow-lg hover:-translate-y-1">
          <div className="flex justify-center items-center p-4">
            <img
              src={checkImagePath(item)}
              alt={item.id.toString()}
              className="object-center object-contain h-36"
            />
          </div>
          <div className="px-4 pb-4 ">
            <p className="font-semibold text-center truncate">
              {`${item?.id} - ${item?.title}`}
            </p>
          </div>
        </div>
      </a>
    </Link>
  </div>
);

export default Card;
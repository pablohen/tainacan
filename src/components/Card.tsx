/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";
import Link from "next/link";
import checkImagePath from "../utils/checkImagePath";

interface Item {
  id: number;
  title: string;
}

interface Props {
  museumId: string;
  item: Item;
}

const Card = ({ museumId, item }: Props) => {
  const imgPath = checkImagePath(item);
  const cardTitle = `${item.id} - ${item.title}`;

  return (
    <div
      className="w-6/12 sm:w-4/12 md:w-3/12 lg:w-2/12"
      key={`ItemMuseu__${museumId}`}
    >
      <Link href={`/${museumId}/items/${item.id}`}>
        <div className="m-2 bg-white dark:bg-gray-800 border dark:border-gray-900 shadow transform transition-all ease-in-out duration-500 hover:shadow-lg hover:-translate-y-1">
          <div className="flex justify-center items-center p-4">
            <motion.img
              src={imgPath}
              alt={String(item.id)}
              className="object-center object-contain h-36"
              layoutId={String(item.id)}
            />
          </div>
          <div className="px-4 pb-4 ">
            <p className="font-semibold text-gray-700 dark:text-gray-200 text-center truncate">
              {cardTitle}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Card;

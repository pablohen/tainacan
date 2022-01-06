import Link from 'next/link';
import { useRouter } from 'next/router';
import { BookmarkIcon } from '@heroicons/react/outline';
import Museums from '../utils/museums';

const MuseumList = () => {
  const router = useRouter();
  const { museumId } = router.query;
  const currentPage = (index: number) =>
    Number(museumId) === index
      ? 'bg-primary dark:bg-primary text-white border-primary shadow-md'
      : 'bg-white dark:bg-gray-900 text-primary dark:text-white border-gray-200 dark:border-gray-800 shadow-sm';

  return (
    <div className="overflow-x-scroll">
      <div className="inline-flex pt-4 pb-3 space-x-4 mr-4">
        {Museums.map((museum, index: number) => (
          <Link href={`/${index}`} passHref key={museum.url}>
            <a>
              <div
                className={`flex items-center whitespace-nowrap border rounded-full px-2 py-1 text-xs cursor-pointer transform transition-all ease-in-out hover:bg-primary dark:hover:bg-primary hover:border-primary hover:text-white hover:shadow-md ${currentPage(
                  index
                )}`}
              >
                <BookmarkIcon className="h-4 mr-1" />
                <h2 className="font-medium">{museum.title}</h2>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MuseumList;

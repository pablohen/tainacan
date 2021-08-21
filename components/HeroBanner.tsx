import { ArrowRightIcon } from '@heroicons/react/outline';
import Link from 'next/link';

interface Props {
  title: string;
  link?: string;
  description: string;
  background?: string;
}

const HeroBanner = ({
  title = 'Lorem ipsum',
  link = '#',
  description = '',
  background = 'bg-primary',
}: Props) => (
  <div className={background}>
    <div className="flex flex-col items-center">
      <div className="w-10/12 py-8 sm:py-16 space-y-8">
        <h2 className="flex items-center text-3xl lg:text-5xl font-light text-gray-100">
          {title}
        </h2>

        {description && <p className="text-lg text-gray-100">{description}</p>}

        {link !== '#' && (
          <Link href={link} passHref>
            <button
              type="button"
              className="flex justify-between items-center space-x-4 rounded border bg-white px-4 py-2 text-primary transform transition-all ease-in-out hover:shadow-xl hover:border hover:border-white"
            >
              Ir para o site
              <ArrowRightIcon className="h-4 ml-2" />
            </button>
          </Link>
        )}
      </div>
    </div>
  </div>
);

export default HeroBanner;

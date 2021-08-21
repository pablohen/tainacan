import Link from 'next/link';
import MuseumList from './MuseumList';

const Header = () => (
  <header className="bg-white sticky top-0 z-50 shadow-lg">
    <div className="flex items-center">
      <div className="flex flex-col sm:flex-row px-4  items-center justify-between ">
        <div>
          <Link href="/" passHref>
            <a className="text-primary font-bold text-lg">
              <h1>Tainacan</h1>
            </a>
          </Link>
        </div>
      </div>
      <MuseumList />
    </div>
  </header>
);

export default Header;

import Link from "next/link";
import MuseumList from "./MuseumList";

const Header = () => (
  <header className="bg-white dark:bg-black sticky top-0 z-50 shadow-lg">
    <div className="flex items-center">
      <div className="flex flex-col sm:flex-row px-4  items-center justify-between ">
        <div>
          <Link
            href="/"
            className="text-primary dark:text-white font-bold text-lg"
          >
            Tainacan
          </Link>
        </div>
      </div>
      <MuseumList />
    </div>
  </header>
);

export default Header;

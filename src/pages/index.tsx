import Link from 'next/link';
import { ExclamationIcon } from '@heroicons/react/outline';
import Footer from '../components/Footer';
import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';

const Home = () => (
  <div className="flex flex-col min-h-screen">
    <Header />

    <HeroBanner
      title="Casos de Uso"
      description="Lugares onde o sistema foi implementado e pode ser visualizado."
    />

    <div className="flex flex-col items-center justify-center flex-grow space-y-4">
      <div className="w-10/12">
        <div className="py-8 text-center space-y-4">
          <div className="flex items-center justify-center">
            <ExclamationIcon className="h-9 inline-flex mr-2" />
            <h3 className="text-3xl ">Aviso</h3>
          </div>
          <p className="">
            Este site não substitui o site oficial do projeto ou o de cada
            museu. O único objetivo é reunir o conteúdo e facilitar a busca por
            informação.
          </p>
          <p>
            Site oficial:{' '}
            <Link href="https://tainacan.org" passHref>
              <a target="_blank" rel="noreferrer">
                <span className="font-bold hover:underline">tainacan.org</span>
              </a>
            </Link>
          </p>
        </div>
      </div>
    </div>

    <Footer />
  </div>
);

export default Home;

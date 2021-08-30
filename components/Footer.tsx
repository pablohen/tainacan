import ThemeToggler from './ThemeToggler';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary dark:bg-primary w-full">
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-sm font-bold text-white">{`Tainacan @ ${year}`}</p>
        <ThemeToggler />
      </div>
    </footer>
  );
};

export default Footer;

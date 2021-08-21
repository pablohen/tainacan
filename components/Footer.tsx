const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="flex-none bg-primary w-full">
      <div className="flex items-center justify-center py-8">
        <p className="text-sm font-bold text-white">{`Tainacan @ ${year}`}</p>
      </div>
    </footer>
  );
};

export default Footer;

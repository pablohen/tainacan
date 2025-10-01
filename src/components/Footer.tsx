export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <p className="text-sm text-gray-600">{`Tainacan © ${currentYear}`}</p>
      </div>
    </footer>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Item não encontrado</h2>
        <p className="text-gray-600 dark:text-gray-400">
          O item que você está procurando não existe ou foi removido.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}

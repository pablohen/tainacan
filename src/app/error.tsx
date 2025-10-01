"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
      <div className="max-w-md w-full space-y-6 animate-fade-in">
        <Alert variant="destructive" className="border rounded-xl">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">
            Algo deu errado!
          </AlertTitle>
          <AlertDescription className="text-sm mt-2">
            {error.message || "Ocorreu um erro inesperado."}
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button
            onClick={reset}
            className="bg-gray-900 hover:bg-gray-800 text-white transition-colors duration-200 rounded-full"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    </div>
  );
}

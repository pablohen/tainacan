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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-md w-full space-y-6 animate-fade-in">
        {/* Gradient background effect */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-red-200 via-pink-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-pulse" />
        </div>

        <Alert
          variant="destructive"
          className="shadow-[0_20px_60px_rgb(0,0,0,0.15)] border-2 rounded-2xl"
        >
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-xl font-bold">
            Algo deu errado!
          </AlertTitle>
          <AlertDescription className="text-sm mt-2">
            {error.message || "Ocorreu um erro inesperado."}
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button
            onClick={reset}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.15)] transition-all duration-300 rounded-2xl"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    </div>
  );
}

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  title: string;
  link?: string;
  description: string;
  background?: string;
}

export function HeroBanner({
  title = "Lorem ipsum",
  link = "#",
  description = "",
  background = "bg-gray-50",
}: HeroBannerProps) {
  return (
    <div className={`${background} border-b border-gray-200`}>
      <div className="flex flex-col items-center">
        <div className="w-full max-w-5xl px-6 sm:px-8 lg:px-12 py-16 sm:py-24 space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              {title}
            </h2>
          </div>

          {description && (
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}

          {link !== "#" && (
            <div className="pt-2">
              <Link href={link} passHref>
                <Button className="group flex items-center gap-2 rounded-full bg-gray-900 hover:bg-gray-800 px-6 py-3 text-white font-medium transition-all duration-200 cursor-pointer">
                  <span>Ir para o site</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

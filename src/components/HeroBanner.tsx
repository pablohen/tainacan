import { ArrowRight, Sparkles } from "lucide-react";
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
  background = "bg-gradient-to-br from-primary via-secondary to-primary",
}: HeroBannerProps) {
  return (
    <div className={`${background} relative overflow-hidden`}>
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse" />
        <div
          className="absolute top-0 -right-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative flex flex-col items-center">
        <div className="w-full max-w-7xl px-6 sm:px-8 lg:px-12 py-12 sm:py-20 space-y-6">
          <div className="flex items-center gap-3 animate-fade-in">
            <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
            <h2 className="text-4xl lg:text-6xl font-bold text-white drop-shadow-2xl">
              {title}
            </h2>
          </div>

          {description && (
            <p
              className="text-lg lg:text-xl text-gray-100 max-w-3xl leading-relaxed animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              {description}
            </p>
          )}

          {link !== "#" && (
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Link href={link} passHref>
                <Button className="group flex items-center gap-3 rounded-2xl bg-white hover:bg-gray-50 px-8 py-4 text-primary font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.12)] transform transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_rgb(0,0,0,0.15)] border-2 border-white/20 cursor-pointer">
                  <span>Ir para o site</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

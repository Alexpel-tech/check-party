import { PawPrint, PartyPopper, Gift, Cake } from "lucide-react";
import { Card } from "@/components/ui/card";

export const PartyHeader = () => {
  return (
    <header className="text-center py-8 px-4">
      <div className="w-full h-[400px] md:h-[500px] mb-8 relative overflow-hidden rounded-lg bg-gradient-to-r from-party-blue via-party-purple to-party-pink">
        <div className="absolute inset-0 bg-opacity-20 bg-white flex items-center justify-center">
          <div className="grid grid-cols-3 gap-4 w-full h-full opacity-10">
            {Array.from({ length: 9 }).map((_, i) => (
              <PawPrint key={i} className="w-12 h-12 text-white transform rotate-45" />
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center gap-8 flex-col md:flex-row px-4">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-xl">
            <img 
              src="/lovable-uploads/5bff3ad7-0eab-41bb-afdd-cb7eb62d5d96.png"
              alt="Foto do aniversariante"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
              Festa do Bento!
            </h1>
            <p className="text-xl text-white">Patrulha Canina</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <PawPrint className="w-8 h-8 text-party-purple animate-bounce-slow" />
        <PartyPopper className="w-8 h-8 text-party-purple animate-bounce-slow" />
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-2xl font-bold text-gray-700 flex items-center gap-2">
          <Cake className="w-6 h-6 text-party-purple" />
          2 aninhos da Patrulha Canina
        </p>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Venha celebrar conosco este momento especial! 
          Dia 15 de Junho, às 15h, no Buffet Alegria
        </p>
      </div>
      <div className="mt-6 flex justify-center">
        <Gift className="w-12 h-12 text-party-purple animate-bounce-slow" />
      </div>
    </header>
  );
};
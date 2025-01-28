import { Gift, PartyPopper } from "lucide-react";

export const PartyHeader = () => {
  return (
    <header className="text-center py-8 px-4">
      <div className="flex items-center justify-center gap-4 mb-4">
        <Gift className="w-8 h-8 text-party-purple animate-bounce-slow" />
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-party-purple to-party-pink bg-clip-text text-transparent">
          Festa da Sofia!
        </h1>
        <PartyPopper className="w-8 h-8 text-party-purple animate-bounce-slow" />
      </div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Venha celebrar conosco este momento especial! 
        Dia 15 de Junho, às 15h, no Buffet Alegria
      </p>
    </header>
  );
};
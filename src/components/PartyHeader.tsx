import { PawPrint, PartyPopper, Gift, Cake } from "lucide-react";
import { Card } from "@/components/ui/card";

export const PartyHeader = () => {
  return (
    <header className="text-center py-8 px-4">
      <div className="flex items-center justify-center gap-4 mb-6">
        <PawPrint className="w-8 h-8 text-party-purple animate-bounce-slow" />
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-party-purple to-party-pink bg-clip-text text-transparent">
          Festa do Bento!
        </h1>
        <PartyPopper className="w-8 h-8 text-party-purple animate-bounce-slow" />
      </div>

      <div className="max-w-md mx-auto mb-8">
        <Card className="overflow-hidden bg-party-blue/20 hover:shadow-lg transition-shadow">
          <div className="aspect-square relative">
            <img
              src="/placeholder.svg"
              alt="Foto do Bento"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
              <p className="text-white text-xl font-bold">Bento - 2 aninhos</p>
            </div>
          </div>
        </Card>
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
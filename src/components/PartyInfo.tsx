import { Clock, MapPin, Calendar, PawPrint } from "lucide-react";
import { Card } from "@/components/ui/card";

export const PartyInfo = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
      <Card className="p-6 text-center bg-party-blue/30 hover:scale-105 transition-transform border-2 border-party-purple/20">
        <div className="bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
          <Calendar className="w-8 h-8 text-party-purple" />
        </div>
        <h3 className="font-bold mb-2 text-party-purple">Data</h3>
        <p>15 de Junho de 2024</p>
      </Card>

      <Card className="p-6 text-center bg-party-yellow/30 hover:scale-105 transition-transform border-2 border-party-purple/20">
        <div className="bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
          <Clock className="w-8 h-8 text-party-purple" />
        </div>
        <h3 className="font-bold mb-2 text-party-purple">Horário</h3>
        <p>Das 15h às 19h</p>
      </Card>

      <Card className="p-6 text-center bg-party-green/30 hover:scale-105 transition-transform border-2 border-party-purple/20">
        <div className="bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
          <MapPin className="w-8 h-8 text-party-purple" />
        </div>
        <h3 className="font-bold mb-2 text-party-purple">Local</h3>
        <p>Buffet Alegria<br />Rua das Flores, 123</p>
      </Card>

      <Card className="col-span-1 md:col-span-3 p-6 text-center bg-party-pink/30 hover:scale-105 transition-transform border-2 border-party-purple/20">
        <div className="bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
          <PawPrint className="w-8 h-8 text-party-purple" />
        </div>
        <h3 className="font-bold mb-2 text-party-purple">Tema</h3>
        <p>Patrulha Canina</p>
      </Card>
    </div>
  );
};
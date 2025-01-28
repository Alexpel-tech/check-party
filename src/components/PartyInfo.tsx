import { Clock, MapPin, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

export const PartyInfo = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
      <Card className="p-6 text-center bg-party-pink/30 hover:scale-105 transition-transform">
        <Calendar className="w-8 h-8 mx-auto mb-4 text-party-purple" />
        <h3 className="font-bold mb-2">Data</h3>
        <p>15 de Junho de 2024</p>
      </Card>

      <Card className="p-6 text-center bg-party-yellow/30 hover:scale-105 transition-transform">
        <Clock className="w-8 h-8 mx-auto mb-4 text-party-purple" />
        <h3 className="font-bold mb-2">Horário</h3>
        <p>Das 15h às 19h</p>
      </Card>

      <Card className="p-6 text-center bg-party-green/30 hover:scale-105 transition-transform">
        <MapPin className="w-8 h-8 mx-auto mb-4 text-party-purple" />
        <h3 className="font-bold mb-2">Local</h3>
        <p>Buffet Alegria<br />Rua das Flores, 123</p>
      </Card>
    </div>
  );
};
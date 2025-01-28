import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PartyPopper, Heart } from "lucide-react";

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center px-4">
        <div className="flex justify-center gap-4 mb-6">
          <PartyPopper className="w-12 h-12 text-party-purple animate-bounce-slow" />
          <Heart className="w-12 h-12 text-pink-500 animate-bounce-slow" />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-party-purple to-party-pink bg-clip-text text-transparent">
          Presença Confirmada!
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Obrigado por confirmar sua presença! Mal podemos esperar para celebrar
          este momento especial com você.
        </p>
        <div className="space-y-4">
          <p className="font-medium">Detalhes da Festa:</p>
          <ul className="text-gray-600 space-y-2">
            <li>📅 15 de Junho de 2024</li>
            <li>🕒 Das 15h às 19h</li>
            <li>📍 Buffet Alegria - Rua das Flores, 123</li>
          </ul>
        </div>
        <Button
          onClick={() => navigate("/")}
          className="mt-8 bg-party-purple hover:bg-party-purple/90"
        >
          Voltar para a Página Inicial
        </Button>
      </div>
    </div>
  );
};

export default Success;
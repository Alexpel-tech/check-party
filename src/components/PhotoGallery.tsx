import { Card } from "@/components/ui/card";
import { Camera, Download } from "lucide-react";

export const PhotoGallery = () => {
  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Galeria de Fotos</h2>
          <p className="text-gray-600">
            Após a festa, as fotos estarão disponíveis aqui para download!
          </p>
        </div>

        <Card className="p-8 bg-party-blue/10">
          <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
            <Camera className="w-16 h-16 text-party-purple opacity-50" />
            <p className="text-lg text-gray-600 text-center">
              As fotos serão disponibilizadas após o evento.
              <br />
              Volte aqui para fazer o download!
            </p>
            <div className="flex items-center gap-2 text-party-purple">
              <Download className="w-5 h-5" />
              <span>Download disponível em breve</span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
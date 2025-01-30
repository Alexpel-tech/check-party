import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { sendConfirmationSMS } from "@/utils/smsService";

export const ConfirmationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    parentName: "",
    childName: "",
    phone: "",
    email: "",
    guests: "0"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Enviar SMS de confirmação
      await sendConfirmationSMS({
        parentName: formData.parentName,
        childName: formData.childName,
        phone: formData.phone,
        guests: Number(formData.guests)
      });
      
      toast({
        title: "Confirmação recebida!",
        description: "Obrigado por confirmar sua presença!",
      });
      
      navigate("/sucesso");
    } catch (error) {
      toast({
        title: "Erro ao confirmar presença",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 shadow-lg bg-white/80 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="parentName">Nome do Responsável</Label>
          <Input
            id="parentName"
            required
            placeholder="Digite seu nome completo"
            className="w-full"
            value={formData.parentName}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="childName">Nome da Criança</Label>
          <Input
            id="childName"
            required
            placeholder="Digite o nome da criança"
            className="w-full"
            value={formData.childName}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            type="tel"
            required
            placeholder="(00) 00000-0000"
            className="w-full"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="seu@email.com"
            className="w-full"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guests">Número de Acompanhantes</Label>
          <Input
            id="guests"
            type="number"
            required
            min="0"
            max="5"
            placeholder="0"
            className="w-full"
            value={formData.guests}
            onChange={handleChange}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-party-purple hover:bg-party-purple/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Confirmando..." : "Confirmar Presença"}
        </Button>
      </form>
    </Card>
  );
};
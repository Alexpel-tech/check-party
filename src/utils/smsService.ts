import { toast } from "@/hooks/use-toast";

const PARENT_NUMBERS = [
  { name: 'Alex', number: '+5521981452612' },
  { name: 'Michele', number: '+5521981216898' }
];

interface SMSData {
  parentName: string;
  childName: string;
  phone: string;
  guests: number;
}

export const sendConfirmationSMS = async (data: SMSData) => {
  try {
    // Enviar SMS para os pais
    for (const parent of PARENT_NUMBERS) {
      await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: parent.number,
          message: `Nova confirmação de presença:\n${data.parentName} confirmou presença para ${data.childName}\nTelefone: ${data.phone}\nAcompanhantes: ${data.guests}`
        })
      });
    }

    // Enviar SMS para o convidado
    await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.phone,
        message: `Olá ${data.parentName}! Sua presença na festa do Bento foi confirmada!\nData: 15 de Junho de 2024\nHorário: 15h às 19h\nLocal: Buffet Alegria - Rua das Flores, 123\nAguardamos você e seus ${data.guests} acompanhantes!`
      })
    });

    toast({
      title: "SMS enviados com sucesso!",
      description: "Confirmações enviadas para todos os números.",
    });
  } catch (error) {
    console.error('Erro ao enviar SMS:', error);
    toast({
      title: "Erro ao enviar SMS",
      description: "Não foi possível enviar as mensagens de confirmação.",
      variant: "destructive",
    });
  }
};
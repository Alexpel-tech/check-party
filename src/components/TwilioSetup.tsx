import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { setTwilioCredentials } from '@/utils/twilioConfig';
import { useToast } from '@/hooks/use-toast';

export const TwilioSetup = () => {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTwilioCredentials(credentials);
    toast({
      title: 'Credenciais configuradas',
      description: 'As credenciais do Twilio foram salvas com sucesso.',
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 shadow-lg bg-white/80 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="accountSid">Account SID</Label>
          <Input
            id="accountSid"
            value={credentials.accountSid}
            onChange={(e) => setCredentials(prev => ({ ...prev, accountSid: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="authToken">Auth Token</Label>
          <Input
            id="authToken"
            type="password"
            value={credentials.authToken}
            onChange={(e) => setCredentials(prev => ({ ...prev, authToken: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Número do Twilio</Label>
          <Input
            id="phoneNumber"
            value={credentials.phoneNumber}
            onChange={(e) => setCredentials(prev => ({ ...prev, phoneNumber: e.target.value }))}
            required
            placeholder="+12345678900"
          />
        </div>

        <Button type="submit" className="w-full">
          Salvar Credenciais
        </Button>
      </form>
    </Card>
  );
};
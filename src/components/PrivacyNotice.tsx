import { Shield } from "lucide-react";

export const PrivacyNotice = () => {
  return (
    <footer className="mt-12 py-6 px-4 text-center text-sm text-gray-600 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <Shield className="w-5 h-5 mx-auto mb-2" />
        <p>
          Seus dados estão seguros conosco! Utilizamos apenas para enviar informações
          relacionadas à festa e não compartilhamos com terceiros.
        </p>
      </div>
    </footer>
  );
};
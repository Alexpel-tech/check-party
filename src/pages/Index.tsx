import { PartyHeader } from "@/components/PartyHeader";
import { ConfirmationForm } from "@/components/ConfirmationForm";
import { PartyInfo } from "@/components/PartyInfo";
import { PrivacyNotice } from "@/components/PrivacyNotice";

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto py-8 px-4">
        <PartyHeader />
        <main className="mt-12 space-y-16">
          <ConfirmationForm />
          <PartyInfo />
        </main>
        <PrivacyNotice />
      </div>
    </div>
  );
};

export default Index;
import { PartyHeader } from "@/components/PartyHeader";
import { ConfirmationForm } from "@/components/ConfirmationForm";
import { PartyInfo } from "@/components/PartyInfo";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { TwilioSetup } from "@/components/TwilioSetup";

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto py-8 px-4">
        <PartyHeader />
        <main className="mt-12 space-y-16">
          <TwilioSetup />
          <ConfirmationForm />
          <PartyInfo />
          <PhotoGallery />
        </main>
        <PrivacyNotice />
      </div>
    </div>
  );
};

export default Index;
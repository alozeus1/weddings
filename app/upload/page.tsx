import { UploadForm } from "@/components/upload/upload-form";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";

export default function UploadPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Guest Live Upload"
        title="Share Your Moments"
        subtitle="Scan the QR code, upload from your phone, and we'll add approved photos to the Live Gallery."
      />
      <Section title="Upload Photo" kicker="Mobile First">
        <div className="mx-auto max-w-xl">
          <UploadForm />
        </div>
      </Section>
    </>
  );
}

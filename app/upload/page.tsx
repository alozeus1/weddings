import { UploadForm } from "@/components/upload/upload-form";
import { PageHero } from "@/components/sections/page-hero";
import { PhotoMosaic } from "@/components/sections/photo-mosaic";
import { Section } from "@/components/sections/section";
import { heroImages, pageMosaics } from "@/lib/media";

export default function UploadPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Guest Live Upload"
        title="Share Your Moments"
        subtitle="Scan the QR code, upload from your phone, and we'll add approved photos to the Live Gallery."
        heroImage={heroImages.upload}
      />
      <Section title="Upload Photo" kicker="Mobile First">
        <PhotoMosaic images={[...pageMosaics.upload]} />
        <div className="mx-auto max-w-xl">
          <UploadForm />
        </div>
      </Section>
    </>
  );
}

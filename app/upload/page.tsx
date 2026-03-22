import Link from "next/link";
import { UploadForm } from "@/components/upload/upload-form";
import { PageHero } from "@/components/sections/page-hero";
import { PhotoMosaic } from "@/components/sections/photo-mosaic";
import { Section } from "@/components/sections/section";
import { uploadGuideContent } from "@/lib/content";
import { heroImages, pageMosaics } from "@/lib/media";

export default function UploadPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Guest Live Upload"
        title="Share Your Moments"
        subtitle={uploadGuideContent.instructions}
        heroImage={heroImages.upload}
      />
      <Section title="Upload Photo" kicker="Mobile First">
        <PhotoMosaic images={[...pageMosaics.upload]} />
        <div className="mx-auto max-w-xl">
          <p className="mb-4 text-sm leading-7 text-ink/75">
            Use <Link href={uploadGuideContent.uploadPage} className="underline">the upload page</Link> on your phone or scan the QR
            code at the event. Approved photos will appear in the Live Uploads section of the Gallery.
          </p>
          <UploadForm />
        </div>
      </Section>
    </>
  );
}

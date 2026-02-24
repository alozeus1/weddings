import QRCode from "qrcode";
import Image from "next/image";
import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";

export default async function QRPage(): Promise<React.JSX.Element> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const uploadUrl = `${baseUrl.replace(/\/$/, "")}/upload`;
  const qrDataUrl = await QRCode.toDataURL(uploadUrl, {
    width: 420,
    margin: 2,
    color: {
      dark: "#0f172a",
      light: "#faf9f6"
    }
  });

  return (
    <>
      <PageHero kicker="QR" title="Guest Upload QR" subtitle="Print this signage so guests can scan and upload photos instantly." />
      <Section title="Scan to Upload" kicker="Printable A4/A5">
        <div className="mx-auto max-w-xl rounded-2xl border border-gold-300/50 bg-white p-6 text-center shadow-card">
          <Image
            src={qrDataUrl}
            alt="QR code for upload page"
            width={288}
            height={288}
            unoptimized
            className="mx-auto h-72 w-72 rounded-lg border border-gold-300/40"
          />
          <p className="mt-4 text-sm text-ink/70">Destination: {uploadUrl}</p>
          <a
            href={qrDataUrl}
            download="wedding-upload-qr.png"
            className="mt-5 inline-flex rounded-md bg-gold-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink"
          >
            Download QR
          </a>
        </div>
      </Section>
    </>
  );
}

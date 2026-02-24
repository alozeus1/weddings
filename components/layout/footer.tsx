import Link from "next/link";

const footerLinks = [
  { href: "/church", label: "Church Schedule" },
  { href: "/menu", label: "Menu" },
  { href: "/registry", label: "Registry" },
  { href: "/wedding-party", label: "Wedding Party" },
  { href: "/families", label: "Families" },
  { href: "/upload", label: "Guest Upload" },
  { href: "/qr", label: "QR" }
];

export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-gold-300/40 bg-ivory py-12">
      <div className="container-shell space-y-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-5">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-[0.2em] text-gold-600 hover:text-gold-500"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold-600/80">Jessica &amp; Chibuike - 2026</p>
      </div>
    </footer>
  );
}

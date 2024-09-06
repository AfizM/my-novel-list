import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/announcements", label: "Announcements" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="bg-[#0D0D12] text-white py-6 mt-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)]">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <nav className="flex space-x-6 mb-8">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} MyNovelList. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

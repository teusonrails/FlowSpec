import Link from "next/link";
import { Zap } from "lucide-react";

const footerSections = [
  {
    title: "Product",
    links: [
      { href: "/catalog", label: "Browse Automations" },
      { href: "/creators", label: "Creators" },
      { href: "/dashboard/creator", label: "Sell on FlowSpec" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "#", label: "Documentation" },
      { href: "#", label: "FlowSpec Format" },
      { href: "#", label: "API Reference" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "#", label: "About" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-bold">FlowSpec</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Discover, buy, and sell AI automation workflows.
            </p>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-sm mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} FlowSpec. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

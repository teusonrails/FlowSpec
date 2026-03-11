import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Settings,
  Palette,
  BarChart3,
  CreditCard,
  Plus,
  Star,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/purchases", label: "Purchases", icon: ShoppingBag },
  { href: "/dashboard/reviews", label: "My Reviews", icon: Star },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const creatorLinks = [
  { href: "/dashboard/creator", label: "Creator Studio", icon: Palette },
  {
    href: "/dashboard/creator/automations",
    label: "My Automations",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/creator/automations/new",
    label: "New Automation",
    icon: Plus,
  },
  {
    href: "/dashboard/creator/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  { href: "/dashboard/creator/payouts", label: "Payouts", icon: CreditCard },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isCreator = user.role === "CREATOR" || user.role === "ADMIN";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        <aside className="space-y-6">
          <nav className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Account
            </p>
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
          {isCreator && (
            <nav className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Creator
              </p>
              {creatorLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}

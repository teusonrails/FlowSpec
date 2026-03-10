import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AutomationNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-2">Automation not found</h2>
      <p className="text-muted-foreground mb-6">
        The automation you&apos;re looking for doesn&apos;t exist or has been
        removed.
      </p>
      <Button asChild>
        <Link href="/catalog">Browse automations</Link>
      </Button>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreatorNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-2">Creator not found</h2>
      <p className="text-muted-foreground mb-6">
        The creator profile you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button asChild>
        <Link href="/creators">Browse creators</Link>
      </Button>
    </div>
  );
}

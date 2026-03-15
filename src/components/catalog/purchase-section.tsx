"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import { toast } from "sonner";

interface PurchaseSectionProps {
  automationId: string;
  slug: string;
  priceStarter: number | null;
  pricePro: number | null;
  priceAgency: number | null;
  tier: string; // FREE, OPEN, CURATED
  hasPurchased: boolean;
  isAuthenticated: boolean;
}

export function PurchaseSection({
  automationId,
  slug,
  priceStarter,
  pricePro,
  priceAgency,
  tier,
  hasPurchased,
  isAuthenticated,
}: PurchaseSectionProps) {
  const [downloading, setDownloading] = useState(false);
  const [claimed, setClaimed] = useState(hasPurchased);
  const [isPending, startTransition] = useTransition();

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/automations/${automationId}/download`);
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Download failed");
        return;
      }

      // If the response is a file (text/plain), trigger download
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("text/plain")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `automation-${automationId}.flowspec`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        if (data.downloadUrl) {
          window.open(data.downloadUrl, "_blank");
        }
      }
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  }

  async function handleClaimFree() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout/claim-free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ automationId }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Failed to claim");
          return;
        }
        setClaimed(true);
        toast.success("Automation added to your library!");
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  // Already purchased
  if (claimed) {
    return (
      <div className="space-y-3">
        <Badge
          variant="secondary"
          className="w-full justify-center py-1.5 bg-green-500/10 text-green-600"
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          You own this
        </Badge>
        <Button
          className="w-full"
          size="lg"
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download className="mr-2 h-4 w-4" />
          {downloading ? "Preparing..." : "Download"}
        </Button>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <Button className="w-full" size="lg" asChild>
        <Link href={`/login?redirect=/catalog/${slug}`}>
          Sign in to Purchase
        </Link>
      </Button>
    );
  }

  // Free automation
  if (tier === "FREE" || (!priceStarter && !pricePro && !priceAgency)) {
    return (
      <Button
        className="w-full"
        size="lg"
        onClick={handleClaimFree}
        disabled={isPending}
      >
        {isPending ? "Claiming..." : "Get Free"}
      </Button>
    );
  }

  // Paid — determine default tier
  const defaultTier = pricePro ? "pro" : priceStarter ? "starter" : "agency";
  const defaultPrice = pricePro ?? priceStarter ?? priceAgency ?? 0;

  return (
    <Button className="w-full" size="lg" asChild>
      <Link href={`/checkout/${automationId}?tier=${defaultTier}`}>
        Buy Now — {formatPrice(defaultPrice)}
      </Link>
    </Button>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface DownloadButtonProps {
  automationId: string;
}

export function DownloadButton({ automationId }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/automations/${automationId}/download`);
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Download failed");
        return;
      }

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
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
    >
      <Download className="mr-1.5 h-4 w-4" />
      {loading ? "Preparing..." : "Download"}
    </Button>
  );
}

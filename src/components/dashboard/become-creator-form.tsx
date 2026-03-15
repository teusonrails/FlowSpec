"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { becomeCreator } from "@/lib/actions/profile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function BecomeCreatorForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await becomeCreator(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Welcome to FlowSpec Creators!");
        router.push("/dashboard/creator");
        router.refresh();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name *</Label>
        <Input
          id="displayName"
          name="displayName"
          placeholder="Your creator name"
          required
          maxLength={100}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Tell buyers about yourself..."
          rows={3}
          maxLength={500}
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Setting up..." : "Become a Creator"}
      </Button>
    </form>
  );
}

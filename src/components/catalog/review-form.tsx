"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { createReview } from "@/lib/actions/review";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  automationId: string;
}

export function ReviewForm({ automationId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    formData.set("rating", rating.toString());

    startTransition(async () => {
      const result = await createReview(automationId, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Review submitted!");
        setRating(0);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-0.5"
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  value <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-title">Title (optional)</Label>
        <Input
          id="review-title"
          name="title"
          placeholder="Summary of your experience"
          maxLength={100}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-body">Review (optional)</Label>
        <Textarea
          id="review-body"
          name="body"
          placeholder="Tell others about your experience..."
          rows={3}
          maxLength={2000}
        />
      </div>
      <Button type="submit" disabled={isPending || rating === 0}>
        {isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}

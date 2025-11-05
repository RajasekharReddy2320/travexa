import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const reviewSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  rating: z.number().min(1, "Please select a rating").max(5),
  review_text: z.string().trim().min(10, "Review must be at least 10 characters").max(1000, "Review must be less than 1000 characters")
});

const ReviewSection = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate input
      const validatedData = reviewSchema.parse({
        full_name: fullName,
        email,
        rating,
        review_text: reviewText
      });

      setIsSubmitting(true);

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();

      // Insert review
      const { error } = await supabase
        .from("reviews")
        .insert({
          user_id: user?.id || null,
          full_name: validatedData.full_name,
          email: validatedData.email,
          rating: validatedData.rating,
          review_text: validatedData.review_text
        });

      if (error) throw error;

      toast({
        title: "Thank you for your review!",
        description: "Your feedback helps us improve Travexa.",
      });

      // Reset form
      setFullName("");
      setEmail("");
      setRating(0);
      setReviewText("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit review. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container mx-auto px-6 md:px-12 max-w-2xl py-20 md:py-32">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-serif font-light">Share Your Experience</CardTitle>
          <CardDescription>
            Your feedback helps us create better travel experiences for everyone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review">Your Review *</Label>
              <Textarea
                id="review"
                placeholder="Tell us about your experience with Travexa..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={5}
                maxLength={1000}
                required
              />
              <p className="text-xs text-muted-foreground text-right">
                {reviewText.length}/1000 characters
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default ReviewSection;

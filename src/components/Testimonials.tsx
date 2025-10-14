import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "New York, USA",
    text: "Travexa transformed the way I plan trips. The AI suggestions were spot-on and I discovered places I would have never found on my own!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    location: "Singapore",
    text: "The social features are incredible. I met amazing travel buddies and we explored Thailand together. Best travel experience ever!",
    rating: 5,
  },
  {
    name: "Emma Williams",
    location: "London, UK",
    text: "Booking everything in one place saved me so much time and money. The AI itinerary was perfect for my family vacation.",
    rating: 5,
  },
  {
    name: "Carlos Rodriguez",
    location: "Barcelona, Spain",
    text: "I've used many travel apps, but Travexa stands out. The personalization is unmatched and the community is so helpful!",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            What Travelers Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of happy travelers who've discovered their perfect trips
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                <div className="p-1">
                  <Card className="border-border hover:border-accent transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                        ))}
                      </div>
                      <p className="text-foreground mb-6 text-lg leading-relaxed">
                        "{testimonial.text}"
                      </p>
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default Testimonials;

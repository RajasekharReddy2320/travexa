import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, DollarSign, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

const INTEREST_OPTIONS = [
  "Adventure", "Culture", "Food", "Nature", "History", 
  "Beach", "Shopping", "Nightlife", "Museums", "Photography"
];

const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget ($-$$)", range: "$500-$1500" },
  { value: "moderate", label: "Moderate ($$-$$$)", range: "$1500-$3500" },
  { value: "luxury", label: "Luxury ($$$-$$$$)", range: "$3500+" }
];

export default function PlanTrip() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("moderate");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<any>(null);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerate = async () => {
    if (!destination || !startDate || !endDate || selectedInterests.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select at least one interest.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-itinerary', {
        body: {
          destination,
          startDate,
          endDate,
          budget: BUDGET_OPTIONS.find(b => b.value === budget)?.range || budget,
          interests: selectedInterests,
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setItinerary(data.itinerary);
      toast({
        title: "Itinerary Generated!",
        description: "Your personalized trip plan is ready.",
      });
    } catch (error: any) {
      console.error('Error generating itinerary:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Trip Planner
            </h1>
            <p className="text-muted-foreground">
              Let AI create your perfect itinerary in seconds
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
                <CardDescription>Tell us about your dream vacation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="destination" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Destination
                  </Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Paris, France"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Budget
                  </Label>
                  <div className="space-y-2">
                    {BUDGET_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => setBudget(option.value)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          budget === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.range}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Interests (Select at least one)</Label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((interest) => (
                      <Badge
                        key={interest}
                        variant={selectedInterests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Itinerary
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Display */}
            <div className="space-y-4">
              {!itinerary ? (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2">Your Itinerary Will Appear Here</h3>
                    <p className="text-muted-foreground">
                      Fill in the details and click generate to see your personalized trip plan
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trip Overview</CardTitle>
                      <CardDescription>
                        {destination} • {itinerary.days?.length || 0} days
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Estimated Total Cost</span>
                          <span className="font-semibold text-lg">{itinerary.totalEstimatedCost}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {itinerary.days?.map((day: any) => (
                    <Card key={day.day}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Day {day.day}</span>
                          <Badge variant="outline">{day.date}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {day.activities?.map((activity: any, idx: number) => (
                          <div key={idx} className="border-l-2 border-primary pl-4 space-y-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge variant="secondary" className="mb-1">{activity.time}</Badge>
                                <h4 className="font-semibold">{activity.title}</h4>
                                <p className="text-sm text-muted-foreground">{activity.description}</p>
                                <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                                  <span>📍 {activity.location}</span>
                                  <span>⏱️ {activity.duration}</span>
                                  <span>💰 {activity.cost}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {day.meals && day.meals.length > 0 && (
                          <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-2">Recommended Meals</h4>
                            <div className="space-y-2">
                              {day.meals.map((meal: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <div>
                                    <span className="font-medium">{meal.type}:</span> {meal.restaurant}
                                    <span className="text-muted-foreground ml-2">({meal.cuisine})</span>
                                  </div>
                                  <span className="text-muted-foreground">{meal.cost}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {itinerary.tips && itinerary.tips.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Travel Tips</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {itinerary.tips.map((tip: string, idx: number) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-primary">•</span>
                              <span className="text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={() => navigate('/book', { state: { itinerary, destination } })}
                    className="w-full"
                    size="lg"
                  >
                    Book This Trip
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

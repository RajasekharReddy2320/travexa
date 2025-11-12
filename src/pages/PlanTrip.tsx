import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, IndianRupee, MapPin, Sparkles, Users, Zap, Clock, Wallet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "@/components/DashboardNav";
import { Progress } from "@/components/ui/progress";

const INTEREST_OPTIONS = [
  "Adventure", "Culture", "Food", "Nature", "History", 
  "Beach", "Shopping", "Nightlife", "Museums", "Photography"
];

type PlannerMode = 'comfort' | 'time' | 'budget';

const PLANNER_MODES = [
  {
    value: 'comfort' as PlannerMode,
    icon: Sparkles,
    title: 'Comfort Planner',
    description: 'Premium experiences, relaxation-focused, stress-free travel',
    color: 'text-purple-500'
  },
  {
    value: 'time' as PlannerMode,
    icon: Clock,
    title: 'Time Planner',
    description: 'Optimized schedule, efficient routing, maximum experiences',
    color: 'text-blue-500'
  },
  {
    value: 'budget' as PlannerMode,
    icon: Wallet,
    title: 'Budget Planner',
    description: 'Best value deals, cost-effective options, money-saving tips',
    color: 'text-green-500'
  }
];

export default function PlanTrip() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plannerMode, setPlannerMode] = useState<PlannerMode>('comfort');
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetINR, setBudgetINR] = useState("");
  const [groupSize, setGroupSize] = useState("1");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // Sample itinerary to show by default
  const sampleItinerary = {
    overview: "A perfect 3-day romantic getaway to Udaipur, the City of Lakes, featuring luxurious palace hotels, serene boat rides, and stunning Rajasthani architecture.",
    estimatedCostINR: 35000,
    dailyPlan: [
      {
        day: 1,
        activities: "Arrival at Udaipur Airport, Check-in at heritage hotel overlooking Lake Pichola, Evening visit to City Palace - explore royal courtyards and museums, Sunset boat ride on Lake Pichola with views of Lake Palace and Jag Mandir, Dinner at Ambrai Restaurant with lake views"
      },
      {
        day: 2,
        activities: "Morning visit to Saheliyon ki Bari (Garden of Maidens) with beautiful fountains, Explore Jagdish Temple - stunning Indo-Aryan architecture, Lunch at traditional Rajasthani thali restaurant, Afternoon cable car ride to Karni Mata Temple for panoramic city views, Evening cultural show - Rajasthani folk dance and music at Bagore ki Haveli, Dinner cruise on Lake Pichola"
      },
      {
        day: 3,
        activities: "Early morning visit to Fateh Sagar Lake for peaceful sunrise, Breakfast at lakeside café, Visit Vintage Car Museum showcasing royal collection, Shopping for miniature paintings and handicrafts at local markets, Lunch at rooftop restaurant with city views, Check-out and departure with memories of the White City"
      }
    ],
    tips: "Book heritage hotels in advance for best rates. October to March is the best time to visit. Don't miss the sunset boat ride on Lake Pichola. Try authentic Rajasthani cuisine at local restaurants. Carry cash for shopping at local markets."
  };
  
  const [itinerary, setItinerary] = useState<any>(sampleItinerary);
  const [aiModel, setAiModel] = useState<'gemini' | 'gpt5' | 'gpt5-mini'>('gemini');

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerate = async (regenerateDay?: number) => {
    if (!destination || !startDate || !endDate || selectedInterests.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one interest.",
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
          budgetINR: budgetINR ? parseFloat(budgetINR) : null,
          groupSize: parseInt(groupSize),
          interests: selectedInterests,
          plannerMode,
          aiModel,
          regenerateDay,
          existingItinerary: regenerateDay ? itinerary : undefined
        }
      });

      if (error) throw error;

      if (data.error) {
        // If the response suggests using Gemini, automatically switch to it
        if (data.suggestModel === 'gemini' && aiModel !== 'gemini') {
          toast({
            title: "Switching to Gemini",
            description: "OpenAI rate limit reached. Automatically retrying with Google Gemini...",
          });
          setAiModel('gemini');
          // Retry with Gemini after a short delay
          setTimeout(() => handleGenerate(regenerateDay), 1000);
          return;
        }
        throw new Error(data.error);
      }

      setItinerary(data.itinerary);
      toast({
        title: regenerateDay ? `Day ${regenerateDay} Regenerated!` : "Itinerary Generated!",
        description: regenerateDay ? "The day has been updated with new activities." : "Your personalized trip plan is ready.",
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

  const handleSaveTrip = async () => {
    if (!itinerary) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { error } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        title: `${destination} Trip`,
        destination,
        start_date: startDate,
        end_date: endDate,
        trip_type: 'ai',
        planner_mode: plannerMode,
        budget_inr: budgetINR ? parseFloat(budgetINR) : null,
        group_size: parseInt(groupSize),
        interests: selectedInterests,
        itinerary
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save trip",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Trip saved successfully!"
    });

    navigate("/plan-trip");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Trip Planner
            </h1>
            <p className="text-muted-foreground">
              Choose your planner mode and let AI create your perfect itinerary
            </p>
            <p className="text-sm text-primary mt-2">
              ⭐ Sample itinerary shown below - Fill the form to generate your custom trip!
            </p>
          </div>

          {/* Planner Mode Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center">Select Your Planning Mode</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {PLANNER_MODES.map((mode) => {
                const Icon = mode.icon;
                const isActive = plannerMode === mode.value;
                
                return (
                  <Card
                    key={mode.value}
                    className={`cursor-pointer transition-all ${
                      isActive ? 'border-primary shadow-lg ring-2 ring-primary' : 'hover:border-accent'
                    }`}
                    onClick={() => setPlannerMode(mode.value)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className={`h-6 w-6 ${isActive ? mode.color : 'text-muted-foreground'}`} />
                        {mode.title}
                      </CardTitle>
                      <CardDescription>{mode.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Planning Form */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
                <CardDescription>Fill in your travel information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="destination">Destination *</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="destination"
                      placeholder="e.g., Goa, India"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budgetINR">Budget (INR)</Label>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="budgetINR"
                        type="number"
                        placeholder="50000"
                        value={budgetINR}
                        onChange={(e) => setBudgetINR(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="groupSize">Group Size</Label>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="groupSize"
                        type="number"
                        min="1"
                        value={groupSize}
                        onChange={(e) => setGroupSize(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Interests *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
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

                <div>
                  <Label htmlFor="aiModel">AI Model</Label>
                  <Select value={aiModel} onValueChange={(value: any) => setAiModel(value)}>
                    <SelectTrigger id="aiModel">
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">
                        <div className="flex flex-col">
                          <span>Google Gemini ⚡ (Recommended)</span>
                          <span className="text-xs text-muted-foreground">Fast & Free via Lovable AI</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="gpt5">
                        <div className="flex flex-col">
                          <span>GPT-5</span>
                          <span className="text-xs text-muted-foreground">Requires OpenAI credits</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="gpt5-mini">
                        <div className="flex flex-col">
                          <span>GPT-5 Mini</span>
                          <span className="text-xs text-muted-foreground">Requires OpenAI credits</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => handleGenerate()}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Zap className="mr-2 h-4 w-4 animate-spin" />
                      Generating Itinerary...
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

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Itinerary</span>
                  {itinerary === sampleItinerary && (
                    <Badge variant="secondary" className="text-xs">Sample</Badge>
                  )}
                </CardTitle>
                <CardDescription>AI-generated travel plan</CardDescription>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="space-y-4">
                    <Progress value={33} className="w-full" />
                    <p className="text-center text-sm text-muted-foreground">
                      Creating your perfect itinerary...
                    </p>
                  </div>
                )}

                {!loading && !itinerary && (
                  <div className="text-center py-12">
                    <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">
                      No itinerary yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Fill in the details and generate your trip
                    </p>
                  </div>
                )}

                {!loading && itinerary && (
                  <div className="space-y-4">
                    <div className="prose prose-sm max-w-none">
                      {/* Handle summary field if present */}
                      {itinerary.summary && typeof itinerary.summary === 'string' && (
                        <div className="mb-4 p-4 bg-accent/10 rounded-lg">
                          <h3 className="text-lg font-semibold mb-2">Summary</h3>
                          <p className="text-sm">{itinerary.summary}</p>
                        </div>
                      )}
                      
                      {/* Handle overview field */}
                      {itinerary.overview && typeof itinerary.overview === 'string' && (
                        <div className="mb-4 p-4 bg-accent/10 rounded-lg">
                          <h3 className="text-lg font-semibold mb-2">Overview</h3>
                          <p className="text-sm">{itinerary.overview}</p>
                        </div>
                      )}

                      {/* Handle estimated cost - check multiple field names */}
                      {(itinerary.estimatedCostINR || itinerary.totalEstimatedCost || itinerary.estimatedCost) && (
                        <div className="mb-4 p-4 bg-primary/10 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Estimated Trip Cost:</span>
                            <span className="text-2xl font-bold text-primary">
                              ₹{(itinerary.estimatedCostINR || 
                                 (typeof itinerary.totalEstimatedCost === 'string' 
                                   ? parseInt(itinerary.totalEstimatedCost.replace(/[^0-9]/g, '')) 
                                   : itinerary.totalEstimatedCost) ||
                                 itinerary.estimatedCost || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Handle daily plan */}
                      {itinerary.dailyPlan && Array.isArray(itinerary.dailyPlan) && itinerary.dailyPlan.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Daily Plan</h3>
                          <div className="space-y-3">
                            {itinerary.dailyPlan.map((day: any, index: number) => (
                              <div key={index} className="p-3 border rounded-lg group relative">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold mb-1">
                                      Day {typeof day.day === 'number' ? day.day : index + 1}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {typeof day.activities === 'string' 
                                        ? day.activities 
                                        : Array.isArray(day.activities)
                                        ? day.activities.join(', ')
                                        : typeof day.activities === 'object'
                                        ? JSON.stringify(day.activities)
                                        : String(day.activities || '')}
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleGenerate(typeof day.day === 'number' ? day.day : index + 1)}
                                    disabled={loading}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Handle tips */}
                      {itinerary.tips && typeof itinerary.tips === 'string' && (
                        <div className="mt-4 p-4 bg-secondary/10 rounded-lg">
                          <h3 className="text-lg font-semibold mb-2">Travel Tips</h3>
                          <p className="text-sm">{itinerary.tips}</p>
                        </div>
                      )}
                      
                      {/* Fallback: Display any unexpected structure as debug info */}
                      {!itinerary.dailyPlan && !itinerary.overview && !itinerary.summary && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <p className="text-sm mb-2 font-semibold">Unexpected response format. Raw data:</p>
                          <pre className="text-xs overflow-auto max-h-96 bg-white dark:bg-gray-900 p-2 rounded">
                            {JSON.stringify(itinerary, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveTrip} className="flex-1">
                        Save Trip
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/book', { state: { itinerary, destination } })}>
                        Book Now
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
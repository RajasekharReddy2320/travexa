import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, IndianRupee, Users, Save, UserCog } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";

const CreateTrip = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState({
    title: "",
    destination: "",
    start_date: "",
    end_date: "",
    budget_range: "",
    group_size: "1",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tripData.title || !tripData.destination || !tripData.start_date || !tripData.end_date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { error } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        title: tripData.title,
        destination: tripData.destination,
        start_date: tripData.start_date,
        end_date: tripData.end_date,
        trip_type: 'manual',
        budget_inr: null,
        group_size: parseInt(tripData.group_size),
        notes: tripData.notes + (tripData.budget_range ? `\n\nBudget Range: ${tripData.budget_range}` : '')
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create trip",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Trip created successfully!"
    });

    navigate("/plan-trip");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Trip</h1>
          <p className="text-muted-foreground">Plan your trip manually with full control</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
              <CardDescription>Fill in your trip information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Trip Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Summer Vacation to Goa"
                  value={tripData.title}
                  onChange={(e) => setTripData({ ...tripData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="destination">Destination *</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="destination"
                    placeholder="e.g., Goa, India"
                    value={tripData.destination}
                    onChange={(e) => setTripData({ ...tripData, destination: e.target.value })}
                    required
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="start_date"
                      type="date"
                      value={tripData.start_date}
                      onChange={(e) => setTripData({ ...tripData, start_date: e.target.value })}
                      required
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="end_date"
                      type="date"
                      value={tripData.end_date}
                      onChange={(e) => setTripData({ ...tripData, end_date: e.target.value })}
                      required
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_range">Budget Range</Label>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budget_range"
                      placeholder="e.g., ₹50,000 - ₹1,00,000"
                      value={tripData.budget_range}
                      onChange={(e) => setTripData({ ...tripData, budget_range: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="group_size">Group Size</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="group_size"
                      type="number"
                      min="1"
                      value={tripData.group_size}
                      onChange={(e) => setTripData({ ...tripData, group_size: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Preferences</Label>
                <Textarea
                  id="notes"
                  placeholder="Add your travel preferences..."
                  value={tripData.notes}
                  onChange={(e) => setTripData({ ...tripData, notes: e.target.value })}
                  rows={6}
                />
              </div>

              <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  "Connecting..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Connect with Agent
                  </>
                )}
              </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/plan-trip")}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Need Professional Help?
              </CardTitle>
              <CardDescription>
                Connect with travel experts to plan your perfect trip
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/travel-agents")}
                className="w-full"
              >
                <Users className="mr-2 h-4 w-4" />
                Connect with Travel Agents
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/local-guides")}
                className="w-full"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Connect with Local Guides
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateTrip;
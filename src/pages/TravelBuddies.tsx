import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardNav from "@/components/DashboardNav";
import { Search, MapPin, Users } from "lucide-react";

const TravelBuddies = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Travel Buddies</h1>
          <p className="text-muted-foreground">Find and connect with fellow travelers</p>
        </div>

        <Tabs defaultValue="find" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="find">
              <Search className="h-4 w-4 mr-2" />
              Find Buddies
            </TabsTrigger>
            <TabsTrigger value="nearby">
              <MapPin className="h-4 w-4 mr-2" />
              Nearby
            </TabsTrigger>
            <TabsTrigger value="travel-with-me">
              <Users className="h-4 w-4 mr-2" />
              Travel With Me
            </TabsTrigger>
          </TabsList>

          <TabsContent value="find" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Search for Travel Buddies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-6">
                  <Input
                    placeholder="Search by destination, interests, or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button>Search</Button>
                </div>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Start searching to find travel buddies with similar interests</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nearby" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Travelers Nearby</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Enable location to find travelers near you</p>
                  <Button className="mt-4">Enable Location</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="travel-with-me" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Your Travel Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Share your travel plans and invite others to join you</p>
                  <Button className="mt-4">Create Travel Plan</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TravelBuddies;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Users, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TravelAgent {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
  specialization: string[];
  experience: string;
  location: string;
  planningFee: number;
  tripsPlanned: number;
  description: string;
}

const travelAgents: TravelAgent[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    rating: 4.9,
    reviews: 234,
    specialization: ["Adventure", "Mountain Treks", "North India"],
    experience: "8 years",
    location: "Delhi",
    planningFee: 999,
    tripsPlanned: 500,
    description: "Expert in planning adventure trips and mountain expeditions across the Himalayas."
  },
  {
    id: "2",
    name: "Priya Sharma",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    rating: 4.8,
    reviews: 189,
    specialization: ["Beach", "Honeymoon", "Luxury Travel"],
    experience: "6 years",
    location: "Mumbai",
    planningFee: 1299,
    tripsPlanned: 380,
    description: "Specializes in romantic getaways and luxury beach destinations."
  },
  {
    id: "3",
    name: "Arjun Patel",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
    rating: 4.7,
    reviews: 156,
    specialization: ["Cultural Tours", "Heritage Sites", "South India"],
    experience: "5 years",
    location: "Bangalore",
    planningFee: 799,
    tripsPlanned: 290,
    description: "Cultural tour expert with deep knowledge of South Indian heritage sites."
  },
  {
    id: "4",
    name: "Meera Iyer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
    rating: 4.9,
    reviews: 267,
    specialization: ["Wildlife", "Photography", "National Parks"],
    experience: "10 years",
    location: "Pune",
    planningFee: 1499,
    tripsPlanned: 620,
    description: "Wildlife enthusiast offering exceptional photography-focused safari experiences."
  },
  {
    id: "5",
    name: "Vikram Singh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
    rating: 4.6,
    reviews: 142,
    specialization: ["Budget Travel", "Backpacking", "Youth Groups"],
    experience: "4 years",
    location: "Jaipur",
    planningFee: 599,
    tripsPlanned: 210,
    description: "Budget travel expert helping young travelers explore India affordably."
  },
  {
    id: "6",
    name: "Ananya Reddy",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
    rating: 4.8,
    reviews: 198,
    specialization: ["Family Tours", "Kid-Friendly", "Resorts"],
    experience: "7 years",
    location: "Hyderabad",
    planningFee: 899,
    tripsPlanned: 445,
    description: "Family vacation specialist ensuring memorable experiences for all ages."
  },
  {
    id: "7",
    name: "Kabir Malhotra",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir",
    rating: 4.9,
    reviews: 312,
    specialization: ["International", "Europe", "Visa Assistance"],
    experience: "12 years",
    location: "Delhi",
    planningFee: 1999,
    tripsPlanned: 780,
    description: "International travel expert with extensive European tour planning experience."
  }
];

export default function TravelAgents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const handleConnect = (agent: TravelAgent) => {
    setSelectedAgent(agent.id);
    toast({
      title: "Connection Request Sent!",
      description: `${agent.name} will contact you shortly to plan your perfect trip.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-4xl font-bold mb-2">Connect with Travel Agents</h1>
          <p className="text-muted-foreground text-lg">
            Let expert agents plan your perfect trip based on your interests and budget
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {travelAgents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {agent.name}
                      {selectedAgent === agent.id && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{agent.rating}</span>
                      <span className="text-muted-foreground text-sm">({agent.reviews})</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription>{agent.description}</CardDescription>
                
                <div className="flex flex-wrap gap-2">
                  {agent.specialization.map((spec) => (
                    <Badge key={spec} variant="secondary">{spec}</Badge>
                  ))}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{agent.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{agent.tripsPlanned}+ trips planned</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">₹{agent.planningFee}</span>
                    <span className="text-muted-foreground text-sm">planning fee</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleConnect(agent)}
                  disabled={selectedAgent === agent.id}
                >
                  {selectedAgent === agent.id ? "Request Sent" : "Connect & Plan Trip"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/local-guides")}
          >
            Or Connect with Local Guides Instead
          </Button>
        </div>
      </div>
    </div>
  );
}

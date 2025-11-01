import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, UserPlus, Users, X, Check } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  requester?: Profile;
  addressee?: Profile;
}

const Connections = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Connection[]>([]);
  const [pendingSent, setPendingSent] = useState<Connection[]>([]);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/login");
      return;
    }

    setCurrentUserId(session.user.id);
    await loadConnections(session.user.id);
    setLoading(false);
  };

  const loadConnections = async (userId: string) => {
    // Load accepted connections
    const { data: accepted, error: acceptedError } = await supabase
      .from("user_connections")
      .select("*")
      .eq("status", "accepted")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (!acceptedError && accepted) {
      // Manually fetch profiles for connections
      const userIds = [...new Set(accepted.flatMap(c => [c.requester_id, c.addressee_id]))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const connectionsWithProfiles = accepted.map(conn => ({
        ...conn,
        requester: profileMap.get(conn.requester_id),
        addressee: profileMap.get(conn.addressee_id)
      }));
      
      setConnections(connectionsWithProfiles as Connection[]);
    }

    // Load pending received requests
    const { data: received, error: receivedError } = await supabase
      .from("user_connections")
      .select("*")
      .eq("addressee_id", userId)
      .eq("status", "pending");

    if (!receivedError && received) {
      const userIds = received.map(r => r.requester_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const requestsWithProfiles = received.map(req => ({
        ...req,
        requester: profileMap.get(req.requester_id)
      }));
      
      setPendingReceived(requestsWithProfiles as Connection[]);
    }

    // Load pending sent requests
    const { data: sent, error: sentError } = await supabase
      .from("user_connections")
      .select("*")
      .eq("requester_id", userId)
      .eq("status", "pending");

    if (!sentError && sent) {
      const userIds = sent.map(s => s.addressee_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const requestsWithProfiles = sent.map(req => ({
        ...req,
        addressee: profileMap.get(req.addressee_id)
      }));
      
      setPendingSent(requestsWithProfiles as Connection[]);
    }
  };

  const acceptConnection = async (connectionId: string) => {
    const { error } = await supabase
      .from("user_connections")
      .update({ status: "accepted" })
      .eq("id", connectionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Connection Accepted",
      description: "You are now connected!"
    });

    loadConnections(currentUserId);
  };

  const rejectConnection = async (connectionId: string) => {
    const { error } = await supabase
      .from("user_connections")
      .delete()
      .eq("id", connectionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject connection",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Request Rejected",
      description: "Connection request declined"
    });

    loadConnections(currentUserId);
  };

  const cancelRequest = async (connectionId: string) => {
    const { error } = await supabase
      .from("user_connections")
      .delete()
      .eq("id", connectionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel request",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Request Cancelled",
      description: "Connection request cancelled"
    });

    loadConnections(currentUserId);
  };

  const removeConnection = async (connectionId: string) => {
    const { error } = await supabase
      .from("user_connections")
      .delete()
      .eq("id", connectionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove connection",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Connection Removed",
      description: "User has been removed from your connections"
    });

    loadConnections(currentUserId);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Connections</h1>
          <p className="text-muted-foreground">Manage your travel community</p>
        </div>

        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Connected ({connections.length})
            </TabsTrigger>
            <TabsTrigger value="received" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Requests ({pendingReceived.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Sent ({pendingSent.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="mt-6">
            {connections.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No connections yet. Start exploring and connect with other travelers!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {connections.map((connection) => {
                  const otherUser = connection.requester_id === currentUserId 
                    ? connection.addressee 
                    : connection.requester;

                  return (
                    <Card key={connection.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigate(`/profile/${otherUser?.id}`)}>
                            <AvatarImage src={otherUser?.avatar_url || undefined} />
                            <AvatarFallback>{getInitials(otherUser?.full_name || null)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold cursor-pointer hover:underline" onClick={() => navigate(`/profile/${otherUser?.id}`)}>
                              {otherUser?.full_name || "User"}
                            </h3>
                            <Badge variant="secondary" className="mt-1">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => navigate('/wanderlust', { state: { selectedUserId: otherUser?.id } })}
                          >
                            Message
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeConnection(connection.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="received" className="mt-6">
            {pendingReceived.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No pending connection requests
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingReceived.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigate(`/profile/${request.requester?.id}`)}>
                          <AvatarImage src={request.requester?.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(request.requester?.full_name || null)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold cursor-pointer hover:underline" onClick={() => navigate(`/profile/${request.requester?.id}`)}>
                            {request.requester?.full_name || "User"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Wants to connect with you
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptConnection(request.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectConnection(request.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-6">
            {pendingSent.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No pending sent requests
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingSent.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigate(`/profile/${request.addressee?.id}`)}>
                          <AvatarImage src={request.addressee?.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(request.addressee?.full_name || null)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold cursor-pointer hover:underline" onClick={() => navigate(`/profile/${request.addressee?.id}`)}>
                            {request.addressee?.full_name || "User"}
                          </h3>
                          <Badge variant="outline">Pending</Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelRequest(request.id)}
                      >
                        Cancel Request
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Connections;

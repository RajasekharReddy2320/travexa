import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";

const Messages = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/login");
      return;
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary animate-bounce" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Your Messages
            </CardTitle>
            <CardDescription>
              Connect with other travelers and trip planners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Your conversations will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Messages;
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardNav from "@/components/DashboardNav";
import { BookOpen, Plus, Edit } from "lucide-react";

const Knowledge = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Knowledge Base</h1>
            <p className="text-muted-foreground">Write and share your travel stories and tips</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-16 w-16 mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">Start Writing</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Share your travel knowledge, tips, and experiences
              </p>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Write Your First Article
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Knowledge;

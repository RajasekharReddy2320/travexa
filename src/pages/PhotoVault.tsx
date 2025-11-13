import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardNav from "@/components/DashboardNav";
import { Image, Upload, FolderPlus } from "lucide-react";

const PhotoVault = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Personal Photo Vault</h1>
          <p className="text-muted-foreground">Store and organize your travel memories</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Albums</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full mb-2">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Album
              </Button>
              <div className="space-y-2 mt-4">
                <p className="text-sm text-muted-foreground">No albums yet</p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>All Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16 text-muted-foreground">
                <Image className="h-20 w-20 mx-auto mb-4 opacity-50" />
                <p className="mb-4">Your photo vault is empty</p>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PhotoVault;

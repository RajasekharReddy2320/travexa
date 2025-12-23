import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardNav from "@/components/DashboardNav";

const PlannerV2 = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNav />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-foreground mb-6">Planner V2</h1>
              <p className="text-muted-foreground">Welcome to the new planner experience.</p>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PlannerV2;

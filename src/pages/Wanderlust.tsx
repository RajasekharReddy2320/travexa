import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardNav from "@/components/DashboardNav";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { PostCard } from "@/components/PostCard";
import { CreateTravelGroupDialog } from "@/components/CreateTravelGroupDialog";
import { TravelGroupCard } from "@/components/TravelGroupCard";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface TravelGroup {
  id: string;
  title: string;
  from_location: string;
  to_location: string;
  travel_date: string;
  travel_mode: string;
  max_members: number;
  description: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
  member_count: number;
}

const Wanderlust = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [travelGroups, setTravelGroups] = useState<TravelGroup[]>([]);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [userSaves, setUserSaves] = useState<Set<string>>(new Set());
  const [userGroupMemberships, setUserGroupMemberships] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/welcome");
      return;
    }

    setCurrentUserId(session.user.id);
    await Promise.all([loadPosts(), loadTravelGroups(), loadUserInteractions(session.user.id)]);
    setIsLoading(false);
  };

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        image_url,
        likes_count,
        comments_count,
        created_at,
        profiles:user_id (full_name, avatar_url)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading posts:", error);
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setPosts(data as any);
  };

  const loadTravelGroups = async () => {
    const { data, error } = await supabase
      .from("travel_groups")
      .select(`
        id,
        title,
        from_location,
        to_location,
        travel_date,
        travel_mode,
        max_members,
        description,
        profiles:creator_id (full_name, avatar_url)
      `)
      .gte("travel_date", new Date().toISOString().split("T")[0])
      .order("travel_date", { ascending: true });

    if (error) {
      console.error("Error loading travel groups:", error);
      return;
    }

    // Get member counts
    const groupsWithCounts = await Promise.all(
      (data || []).map(async (group) => {
        const { count } = await supabase
          .from("travel_group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", group.id)
          .eq("status", "accepted");

        return { ...group, member_count: count || 0 };
      })
    );

    setTravelGroups(groupsWithCounts as any);
  };

  const loadUserInteractions = async (userId: string) => {
    const [likesData, savesData, membershipsData] = await Promise.all([
      supabase.from("post_likes").select("post_id").eq("user_id", userId),
      supabase.from("post_saves").select("post_id").eq("user_id", userId),
      supabase.from("travel_group_members").select("group_id").eq("user_id", userId).eq("status", "accepted"),
    ]);

    if (likesData.data) setUserLikes(new Set(likesData.data.map(l => l.post_id)));
    if (savesData.data) setUserSaves(new Set(savesData.data.map(s => s.post_id)));
    if (membershipsData.data) setUserGroupMemberships(new Set(membershipsData.data.map(m => m.group_id)));
  };

  const handlePostUpdate = () => {
    if (currentUserId) {
      loadPosts();
      loadUserInteractions(currentUserId);
    }
  };

  const handleGroupUpdate = () => {
    if (currentUserId) {
      loadTravelGroups();
      loadUserInteractions(currentUserId);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;

    const postsChannel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => loadPosts()
      )
      .subscribe();

    const groupsChannel = supabase
      .channel("groups-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "travel_groups" },
        () => loadTravelGroups()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(groupsChannel);
    };
  }, [currentUserId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Wanderlust</h1>
          <div className="flex gap-2">
            <CreatePostDialog onPostCreated={handlePostUpdate} />
            <CreateTravelGroupDialog onGroupCreated={handleGroupUpdate} />
          </div>
        </div>

        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="groups">Travel Groups</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts yet. Be the first to share your travel story!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId!}
                  userLiked={userLikes.has(post.id)}
                  userSaved={userSaves.has(post.id)}
                  onUpdate={handlePostUpdate}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            {travelGroups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No travel groups yet. Create one to find travel companions!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {travelGroups.map((group) => (
                  <TravelGroupCard
                    key={group.id}
                    group={group}
                    currentUserId={currentUserId!}
                    isMember={userGroupMemberships.has(group.id)}
                    onUpdate={handleGroupUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            {posts.filter(p => userSaves.has(p.id)).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No saved posts yet. Save posts to see them here!</p>
              </div>
            ) : (
              posts
                .filter(p => userSaves.has(p.id))
                .map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId!}
                    userLiked={userLikes.has(post.id)}
                    userSaved={userSaves.has(post.id)}
                    onUpdate={handlePostUpdate}
                  />
                ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Wanderlust;
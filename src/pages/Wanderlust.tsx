import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DashboardNav from "@/components/DashboardNav";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { PostCard } from "@/components/PostCard";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const Wanderlust = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [userSaves, setUserSaves] = useState<Set<string>>(new Set());

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
    await Promise.all([loadPosts(), loadUserInteractions(session.user.id)]);
    setIsLoading(false);
  };

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
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

  const loadUserInteractions = async (userId: string) => {
    const [likesData, savesData] = await Promise.all([
      supabase.from("post_likes").select("post_id").eq("user_id", userId),
      supabase.from("post_saves").select("post_id").eq("user_id", userId),
    ]);

    if (likesData.data) setUserLikes(new Set(likesData.data.map((l: any) => l.post_id)));
    if (savesData.data) setUserSaves(new Set(savesData.data.map((s: any) => s.post_id)));
  };

  const handlePostUpdate = () => {
    if (currentUserId) {
      loadPosts();
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

    return () => {
      supabase.removeChannel(postsChannel);
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
          <CreatePostDialog onPostCreated={handlePostUpdate} />
        </div>

        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
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

          <TabsContent value="connections" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">View your connections in the Connections section</p>
              <Button className="mt-4" onClick={() => navigate("/connections")}>
                Go to Connections
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">View your messages in the Messages section</p>
              <Button className="mt-4" onClick={() => navigate("/messages")}>
                Go to Messages
              </Button>
            </div>
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
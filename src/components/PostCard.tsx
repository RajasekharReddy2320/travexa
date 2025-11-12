import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { CommentsSection } from "./CommentsSection";

interface PostCardProps {
  post: {
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
  };
  currentUserId: string;
  userLiked: boolean;
  userSaved: boolean;
  onUpdate: () => void;
}

export const PostCard = ({ post, currentUserId, userLiked, userSaved, onUpdate }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();

  const handleLike = async () => {
    try {
      if (userLiked) {
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId);
      } else {
        await supabase.from("post_likes").insert({
          post_id: post.id,
          user_id: currentUserId,
        });
      }
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      if (userSaved) {
        await supabase
          .from("post_saves")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId);
      } else {
        await supabase.from("post_saves").insert({
          post_id: post.id,
          user_id: currentUserId,
        });
      }
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast({ title: "Link copied to clipboard!" });
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);

      if (error) throw error;

      toast({ title: "Post deleted successfully" });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const isOwner = post.user_id === currentUserId;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <Avatar>
          <AvatarImage src={post.profiles.avatar_url || undefined} />
          <AvatarFallback>{getInitials(post.profiles.full_name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{post.profiles.full_name || "Unknown User"}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
        {isOwner && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Post</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this post? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="w-full rounded-lg object-cover max-h-96"
          />
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-3 border-t">
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${userLiked ? "fill-red-500 text-red-500" : ""}`} />
            {post.likes_count}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            {post.comments_count}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave}>
            <Bookmark className={`h-4 w-4 ${userSaved ? "fill-current" : ""}`} />
          </Button>
        </div>
        {showComments && (
          <CommentsSection
            postId={post.id}
            currentUserId={currentUserId}
            onCommentAdded={onUpdate}
          />
        )}
      </CardFooter>
    </Card>
  );
};
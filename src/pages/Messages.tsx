import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Search } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import { format } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Conversation {
  user: Profile;
  lastMessage: Message | null;
  unreadCount: number;
}

const Messages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (location.state?.userId && allUsers.length > 0) {
      const user = allUsers.find(u => u.id === location.state.userId);
      if (user) {
        setSelectedUser(user);
      }
    }
  }, [location.state, allUsers]);

  useEffect(() => {
    if (selectedUser) {
      loadMessages();
      markAsRead();
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!currentUserId) return;

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${currentUserId}`,
        },
        (payload) => {
          if (selectedUser && payload.new.sender_id === selectedUser.id) {
            setMessages(prev => [...prev, payload.new as Message]);
          }
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, selectedUser]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/login");
      return;
    }

    setCurrentUserId(session.user.id);
    await Promise.all([loadAllUsers(), loadConversations()]);
    setLoading(false);
  };

  const loadAllUsers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .neq("id", user.id);

    if (error) {
      console.error("Error loading users:", error);
      return;
    }

    setAllUsers(data || []);
  };

  const loadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all messages involving current user
    const { data: allMessages, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    // Get unique user IDs
    const userIds = new Set<string>();
    allMessages?.forEach(msg => {
      if (msg.sender_id !== user.id) userIds.add(msg.sender_id);
      if (msg.recipient_id !== user.id) userIds.add(msg.recipient_id);
    });

    // Load profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", Array.from(userIds));

    // Build conversations
    const convos: Conversation[] = [];
    profiles?.forEach(profile => {
      const userMessages = allMessages?.filter(
        msg => msg.sender_id === profile.id || msg.recipient_id === profile.id
      ) || [];

      const unreadCount = userMessages.filter(
        msg => msg.recipient_id === user.id && msg.sender_id === profile.id && !msg.read
      ).length;

      convos.push({
        user: profile,
        lastMessage: userMessages[0] || null,
        unreadCount,
      });
    });

    setConversations(convos);
  };

  const loadMessages = async () => {
    if (!selectedUser) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},recipient_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    setMessages(data || []);
  };

  const markAsRead = async () => {
    if (!selectedUser) return;

    await supabase
      .from("messages")
      .update({ read: true })
      .eq("recipient_id", currentUserId)
      .eq("sender_id", selectedUser.id)
      .eq("read", false);

    loadConversations();
  };

  const sendMessage = async () => {
    if (!selectedUser || !messageText.trim()) return;

    const { error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUserId,
        recipient_id: selectedUser.id,
        content: messageText.trim(),
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    setMessageText("");
    loadMessages();
    loadConversations();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const filteredUsers = allUsers.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <main className="container px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Conversations
              </CardTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {searchQuery ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 border-b ${
                        selectedUser?.id === user.id ? "bg-muted" : ""
                      }`}
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchQuery("");
                      }}
                    >
                      <Avatar>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.full_name || "User"}</p>
                        <p className="text-sm text-muted-foreground">Start a conversation</p>
                      </div>
                    </div>
                  ))
                ) : conversations.length > 0 ? (
                  conversations.map((convo) => (
                    <div
                      key={convo.user.id}
                      className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 border-b ${
                        selectedUser?.id === convo.user.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedUser(convo.user)}
                    >
                      <Avatar>
                        <AvatarImage src={convo.user.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(convo.user.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{convo.user.full_name || "User"}</p>
                          {convo.unreadCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {convo.unreadCount}
                            </span>
                          )}
                        </div>
                        {convo.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {convo.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 px-4">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">No conversations yet</p>
                    <p className="text-sm text-muted-foreground">Search for users to start chatting</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 flex flex-col">
            {selectedUser ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="cursor-pointer" onClick={() => navigate(`/profile/${selectedUser.id}`)}>
                      <AvatarImage src={selectedUser.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(selectedUser.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedUser.full_name || "User"}</CardTitle>
                      <CardDescription>Active now</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`mb-4 flex ${
                          msg.sender_id === currentUserId ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.sender_id === currentUserId
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {format(new Date(msg.created_at), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button onClick={sendMessage} disabled={!messageText.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground mb-2">Select a conversation</p>
                  <p className="text-sm text-muted-foreground">
                    Choose a user from the list to start messaging
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Messages;
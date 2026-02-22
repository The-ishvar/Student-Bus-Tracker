import { AppLayout } from "@/components/layout/app-layout";
import { useMessages, useSendMessage } from "@/hooks/use-messages";
import { useAuth } from "@/hooks/use-auth";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ShieldCheck, User as UserIcon } from "lucide-react";
import { format } from "date-fns";

export default function ChatPage() {
  const { user } = useAuth();
  const { data: messages, isLoading } = useMessages();
  const sendMessage = useSendMessage();
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    
    // For student, receiver is 0 (Admin). For admin, technically they should select a student, 
    // but in this demo, admin replies broadcast to all (receiver 0)
    await sendMessage.mutateAsync({
      senderId: user.id,
      receiverId: 0,
      content: content.trim()
    });
    setContent("");
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-12rem)] flex flex-col bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/30">
          <h2 className="text-xl font-bold font-display">
            {user?.role === 'admin' ? 'Student Queries / छात्रों के प्रश्न' : 'Help & Support / सहायता'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {user?.role === 'admin' ? 'Answer student questions below.' : 'Ask the admin any questions you have.'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          {isLoading ? (
            <div className="text-center text-muted-foreground mt-10">Loading messages...</div>
          ) : messages?.length === 0 ? (
            <div className="text-center text-muted-foreground mt-10">No messages yet. Say hi!</div>
          ) : (
            messages?.map((msg) => {
              const isMe = msg.senderId === user?.id;
              const isAdmin = msg.senderUsername === 'admin'; // Assumes admin username is 'admin' for UI coloring
              
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl p-4 ${
                    isMe 
                      ? 'bg-primary text-primary-foreground rounded-br-none' 
                      : isAdmin 
                        ? 'bg-secondary/10 border border-secondary/20 text-foreground rounded-bl-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                  }`}>
                    {!isMe && (
                      <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold opacity-80">
                        {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                        <span className="capitalize">{msg.senderUsername}</span>
                      </div>
                    )}
                    <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                    <span className="text-[10px] opacity-70 block mt-2 text-right">
                      {msg.timestamp ? format(new Date(msg.timestamp), 'p') : ''}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-border/50 bg-background">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message... / अपना संदेश लिखें..."
              className="flex-1 h-12 rounded-xl border-border/60 bg-muted/30 focus-visible:ring-primary/20"
            />
            <Button 
              type="submit" 
              disabled={!content.trim() || sendMessage.isPending}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover-elevate shadow-md"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Bus, Ticket, MessageSquare, Video, LogOut, 
  Settings, Mic, Menu, User, Sparkles
} from "lucide-react";
import { 
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, 
  SidebarGroupContent, SidebarGroupLabel, SidebarMenu, 
  SidebarMenuButton, SidebarMenuItem, SidebarTrigger
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);

  const isAdmin = user?.role === 'admin';

  const navItems = isAdmin ? [
    { title: "Dashboard / डैशबोर्ड", url: "/", icon: Settings },
    { title: "Manage Buses / बसें प्रबंधित करें", url: "/admin/buses", icon: Bus },
    { title: "All Bookings / सभी बुकिंग", url: "/admin/bookings", icon: Ticket },
    { title: "Citizen Chat / चैट", url: "/chat", icon: MessageSquare },
  ] : [
    { title: "Find Buses / बसें खोजें", url: "/", icon: Bus },
    { title: "My Bookings / मेरी बुकिंग", url: "/my-bookings", icon: Ticket },
    { title: "Chat with Admin / एडमिन से चैट", url: "/chat", icon: MessageSquare },
  ];

  const handleVoiceSearch = () => {
    setIsListening(true);
    toast({
      title: "Listening... / सुन रहा है...",
      description: "Speak your destination (e.g., 'Buses to Delhi')",
      icon: <Sparkles className="w-5 h-5 text-primary animate-pulse" />,
    });
    
    setTimeout(() => {
      setIsListening(false);
      toast({
        title: "Search Complete / खोज पूरी हुई",
        description: "Showing results based on voice input.",
      });
    }, 3000);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background/50">
        <Sidebar variant="inset" className="border-r border-border/50 bg-card/50 backdrop-blur-xl">
          <SidebarContent>
            <div className="p-6 pb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 text-white">
                <Bus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">Yatra<span className="text-foreground">Sathi</span></h2>
                <p className="text-xs text-muted-foreground font-medium">Rural Transit</p>
              </div>
            </div>
            
            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-bold px-4 mb-2">
                Menu / मेन्यू
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location === item.url}
                        className="my-1 rounded-xl transition-all duration-200"
                      >
                        <Link href={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4">
              {user ? (
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground capitalize">{user.username}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="w-full rounded-xl hover-elevate shadow-md shadow-destructive/20" 
                    onClick={() => logout()}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout / लॉग आउट
                  </Button>
                </div>
              ) : (
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                  <p className="text-sm text-muted-foreground mb-4 text-center">Login to book seats & more</p>
                  <Link href="/login">
                    <Button className="w-full rounded-xl hover-elevate shadow-md shadow-primary/20">
                      Login / लॉगिन
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="h-16 px-4 md:px-8 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-lg md:text-xl font-bold font-display text-foreground hidden sm:block">
                {navItems.find(i => i.url === location)?.title || "Dashboard"}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant={isListening ? "default" : "secondary"} 
                size="sm" 
                className={`rounded-full px-4 font-semibold shadow-sm hover-elevate transition-all duration-300 ${isListening ? 'animate-pulse shadow-primary/30' : ''}`}
                onClick={handleVoiceSearch}
              >
                <Mic className={`w-4 h-4 mr-2 ${isListening ? 'animate-bounce' : ''}`} />
                <span className="hidden sm:inline">Voice Search / वॉयस सर्च</span>
                <span className="sm:hidden">Voice</span>
              </Button>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-background/90 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bus, ShieldCheck, UserCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
      toast({ title: "Login Successful / लॉगिन सफल" });
    } catch (error: any) {
      toast({ 
        title: "Login Failed / लॉगिन विफल", 
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fillDemo = (role: 'citizen' | 'admin') => {
    setUsername(role);
    setPassword("password");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left side - Hero image/branding */}
      <div className="md:w-1/2 bg-primary p-8 md:p-12 flex flex-col justify-between relative overflow-hidden text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-900 z-0"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-xl">
            <Bus size={28} />
          </div>
          <span className="text-2xl font-bold font-display tracking-tight">YatraSathi</span>
        </div>

        <div className="relative z-10 my-16 md:my-0">
          <h1 className="text-4xl md:text-6xl font-extrabold font-display leading-tight mb-6">
            Smart Transit<br/>for Rural India.
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-md font-medium">
            गाँव और छोटे शहर के नागरिकों और यूज़र्स को बस की सही जानकारी और सीट booking में मदद।
          </p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><SparkleIcon /></div>
              <span>AI Bus Late Prediction / बस देरी का अनुमान</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><SparkleIcon /></div>
              <span>Seat Availability AI / सीट उपलब्धता</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm font-medium text-primary-foreground/60">
          © 2024 YatraSathi Demo Project
        </div>
      </div>

      {/* Right side - Form */}
      <div className="md:w-1/2 p-8 md:p-12 flex items-center justify-center bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground font-display mb-2">Welcome Back / स्वागत है</h2>
            <p className="text-muted-foreground">Please sign in to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username / यूज़रनेम</Label>
              <Input 
                id="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 rounded-xl border-border/60 bg-muted/30 px-4 focus-visible:ring-primary/20"
                placeholder="Enter username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password / पासवर्ड</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-border/60 bg-muted/30 px-4 focus-visible:ring-primary/20"
                placeholder="Enter password"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-bold text-base bg-gradient-to-r from-primary to-primary/90 hover-elevate shadow-lg shadow-primary/25 group"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Logging in..." : "Login / लॉगिन"}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground font-semibold">Demo Accounts</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button 
                variant="outline" 
                className="h-14 rounded-xl flex flex-col gap-1 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => fillDemo('citizen')}
                type="button"
              >
                <div className="flex items-center gap-2"><UserCircle className="w-4 h-4"/> Citizen / User</div>
                <span className="text-[10px] text-muted-foreground font-normal">citizen / password</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-14 rounded-xl flex flex-col gap-1 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => fillDemo('admin')}
                type="button"
              >
                <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Admin</div>
                <span className="text-[10px] text-muted-foreground font-normal">admin / password</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SparkleIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
}

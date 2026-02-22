import { useAuth } from "@/hooks/use-auth";
import { useBuses } from "@/hooks/use-buses";
import { useCreateBooking } from "@/hooks/use-bookings";
import { AppLayout } from "@/components/layout/app-layout";
import { BusCard } from "@/components/ui/bus-card";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { z } from "zod";
import { api } from "@shared/routes";

type BusType = z.infer<typeof api.buses.list.responses[200]>[0];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: buses, isLoading } = useBuses();
  const { mutateAsync: createBooking, isPending } = useCreateBooking();
  const { toast } = useToast();

  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);
  const [seatNumber, setSeatNumber] = useState("");

  const handleBook = async () => {
    if (!selectedBus || !seatNumber || !user) return;
    
    try {
      await createBooking({
        userId: user.id,
        busId: selectedBus.id,
        seatNumber: parseInt(seatNumber)
      });
      toast({ title: "Booking Successful! / बुकिंग सफल" });
      setSelectedBus(null);
      setSeatNumber("");
    } catch (error: any) {
      toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">Available Buses / उपलब्ध बसें</h1>
        <p className="text-muted-foreground">Find and book your next journey easily.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-card animate-pulse rounded-2xl border border-border/50"></div>
          ))}
        </div>
      ) : buses?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
          <p className="text-muted-foreground">No buses available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buses?.map(bus => (
            <BusCard 
              key={bus.id} 
              bus={bus} 
              onBook={user?.role === 'student' ? setSelectedBus : undefined} 
            />
          ))}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={!!selectedBus} onOpenChange={(open) => !open && setSelectedBus(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Book Seat / सीट बुक करें</DialogTitle>
            <DialogDescription>
              Select a seat number for {selectedBus?.name} ({selectedBus?.source} to {selectedBus?.destination}).
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex justify-between items-center">
              <span className="font-semibold text-foreground">Ticket Price:</span>
              <span className="text-2xl font-bold text-primary">₹{selectedBus?.ticketPrice}</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Seat Number (1-{selectedBus?.totalSeats})</label>
              <Input 
                type="number" 
                min="1" 
                max={selectedBus?.totalSeats} 
                value={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value)}
                placeholder="Enter seat number"
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBus(null)} className="rounded-xl">Cancel</Button>
            <Button 
              onClick={handleBook} 
              disabled={isPending || !seatNumber}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80"
            >
              {isPending ? "Processing..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

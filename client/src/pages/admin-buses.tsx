import { AppLayout } from "@/components/layout/app-layout";
import { useBuses, useCreateBus, useUpdateBus, useDeleteBus } from "@/hooks/use-buses";
import { BusCard } from "@/components/ui/bus-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import type { z } from "zod";
import { api } from "@shared/routes";

type BusInput = z.infer<typeof api.buses.create.input>;
type BusType = z.infer<typeof api.buses.list.responses[200]>[0];

export default function AdminBuses() {
  const { data: buses, isLoading } = useBuses();
  const createBus = useCreateBus();
  const updateBus = useUpdateBus();
  const deleteBus = useDeleteBus();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<BusType | null>(null);
  
  const [formData, setFormData] = useState<BusInput>({
    name: "", source: "", destination: "", 
    departureTime: "", arrivalTime: "", 
    totalSeats: 40, ticketPrice: 100
  });

  useEffect(() => {
    if (editingBus) {
      setFormData({
        name: editingBus.name,
        source: editingBus.source,
        destination: editingBus.destination,
        departureTime: editingBus.departureTime,
        arrivalTime: editingBus.arrivalTime,
        totalSeats: editingBus.totalSeats,
        ticketPrice: editingBus.ticketPrice
      });
    } else {
      setFormData({
        name: "", source: "", destination: "", 
        departureTime: "", arrivalTime: "", 
        totalSeats: 40, ticketPrice: 100
      });
    }
  }, [editingBus, isDialogOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Coerce numeric fields
    const dataToSubmit = {
      ...formData,
      totalSeats: Number(formData.totalSeats),
      ticketPrice: Number(formData.ticketPrice)
    };

    if (editingBus) {
      await updateBus.mutateAsync({ id: editingBus.id, ...dataToSubmit });
    } else {
      await createBus.mutateAsync(dataToSubmit);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (bus: BusType) => {
    if(confirm(`Are you sure you want to delete ${bus.name}?`)) {
      await deleteBus.mutateAsync(bus.id);
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Manage Buses / बसें प्रबंधित करें</h1>
          <p className="text-muted-foreground">Add, edit, or delete bus routes and timings.</p>
        </div>
        <Button 
          className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover-elevate shadow-lg shadow-primary/25"
          onClick={() => { setEditingBus(null); setIsDialogOpen(true); }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Bus
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buses?.map(bus => (
          <BusCard 
            key={bus.id} 
            bus={bus} 
            isAdmin={true}
            onEdit={(b) => { setEditingBus(b); setIsDialogOpen(true); }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingBus ? "Edit Bus" : "Add New Bus"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Bus Name / बस का नाम</Label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl h-11"/>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source / कहाँ से</Label>
                <Input required value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="rounded-xl h-11"/>
              </div>
              <div className="space-y-2">
                <Label>Destination / कहाँ तक</Label>
                <Input required value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="rounded-xl h-11"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Departure Time / प्रस्थान का समय</Label>
                <Input required type="time" value={formData.departureTime} onChange={e => setFormData({...formData, departureTime: e.target.value})} className="rounded-xl h-11"/>
              </div>
              <div className="space-y-2">
                <Label>Arrival Time / पहुँचने का समय</Label>
                <Input required type="time" value={formData.arrivalTime} onChange={e => setFormData({...formData, arrivalTime: e.target.value})} className="rounded-xl h-11"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Seats / कुल सीटें</Label>
                <Input required type="number" min="1" value={formData.totalSeats} onChange={e => setFormData({...formData, totalSeats: Number(e.target.value)})} className="rounded-xl h-11"/>
              </div>
              <div className="space-y-2">
                <Label>Ticket Price (₹) / टिकट मूल्य</Label>
                <Input required type="number" min="0" value={formData.ticketPrice} onChange={e => setFormData({...formData, ticketPrice: Number(e.target.value)})} className="rounded-xl h-11"/>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={createBus.isPending || updateBus.isPending} className="rounded-xl">
                {editingBus ? "Update Bus" : "Save Bus"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

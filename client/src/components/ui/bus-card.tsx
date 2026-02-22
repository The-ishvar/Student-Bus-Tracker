import { Bus, Clock, MapPin, IndianRupee, Sparkles } from "lucide-react";
import { Button } from "./button";
import type { z } from "zod";
import { api } from "@shared/routes";

type BusType = z.infer<typeof api.buses.list.responses[200]>[0];

// Simulated AI Utility
function getAIPredictions(busId: number) {
  const seed = busId * 12345;
  const isLate = seed % 3 === 0;
  const lateText = isLate ? "10 mins late / 10 मिनट लेट" : "On Time / समय पर";
  const lateColor = isLate ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";

  const isFillingFast = seed % 2 === 0;
  const seatText = isFillingFast ? "Filling Fast / तेजी से भर रहा है" : "Available / उपलब्ध";
  const seatColor = isFillingFast ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-primary/10 text-primary border-primary/20";

  return { lateText, lateColor, seatText, seatColor };
}

interface BusCardProps {
  bus: BusType;
  onBook?: (bus: BusType) => void;
  isAdmin?: boolean;
  onEdit?: (bus: BusType) => void;
  onDelete?: (bus: BusType) => void;
}

export function BusCard({ bus, onBook, isAdmin, onEdit, onDelete }: BusCardProps) {
  const ai = getAIPredictions(bus.id);

  return (
    <div className="bg-card rounded-2xl p-5 shadow-lg shadow-black/5 border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bus className="text-primary w-5 h-5" />
            {bus.name}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground mt-1 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>{bus.source} → {bus.destination}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary flex items-center justify-end">
            <IndianRupee className="w-5 h-5" />
            {bus.ticketPrice}
          </div>
          <span className="text-xs text-muted-foreground">per seat / प्रति सीट</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 p-4 rounded-xl bg-muted/50">
        <div>
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Departure</p>
          <p className="font-semibold">{bus.departureTime}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Arrival</p>
          <p className="font-semibold">{bus.arrivalTime}</p>
        </div>
      </div>

      {/* AI Predictions Section */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          AI Predictions
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${ai.lateColor}`}>
            {ai.lateText}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${ai.seatColor}`}>
            {ai.seatText}
          </span>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border/50 flex gap-2">
        {!isAdmin && onBook && (
          <Button 
            className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 hover-elevate shadow-md shadow-primary/25"
            onClick={() => onBook(bus)}
          >
            Book Seat / सीट बुक करें
          </Button>
        )}
        
        {isAdmin && (
          <>
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onEdit?.(bus)}>
              Edit
            </Button>
            <Button variant="destructive" className="flex-1 rounded-xl" onClick={() => onDelete?.(bus)}>
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

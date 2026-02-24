import { AppLayout } from "@/components/layout/app-layout";
import { useMyBookings } from "@/hooks/use-bookings";
import { format } from "date-fns";
import { Ticket, MapPin, Clock, CheckCircle2 } from "lucide-react";

export default function CitizenBookings() {
  const { data: bookings, isLoading } = useMyBookings();

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">My Bookings / मेरी बुकिंग</h1>
        <p className="text-muted-foreground">View your upcoming journeys and digital tickets.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2].map(i => <div key={i} className="h-48 bg-card animate-pulse rounded-2xl border border-border/50"></div>)}
        </div>
      ) : bookings?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
          <Ticket className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">No bookings yet.</p>
          <p className="text-muted-foreground">Go to the Dashboard to book a bus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings?.map((booking) => (
            <div key={booking.id} className="bg-card rounded-2xl p-0 shadow-lg shadow-black/5 border border-border/50 overflow-hidden flex flex-col sm:flex-row relative">
              
              {/* Ticket stub decoration */}
              <div className="hidden sm:block absolute left-[140px] top-0 bottom-0 w-px border-l-2 border-dashed border-border/60"></div>
              
              <div className="bg-primary/5 p-6 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-border/50 sm:w-[140px] shrink-0">
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Seat No.</div>
                <div className="text-5xl font-black font-display text-foreground">{booking.seatNumber}</div>
              </div>
              
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-foreground">{booking.bus.name}</h3>
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">{booking.bus.source} <span className="mx-2">→</span> {booking.bus.destination}</span>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground text-xs block">Departure</span>
                        <span className="font-semibold">{booking.bus.departureTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground text-xs block">Arrival</span>
                        <span className="font-semibold">{booking.bus.arrivalTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                  <span>Booked on: {booking.bookingDate ? format(new Date(booking.bookingDate), 'MMM d, yyyy') : 'N/A'}</span>
                  <span className="font-mono">ID: #{booking.id.toString().padStart(6, '0')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

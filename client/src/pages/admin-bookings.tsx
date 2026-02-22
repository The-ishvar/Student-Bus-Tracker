import { AppLayout } from "@/components/layout/app-layout";
import { useAllBookings } from "@/hooks/use-bookings";
import { format } from "date-fns";
import { Ticket, User, MapPin, Calendar, Hash } from "lucide-react";

export default function AdminBookings() {
  const { data: bookings, isLoading } = useAllBookings();

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">All Bookings / सभी बुकिंग</h1>
        <p className="text-muted-foreground">Monitor all student reservations across all buses.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-card animate-pulse rounded-2xl border border-border/50"></div>)}
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Passenger</th>
                  <th className="px-6 py-4">Bus Details</th>
                  <th className="px-6 py-4">Seat No.</th>
                  <th className="px-6 py-4 rounded-tr-2xl">Booking Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {bookings?.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-semibold capitalize">{booking.user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground mb-1">{booking.bus.name}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {booking.bus.source} → {booking.bus.destination}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary/10 text-secondary-foreground font-bold border border-secondary/20">
                        <Hash className="w-3 h-3" />
                        {booking.seatNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {booking.bookingDate ? format(new Date(booking.bookingDate), 'PP p') : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
                {bookings?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

import { AppLayout } from "@/components/layout/app-layout";
import { useVideos, useCreateVideo } from "@/hooks/use-videos";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { PlayCircle, Plus, Video as VideoIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VideosPage() {
  const { user } = useAuth();
  const { data: videos, isLoading } = useVideos();
  const createVideo = useCreateVideo();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createVideo.mutateAsync({ title, url });
    setIsDialogOpen(false);
    setTitle("");
    setUrl("");
  };

  // Convert youtube watch URL to embed URL for iframe
  const getEmbedUrl = (rawUrl: string) => {
    try {
      const urlObj = new URL(rawUrl);
      if (urlObj.hostname.includes('youtube.com')) {
        const v = urlObj.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
      }
      if (urlObj.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed${urlObj.pathname}`;
      }
      return rawUrl;
    } catch {
      return rawUrl;
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Live Classes / लाइव क्लास</h1>
          <p className="text-muted-foreground">Watch educational content uploaded by teachers.</p>
        </div>
        {user?.role === 'admin' && (
          <Button 
            className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover-elevate shadow-lg"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Upload Video
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2].map(i => <div key={i} className="aspect-video bg-card animate-pulse rounded-2xl border border-border/50"></div>)}
        </div>
      ) : videos?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
          <VideoIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">No videos available.</p>
          <p className="text-muted-foreground">Check back later for new classes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {videos?.map(video => (
            <div key={video.id} className="bg-card rounded-2xl overflow-hidden shadow-lg shadow-black/5 border border-border/50 group">
              <div className="aspect-video relative bg-muted flex items-center justify-center overflow-hidden">
                {video.url.includes('youtu') ? (
                  <iframe 
                    src={getEmbedUrl(video.url)} 
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="text-center p-6 text-muted-foreground">
                    <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Video link provided</p>
                    <a href={video.url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs block mt-2">Open externally</a>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground line-clamp-1 mb-2">{video.title}</h3>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>Uploaded: {video.uploadedAt ? format(new Date(video.uploadedAt), 'MMM d, yyyy') : 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Upload Video / वीडियो अपलोड करें</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Video Title / वीडियो का शीर्षक</Label>
              <Input required value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl h-11" placeholder="e.g. History Lesson 1"/>
            </div>
            
            <div className="space-y-2">
              <Label>YouTube URL / यूट्यूब लिंक</Label>
              <Input required type="url" value={url} onChange={e => setUrl(e.target.value)} className="rounded-xl h-11" placeholder="https://youtube.com/..."/>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={createVideo.isPending} className="rounded-xl bg-gradient-to-r from-primary to-primary/80">
                {createVideo.isPending ? "Uploading..." : "Save Video"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  category: string;
  description: string;
  durationLabel: string;
}

// Vídeo de exemplo (CC0) usado apenas para simular o player no MVP.
const PLACEHOLDER_VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export function VideoModal({
  open,
  onOpenChange,
  title,
  category,
  description,
  durationLabel,
}: VideoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary">{category}</Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {durationLabel}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-lg overflow-hidden border bg-black">
            <video
              key={title}
              controls
              className="w-full aspect-video"
              src={PLACEHOLDER_VIDEO_URL}
            >
              Seu navegador não suporta vídeo em HTML5.
            </video>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Vídeo demonstrativo — conteúdo final será substituído pelo tutorial oficial.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
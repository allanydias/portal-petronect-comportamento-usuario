import { useState } from "react";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EventName } from "@/schemas/event";
import { VideoModal } from "./VideoModal";

interface VideoTutorialCardProps {
  title: string;
  category: string;
  description: string;
  durationLabel: string;
  interest: string;
  itemId: string;
  onTrack: (args: {
    eventName: EventName;
    section?: string;
    itemId?: string;
    interest?: string;
  }) => unknown;
}

export function VideoTutorialCard({
  title,
  category,
  description,
  durationLabel,
  interest,
  itemId,
  onTrack,
}: VideoTutorialCardProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    void onTrack({
      eventName: "video_start",
      section: category,
      itemId,
      interest,
    });
    setOpen(true);
  };

  return (
    <>
      <Card className="flex flex-col justify-between p-4">
        <div>
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{category}</Badge>
              <span>{durationLabel}</span>
            </div>
            <CardTitle className="text-lg mt-2">{title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 py-2">
            <p className="text-sm text-muted-foreground">{description}</p>
          </CardContent>
        </div>
        <div className="pt-4">
          <Button variant="outline" className="w-full gap-2" onClick={handleOpen}>
            <PlayCircle className="h-4 w-4" />
            Assistir vídeo
          </Button>
        </div>
      </Card>

      <VideoModal
        open={open}
        onOpenChange={setOpen}
        title={title}
        category={category}
        description={description}
        durationLabel={durationLabel}
      />
    </>
  );
}
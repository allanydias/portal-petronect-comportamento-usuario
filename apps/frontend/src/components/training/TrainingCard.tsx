import { PlayCircle, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EventName } from "@/schemas/event";

type Props = {
  title: string;
  description: string;
  category: string;
  buttonLabel: string;
  eventName: EventName;
  interest: string;
  itemId: string;
  onTrack: (data: {
    eventName: EventName;
    section: string;
    itemId: string;
    interest: string;
  }) => Promise<unknown>;
};

export function TrainingCard({
  title,
  description,
  category,
  buttonLabel,
  eventName,
  interest,
  itemId,
  onTrack
}: Props) {
  const Icon = eventName === "video_start" ? PlayCircle : BookOpen;

  return (
    <Card className="h-full">
      <CardHeader>
        <Badge className="w-fit">{category}</Badge>
        <CardTitle className="pt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="min-h-12 text-sm text-slate-500">{description}</p>
        <Button
          className="mt-4 w-full"
          variant="outline"
          onClick={() =>
            void onTrack({
              eventName,
              section: interest,
              itemId,
              interest
            })
          }
        >
          <Icon className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

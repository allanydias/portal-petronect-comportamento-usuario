import { Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EventName } from "@/schemas/event";

type Props = {
  title: string;
  description: string;
  category: string;
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

export function ToolCard(props: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <Badge className="w-fit">{props.category}</Badge>
        <CardTitle className="pt-2">{props.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="min-h-12 text-sm text-slate-500">{props.description}</p>
        <Button
          className="mt-4 w-full"
          variant="outline"
          onClick={() =>
            void props.onTrack({
              eventName: props.eventName,
              section: props.interest,
              itemId: props.itemId,
              interest: props.interest
            })
          }
        >
          <Wrench className="mr-2 h-4 w-4" />
          Acessar
        </Button>
      </CardContent>
    </Card>
  );
}

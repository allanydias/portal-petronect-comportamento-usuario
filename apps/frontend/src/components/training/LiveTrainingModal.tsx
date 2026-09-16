import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, CalendarClock } from "lucide-react";

interface LiveTrainingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  dateLabel: string;
  description: string;
}

export function LiveTrainingModal({
  open,
  onOpenChange,
  title,
  dateLabel,
  description,
}: LiveTrainingModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setConfirmed(false);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-start gap-2 rounded-lg border p-3 text-sm">
            <CalendarClock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span>{dateLabel}</span>
          </div>

          {confirmed ? (
            <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-green-800 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Inscrição confirmada!</p>
                <p className="text-xs mt-0.5">
                  Você receberá um lembrete por e-mail antes do início da sessão.
                </p>
              </div>
            </div>
          ) : (
            <Button className="w-full" onClick={() => setConfirmed(true)}>
              Confirmar inscrição
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
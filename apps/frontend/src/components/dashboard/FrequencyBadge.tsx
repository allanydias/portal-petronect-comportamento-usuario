import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function FrequencyBadge({ value }: { value: string }) {
  return (
    <Badge
      className={cn(
        value === "Alta" && "bg-emerald-100 text-emerald-700",
        value === "Média" && "bg-amber-100 text-amber-700",
        value === "Baixa" && "bg-slate-100 text-slate-700",
        value === "Inativo" && "bg-red-100 text-red-700"
      )}
    >
      {value}
    </Badge>
  );
}

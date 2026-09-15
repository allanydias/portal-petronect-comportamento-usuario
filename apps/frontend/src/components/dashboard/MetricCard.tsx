import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({
  label,
  value
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm text-slate-500">{label}</div>
        <div className="mt-2 text-3xl font-black tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

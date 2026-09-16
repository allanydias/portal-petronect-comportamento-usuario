import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

interface GuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  category: string;
  description: string;
}

export function GuideModal({ open, onOpenChange, title, category, description }: GuideModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary">{category}</Badge>
            <span className="text-xs text-muted-foreground font-mono">Guia Petronect / Petrobras</span>
          </div>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Alerta de Elegibilidade e Regras */}
          <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3 text-amber-900 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs uppercase tracking-wide">Atenção às Regras e Elegibilidade</p>
              <p className="text-xs mt-0.5">
                Certifique-se de utilizar canais habilitados e validar se as certidões e CNPJ constam sem pendências documentais antes de submeter propostas.
              </p>
            </div>
          </div>

          {/* Passo a Passo Simulado */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Passo a Passo no Portal de Compras</h4>
            
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </div>
              <div>
                <p className="font-medium">Identificação e Acesso</p>
                <p className="text-xs text-muted-foreground">
                  Acesse com CNPJ e credenciais ativas. Caso seja o primeiro acesso, confirme o vínculo e ative a chave no canal de fornecedores.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </div>
              <div>
                <p className="font-medium">Consulta de Oportunidades & Famílias</p>
                <p className="text-xs text-muted-foreground">
                  Navegue até o menu de licitações públicas (Lei nº 13.303/16) e filtre pelo catálogo de serviços da sua linha de fornecimento.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </div>
              <div>
                <p className="font-medium">Submissão de Proposta e Telemetria</p>
                <p className="text-xs text-muted-foreground">
                  Preencha a proposta comercial no sistema de cotação e anexe a documentação técnica exigida no edital.
                </p>
              </div>
            </div>
          </div>

          {/* Acesso Externo */}
          <div className="pt-2 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              Portal Oficial de Compras da Petrobras (Petronect)
            </span>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 w-full sm:w-auto"
              onClick={() => window.open("https://www.petronect.com.br", "_blank", "noopener,noreferrer")}
            >
              Acessar Petronect Oficial
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";


const proposalSchema = z.object({
    value: z.coerce.number().positive("O valor deve ser positivo."),
    deadline: z.string().min(1, "Selecione um prazo."),
    conditions: z.string().optional(),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

interface ProposalModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProposalModal({ isOpen, onOpenChange }: ProposalModalProps) {
    const form = useForm<ProposalFormValues>({
        resolver: zodResolver(proposalSchema),
    });

    const onSubmit = (data: ProposalFormValues) => {
        console.log("Proposal submitted:", data);
        onOpenChange(false);
    }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar Proposta Formal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Valor (R$)</Label>
                            <FormControl>
                                <Input type="number" placeholder="Ex: 2500.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                        <FormItem>
                             <Label>Prazo de Entrega</Label>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o prazo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="3d">Em até 3 dias</SelectItem>
                                    <SelectItem value="1w">1 semana</SelectItem>
                                    <SelectItem value="2w">2 semanas</SelectItem>
                                    <SelectItem value="other">Outro (a combinar)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="conditions"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Condições Especiais</Label>
                            <FormControl>
                                <Textarea placeholder="Garantia, condições de pagamento, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Enviar Proposta</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

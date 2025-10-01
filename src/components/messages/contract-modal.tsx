import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, X } from "lucide-react";

interface ContractModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContractModal({ isOpen, onOpenChange }: ContractModalProps) {
    
  const handlePrint = () => {
    const printContent = document.getElementById("contractContent")?.innerHTML;
    if (printContent) {
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // To re-attach event listeners
    }
  };

  const contractNumber = '001/2023';
  const clientName = "Roger Ruviaro";
  const providerName = "Tech Solutions";
  const serviceDescription = "O CONTRATADO se obriga a fornecer notebook Dell Inspiron 15 5000 com i5, 8GB RAM, SSD 256GB e placa MX150, conforme acordo entre as partes.";
  const contractValue = 2500.00;
  const contractValueText = "dois mil e quinhentos reais";
  const paymentTerms = `
    <p>- 50% no ato da assinatura (R$ 1.250,00)</p>
    <p>- 50% na entrega do produto (R$ 1.250,00)</p>
  `;
  const deliveryTime = "3 dias úteis";
  const warranty = "3 meses";
  const legalJurisdiction = "Santa Maria/RS";
  const contractDate = new Date().toLocaleDateString('pt-BR');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gerar Contrato</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6" id="contractContent">
            <h2 className="text-center text-xl font-bold mb-6">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>
            
            <p className="text-sm text-gray-500 mb-6">Nº {contractNumber}</p>
            
            <p>Pelo presente instrumento particular, as partes abaixo qualificadas celebram o presente Contrato de Prestação de Serviços, que se regerá pelas seguintes cláusulas:</p>
            
            <h3 className="font-bold mt-6 mb-2">CLÁUSULA PRIMEIRA - DAS PARTES</h3>
            <p><strong>CONTRATANTE:</strong> {clientName}</p>
            <p><strong>CONTRATADO:</strong> {providerName}</p>
            
            <h3 className="font-bold mt-6 mb-2">CLÁUSULA SEGUNDA - DO OBJETO</h3>
            <p>{serviceDescription}</p>
            
            <h3 className="font-bold mt-6 mb-2">CLÁUSULA TERCEIRA - DO VALOR E FORMA DE PAGAMENTO</h3>
            <p>O valor total do serviço será de R$ {contractValue.toFixed(2)} ({contractValueText}), a ser pago da seguinte forma:</p>
            <div dangerouslySetInnerHTML={{ __html: paymentTerms }} />
            
            <h3 className="font-bold mt-6 mb-2">CLÁUSULA QUARTA - DO PRAZO</h3>
            <p>O prazo para entrega será de {deliveryTime} a contar da assinatura deste contrato.</p>
            
            <h3 className="font-bold mt-6 mb-2">CLÁUSULA QUINTA - DAS OBRIGAÇÕES</h3>
            <p>1. O CONTRATADO obriga-se a fornecer o produto nas condições acordadas;</p>
            <p>2. O CONTRATANTE obriga-se a efetuar o pagamento conforme acordado;</p>
            <p>3. O produto terá garantia de {warranty} contra defeitos de fabricação.</p>
            
            <h3 className="font-bold mt-6 mb-2">CLÁUSULA SEXTA - DO FORO</h3>
            <p>Fica eleito o foro da Comarca de {legalJurisdiction} para dirimir quaisquer dúvidas oriundas deste contrato.</p>
            
            <div className="text-center mt-12">
                <p>E por estarem justos e contratados, assinam o presente contrato em 02 vias de igual teor.</p>
                
                <div className="flex justify-between mt-12">
                    <div className="text-center">
                        <p className="border-t border-black w-64 mx-auto pt-2 mt-16">{clientName}</p>
                        <p>CONTRATANTE</p>
                    </div>
                    
                    <div className="text-center">
                        <p className="border-t border-black w-64 mx-auto pt-2 mt-16">{providerName}</p>
                        <p>CONTRATADO</p>
                    </div>
                </div>
                
                <div className="text-center mt-6">
                    <p>{legalJurisdiction}, {contractDate}</p>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir Contrato
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Download className="mr-2 h-4 w-4" /> Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

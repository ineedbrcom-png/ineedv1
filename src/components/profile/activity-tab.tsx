
"use client";

import { TabsContent, Card, CardHeader, CardContent } from "@/components/ui/card";

export function ActivityTab() {
  return (
    <TabsContent value="activity" className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">
                Histórico de Pedidos
              </h2>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-40 text-muted-foreground">
                <p>Nenhum pedido concluído ainda.</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Depoimentos</h2>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-24 text-muted-foreground">
                <p>Nenhum depoimento recebido.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
}

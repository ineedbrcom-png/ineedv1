
"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";

export function SettingsTab() {
  return (
    <TabsContent value="settings" className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">
                Gerenciamento de Notificações
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    Notificações de novas ofertas
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas para seus pedidos
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Mensagens diretas</p>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações de novas mensagens
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Atualizações de pedidos</p>
                  <p className="text-sm text-muted-foreground">
                    Saiba quando o status dos pedidos mudar
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Segurança da Conta</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium mb-2">Alterar senha</p>
                <Button>Alterar senha</Button>
              </div>
              <div>
                <p className="font-medium mb-2">
                  Autenticação de dois fatores
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-medium">
                    Ativado
                  </span>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                  >
                    Desativar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Privacidade</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium mb-2">
                  Visibilidade do perfil
                </p>
                <Select defaultValue="public">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="connections">
                      Apenas conexões
                    </SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="font-medium mb-2">
                  Histórico de pedidos
                </p>
                <Select defaultValue="public">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="connections">
                      Apenas conexões
                    </SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Dados da Conta</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Baixar meus dados
              </Button>
              <Button variant="destructive" className="w-full">
                Excluir conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
}

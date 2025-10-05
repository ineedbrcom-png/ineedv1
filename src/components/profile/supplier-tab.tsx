
"use client";

import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { User as UserProfile } from "@/lib/data";
import { TabsContent } from "@/components/ui/tabs";

interface SupplierTabProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  isEditing: boolean;
  form: UseFormReturn<any>;
}

export function SupplierTab({
  profile,
  isOwnProfile,
  isEditing,
  form,
}: SupplierTabProps) {
  return (
    <TabsContent value="supplier" className="p-6">
      <h2 className="text-xl font-bold mb-4">
        O que {isOwnProfile ? "eu ofereço" : `${profile.displayName} oferece`}
      </h2>
      <div className="mb-6 space-y-2">
        <h3 className="font-medium">Habilidades / Categorias de Serviço</h3>
        {isEditing && isOwnProfile ? (
          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Ex: Design Gráfico, Edição de Vídeo"
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Separe as habilidades por vírgula.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 px-3 py-1 text-sm"
                >
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {isOwnProfile
                  ? "Você ainda não adicionou nenhuma habilidade. Edite seu perfil para adicioná-las."
                  : "Nenhuma habilidade informada."}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Portfólio</h3>
          {isOwnProfile && (
            <Button variant="link" className="text-primary p-0 h-auto">
              <Plus className="mr-1 h-4 w-4" /> Adicionar item
            </Button>
          )}
        </div>
        <Card className="flex items-center justify-center h-40 text-muted-foreground bg-muted/50 border-dashed">
          <p>Nenhum item no portfólio ainda.</p>
        </Card>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Preços</h3>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento.
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Área de Atendimento</h3>
          <div className="bg-muted border rounded-lg h-48 flex items-center justify-center text-muted-foreground">
            <p>Funcionalidade em desenvolvimento.</p>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}


"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { currentUser as mockCurrentUser } from "@/lib/data";
import { findImage } from "@/lib/placeholder-images";
import { StarRating } from "@/components/star-rating";
import {
  CheckCircle,
  MapPin,
  Calendar,
  ShieldCheck,
  Plus,
  Pencil,
  Loader2,
  X,
  Camera,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { useState, useEffect, useRef } from "react";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";


interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  about?: string;
  address?: {
    city: string;
    state: string;
  };
  createdAt: Timestamp;
  rating: number;
  reviewCount: number;
  skills?: string[];
  isPhoneVerified?: boolean;
  isDocumentVerified?: boolean;
}

const profileFormSchema = z.object({
  displayName: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  about: z.string().optional(),
  skills: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


export default function ProfilePage() {
  const { user, isLoggedIn, isAuthContextLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
  });

  const fetchUserProfile = async () => {
    if (user) {
      setIsProfileLoading(true);
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const profileData = userDocSnap.data() as UserProfile;
        setProfile(profileData);
        form.reset({
          displayName: profileData.displayName,
          about: profileData.about || "",
          skills: (profileData.skills || []).join(", "),
        });
      } else {
        console.log("No such document!");
      }
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn && !isAuthContextLoading) {
      setIsAuthModalOpen(true);
      setIsProfileLoading(false);
    }

    if (!isAuthContextLoading && user) {
       fetchUserProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoggedIn, isAuthContextLoading]);


  const handleEditToggle = () => {
    if (isEditing) {
        form.reset({
            displayName: profile?.displayName,
            about: profile?.about || "",
            skills: (profile?.skills || []).join(", "),
        });
    }
    setIsEditing(!isEditing);
  }

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // NOTE: This is where you would upload the file to Firebase Storage
    // and get the download URL. For now, we'll just show a toast.
    toast({
        title: "Funcionalidade em desenvolvimento",
        description: "O upload da imagem do perfil será implementado em breve."
    });
    // Example:
    // const storageRef = ref(storage, `profile_pictures/${user.uid}`);
    // await uploadBytes(storageRef, file);
    // const photoURL = await getDownloadURL(storageRef);
    // await updateDoc(doc(db, "users", user.uid), { photoURL });
    // await updateProfile(user, { photoURL });
    // fetchUserProfile();
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSaving(true);
    try {
        const userDocRef = doc(db, "users", user.uid);
        const skillsArray = data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
        
        await updateDoc(userDocRef, {
            displayName: data.displayName,
            about: data.about,
            skills: skillsArray,
        });

        await fetchUserProfile(); // Re-fetch to update UI
        setIsEditing(false);
        toast({
            title: "Perfil Atualizado!",
            description: "Suas informações foram salvas com sucesso.",
        });
    } catch (error) {
        console.error("Error updating profile: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao atualizar",
            description: "Não foi possível salvar suas alterações. Tente novamente.",
        });
    } finally {
        setIsSaving(false);
    }
  }


  const portfolioImage1 = findImage("listing-3");
  const portfolioImage2 = findImage("listing-4");
  const portfolioImage3 = findImage("listing-2");

  if (isAuthContextLoading || isProfileLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn || !user || !profile) {
    return (
      <>
        <div className="flex flex-col items-center justify-center text-center py-20">
          <Card className="w-full max-w-lg p-8">
            <CardTitle className="text-2xl mb-2">Acesso Negado</CardTitle>
            <CardDescription className="mb-6">
              Você precisa estar logado para ver seu perfil.
            </CardDescription>
            <Button onClick={() => setIsAuthModalOpen(true)}>
              Fazer Login ou Cadastrar
            </Button>
          </Card>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
          onLoginSuccess={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  }
  
  const joinDate = profile.createdAt ? profile.createdAt.toDate() : new Date();

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-5xl mx-auto">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader className="bg-muted/30 p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage src={profile.photoURL || user.photoURL || undefined} alt={user.displayName || ""} />
                    <AvatarFallback className="text-3xl">
                    {getInitials(profile.displayName)}
                    </AvatarFallback>
                </Avatar>
                <Button 
                    type="button"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Camera className="h-4 w-4" />
                </Button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start">
                 {isEditing ? (
                    <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                               <FormControl>
                                    <Input className="text-2xl font-bold" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : (
                    <h1 className="text-2xl font-bold">{profile.displayName || "Usuário"}</h1>
                )}
                <span className="text-gray-500 ml-0 md:ml-2">
                  @{profile.email?.split("@")[0]}
                </span>
              </div>
                {isEditing ? (
                     <FormField
                        control={form.control}
                        name="about"
                        render={({ field }) => (
                            <FormItem className="mt-2">
                               <FormControl>
                                    <Textarea placeholder="Fale um pouco sobre você..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : (
                    <p className="text-gray-600 mt-2">{profile.about || mockCurrentUser.about}</p>
                )}
              <div className="flex flex-wrap items-center justify-center md:justify-start mt-3 text-sm text-muted-foreground gap-x-4 gap-y-1">
                 {profile.address && (
                  <span className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" /> {profile.address.city}, {profile.address.state}
                  </span>
                 )}
                <span className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" /> No iNeed desde{" "}
                  {joinDate.toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                <Badge
                  variant={
                    user.emailVerified ? "default" : "secondary"
                  }
                  className={`gap-2 p-2 ${user.emailVerified ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}
                >
                  <CheckCircle className="h-4 w-4" /> Email {user.emailVerified ? "Verificado" : "Não Verificado"}
                </Badge>
                <Badge
                  variant={
                    profile.isPhoneVerified ? "default" : "secondary"
                  }
                  className={`gap-2 p-2 ${profile.isPhoneVerified ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}
                >
                  <CheckCircle className="h-4 w-4" /> Telefone {profile.isPhoneVerified ? "Verificado" : "Não Verificado"}
                </Badge>
                <Badge
                  variant={
                    profile.isDocumentVerified ? "default" : "secondary"
                  }
                   className={`gap-2 p-2 ${profile.isDocumentVerified ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}
                >
                  <ShieldCheck className="h-4 w-4" /> Documento {profile.isDocumentVerified ? "Verificado" : "Não Verificado"}
                </Badge>
              </div>
            </div>
             <div className="mt-6 md:mt-0 md:ml-auto flex flex-col items-center gap-2">
                {isEditing ? (
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : "Salvar"}
                        </Button>
                        <Button variant="ghost" onClick={handleEditToggle} type="button">
                            <X />
                        </Button>
                    </div>
                ) : (
                     <Button onClick={handleEditToggle} type="button">
                        <Pencil className="mr-2 h-4 w-4" /> Editar Perfil
                    </Button>
                )}
                
              <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200 mt-4">
                <div className="text-3xl font-bold text-blue-600">{profile.rating.toFixed(1)}</div>
                 <StarRating 
                  rating={profile.rating} 
                  reviewCount={profile.reviewCount}
                  className="justify-center mt-1" 
                 />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="supplier" className="w-full">
            <TabsList className="px-6 border-b rounded-none bg-transparent w-full justify-start">
              <TabsTrigger
                value="supplier"
                className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none data-[state=active]:shadow-none"
              >
                Fornecedor
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none data-[state=active]:shadow-none"
              >
                Atividade
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none data-[state=active]:shadow-none"
              >
                Configurações
              </TabsTrigger>
            </TabsList>
            <TabsContent value="supplier" className="p-6">
              <h2 className="text-xl font-bold mb-4">O que eu ofereço</h2>
              <div className="mb-6 space-y-2">
                <h3 className="font-medium">Habilidades / Categorias de Serviço</h3>
                 {isEditing ? (
                     <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                            <FormItem>
                               <FormControl>
                                    <Input placeholder="Ex: Design Gráfico, Edição de Vídeo" {...field} />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">Separe as habilidades por vírgula.</p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                 ) : (
                    <div className="flex flex-wrap gap-2">
                      {(profile.skills && profile.skills.length > 0 ? profile.skills : mockCurrentUser.skills).map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 px-3 py-1 text-sm"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {(!profile.skills || profile.skills.length === 0) && !isEditing && (
                          <p className="text-sm text-muted-foreground">Adicione suas habilidades para que os clientes possam te encontrar.</p>
                      )}
                    </div>
                 )}
              </div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Portfólio</h3>
                  <Button variant="link" className="text-primary p-0 h-auto">
                    <Plus className="mr-1 h-4 w-4" /> Adicionar item
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {portfolioImage1 && (
                    <Card>
                      <Image
                        src={portfolioImage1.imageUrl}
                        alt={portfolioImage1.description}
                        width={320}
                        height={160}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <p className="text-sm font-medium p-2">
                        Montagem de Computador Gamer
                      </p>
                    </Card>
                  )}
                  {portfolioImage2 && (
                    <Card>
                      <Image
                        src={portfolioImage2.imageUrl}
                        alt={portfolioImage2.description}
                        width={320}
                        height={160}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <p className="text-sm font-medium p-2">
                        Edição de Vídeo Corporativo
                      </p>
                    </Card>
                  )}
                  {portfolioImage3 && (
                    <Card>
                      <Image
                        src={portfolioImage3.imageUrl}
                        alt={portfolioImage3.description}
                        width={320}
                        height={160}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <p className="text-sm font-medium p-2">
                        Reforma Elétrica Residencial
                      </p>
                    </Card>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Preços</h3>
                  <p className="text-muted-foreground">
                    A partir de R$ 80/hora
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Área de Atendimento</h3>
                  <div className="bg-muted border rounded-lg h-48 flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Mapa com raio de atendimento de 30km
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="activity" className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold">
                        Histórico de Pedidos
                      </h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-b pb-4">
                        <div className="flex justify-between">
                          <h3 className="font-medium">
                            Instalação de Prateleiras
                          </h3>
                          <span className="text-green-600 font-medium">
                            Concluído
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Para Juliana C. - ⭐⭐⭐⭐⭐
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Concluído em 15 de outubro de 2025
                        </p>
                      </div>
                      <div className="border-b pb-4">
                        <div className="flex justify-between">
                          <h3 className="font-medium">Reparo de Notebook</h3>
                          <span className="text-blue-600 font-medium">
                            Em andamento
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Para Carlos M.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Iniciado em 22 de outubro de 2025
                        </p>
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <h3 className="font-medium">Design de Logo</h3>
                          <span className="text-green-600 font-medium">
                            Concluído
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Para Empresa XYZ - ⭐⭐⭐⭐⭐
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Concluído em 5 de outubro de 2025
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold">Depoimentos</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-700">
                          "Serviço excelente! Roger foi pontual, profissional e
                          entregou exatamente o que prometeu."
                        </p>
                        <p className="font-medium text-sm text-right mt-2">
                          - Juliana C. ⭐⭐⭐⭐⭐
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold">Minhas Avaliações</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-700">
                          "Fornecedor confiável e competente. Entregou no prazo
                          combinado."
                        </p>
                        <p className="font-medium text-sm text-right mt-2">
                          - Marcos T. ⭐⭐⭐⭐
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
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
          </Tabs>
        </CardContent>
        </form>
        </Form>
      </Card>
    </div>
  );
}

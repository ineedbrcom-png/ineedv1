
"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import {
  CheckCircle, MapPin, Calendar, ShieldCheck, Pencil, 
  Loader2, X, Camera
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { useState, useEffect, useRef } from "react";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { User as UserProfile } from "@/lib/data";
import { notFound } from "next/navigation";
import { SupplierTab } from "@/components/profile/supplier-tab";
import { ActivityTab } from "@/components/profile/activity-tab";
import { SettingsTab } from "@/components/profile/settings-tab";

const profileFormSchema = z.object({
  displayName: z.string().min(3, "Name must be at least 3 characters."),
  about: z.string().optional(),
  skills: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileClientProps {
    profileId?: string;
}

export function ProfileClient({ profileId: profileIdFromProps }: ProfileClientProps) {
  const { user, isLoggedIn, isAuthLoading } = useAuth();
  const profileId = profileIdFromProps || user?.uid;
  const isOwnProfile = profileIdFromProps ? profileIdFromProps === user?.uid : true;

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

  useEffect(() => {
    const fetchUserProfile = async (id: string) => {
        if (!id) return;
        setIsProfileLoading(true);
        const { db } = getFirebaseClient();
        const userDocRef = doc(db, "users", id);
        const userDocSnap = await getDoc(userDocRef);
  
        if (userDocSnap.exists()) {
          const profileData = {uid: id, ...userDocSnap.data()} as UserProfile;
          setProfile(profileData);
          if(isOwnProfile) {
              form.reset({
                  displayName: profileData.displayName,
                  about: profileData.about || "",
                  skills: (profileData.skills || []).join(", "),
              });
          }
        } else {
          notFound();
        }
        setIsProfileLoading(false);
    };

    if (profileId) {
       fetchUserProfile(profileId);
    } 
    else if (!isAuthLoading && !user) {
      setIsAuthModalOpen(true);
      setIsProfileLoading(false);
    }
  }, [profileId, user, isAuthLoading, isOwnProfile, form]);


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
    if (!file || !user || !isOwnProfile) return;

    toast({ title: "Uploading image...", description: "Please wait." });

    try {
      const { db, storage } = getFirebaseClient();
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { photoURL });
      
      if(user) {
        await updateProfile(user, { photoURL });
      }

      setProfile(prev => prev ? {...prev, photoURL} : null)
      toast({
          title: "Profile image updated!",
          description: "Your new profile picture is visible."
      });
    } catch (error) {
        console.error("Error uploading profile image: ", error);
        toast({
            variant: "destructive",
            title: "Upload Error",
            description: "Could not upload your image. Please try again."
        })
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !isOwnProfile) return;
    setIsSaving(true);
    try {
        const { db } = getFirebaseClient();
        const userDocRef = doc(db, "users", user.uid);
        const skillsArray = data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
        
        const updatedData = {
            displayName: data.displayName,
            about: data.about,
            skills: skillsArray,
        };

        await updateDoc(userDocRef, updatedData);

        if (user.displayName !== data.displayName) {
          await updateProfile(user, { displayName: data.displayName });
        }

        setProfile(prev => prev ? {...prev, ...updatedData} : null);
        setIsEditing(false);
        toast({
            title: "Profile Updated!",
            description: "Your information has been saved successfully.",
        });
    } catch (error) {
        console.error("Error updating profile: ", error);
        toast({
            variant: "destructive",
            title: "Error updating",
            description: "Could not save your changes. Please try again.",
        });
    } finally {
        setIsSaving(false);
    }
  }


  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile && !isOwnProfile) {
      notFound();
  }

  if (!profile && isOwnProfile) {
    return (
      <>
        <div className="flex flex-col items-center justify-center text-center py-20">
          <Card className="w-full max-w-lg p-8">
            <CardHeader>
              <CardTitle className="text-2xl mb-2">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">You need to be logged in to view this profile.</p>
              <Button onClick={() => setIsAuthModalOpen(true)}>
                Login or Sign Up
              </Button>
            </CardContent>
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

  if(!profile) return null;

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  }
  
  const joinDate = profile.createdAt ? (profile.createdAt as unknown as Timestamp).toDate() : new Date();

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-5xl mx-auto">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader className="bg-muted/30 p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-background">
                            <AvatarImage src={profile.photoURL || undefined} alt={profile.displayName || ""} />
                            <AvatarFallback className="text-3xl">
                            {getInitials(profile.displayName)}
                            </AvatarFallback>
                        </Avatar>
                        {isOwnProfile && (
                            <>
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
                            </>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start">
                        {isEditing && isOwnProfile ? (
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
                            <h1 className="text-2xl font-bold">{profile.displayName || "User"}</h1>
                        )}
                        <span className="text-gray-500 ml-0 md:ml-2">
                        @{profile.email?.split("@")[0]}
                        </span>
                    </div>
                        {isEditing && isOwnProfile ? (
                            <FormField
                                control={form.control}
                                name="about"
                                render={({ field }) => (
                                    <FormItem className="mt-2">
                                    <FormControl>
                                            <Textarea placeholder="Tell us a little about yourself..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <p className="text-gray-600 mt-2">{profile.about || (isOwnProfile ? "Edit your profile to add a description." : "No description provided.")}</p>
                        )}
                    <div className="flex flex-wrap items-center justify-center md:justify-start mt-3 text-sm text-muted-foreground gap-x-4 gap-y-1">
                        {profile.address && profile.address.city && (
                        <span className="flex items-center">
                            <MapPin className="mr-1 h-4 w-4" /> {profile.address.city}, {profile.address.state}
                        </span>
                        )}
                        <span className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" /> On iNeed since{" "}
                        {joinDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                        })}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                        {profile.email && (
                            <Badge
                            variant={"default"}
                            className={`gap-2 p-2 bg-green-100 text-green-800 border-green-200`}
                            >
                            <CheckCircle className="h-4 w-4" /> Email Verified
                            </Badge>
                        )}
                        <Badge
                        variant={
                            profile.isPhoneVerified ? "default" : "secondary"
                        }
                        className={`gap-2 p-2 ${profile.isPhoneVerified ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}
                        >
                        <CheckCircle className="h-4 w-4" /> Phone {profile.isPhoneVerified ? "Verified" : "Not Verified"}
                        </Badge>
                        <Badge
                        variant={
                            profile.isDocumentVerified ? "default" : "secondary"
                        }
                        className={`gap-2 p-2 ${profile.isDocumentVerified ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}
                        >
                        <ShieldCheck className="h-4 w-4" /> Document {profile.isDocumentVerified ? "Verified" : "Not Verified"}
                        </Badge>
                    </div>
                    </div>
                    <div className="mt-6 md:mt-0 md:ml-auto flex flex-col items-center gap-2">
                        {isOwnProfile && (isEditing ? (
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="animate-spin" /> : "Save"}
                                </Button>
                                <Button variant="ghost" onClick={handleEditToggle} type="button">
                                    <X />
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={handleEditToggle} type="button">
                                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                            </Button>
                        ))}
                        
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
                        className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
                    >
                        Supplier
                    </TabsTrigger>
                    <TabsTrigger
                        value="activity"
                        className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
                    >
                        Activity
                    </TabsTrigger>
                    {isOwnProfile && (
                        <TabsTrigger
                            value="settings"
                            className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
                        >
                            Settings
                        </TabsTrigger>
                    )}
                    </TabsList>
                    
                    <SupplierTab 
                        profile={profile}
                        isOwnProfile={isOwnProfile}
                        isEditing={isEditing}
                        form={form}
                    />
                    
                    <ActivityTab />

                    {isOwnProfile && <SettingsTab />}

                </Tabs>
                </CardContent>
            </form>
        </Form>
      </Card>
    </div>
  );
}

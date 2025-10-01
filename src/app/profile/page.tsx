import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/data";
import { findImage } from "@/lib/placeholder-images";
import { MailCheck, Phone, FileCheck2, Edit, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const userAvatar = findImage(currentUser.avatarId);

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="bg-muted/30 p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-background">
              {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={currentUser.name} />}
              <AvatarFallback className="text-3xl">
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <CardTitle className="text-3xl font-bold">{currentUser.name}</CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-1">
                {currentUser.email}
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-2">
                Member since {new Date(currentUser.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </p>
            </div>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Verification</h3>
            <div className="flex flex-wrap gap-4">
              <Badge variant={currentUser.isEmailVerified ? "default" : "secondary"} className="gap-2 p-2 bg-green-100 text-green-800 border-green-200">
                <MailCheck className="h-4 w-4" />
                <span>Email Verified</span>
              </Badge>
               <Badge variant={currentUser.isPhoneVerified ? "default" : "secondary"} className="gap-2 p-2 bg-green-100 text-green-800 border-green-200">
                <Phone className="h-4 w-4" />
                <span>Phone Verified</span>
              </Badge>
              <Badge variant={currentUser.isDocumentVerified ? "default" : "secondary"} className="gap-2 p-2">
                <FileCheck2 className="h-4 w-4" />
                <span>Documents Verified</span>
              </Badge>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-2">About Me</h3>
            <p className="text-muted-foreground">{currentUser.about}</p>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">My Skills</h3>
            <div className="flex flex-wrap gap-2">
              {currentUser.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-base px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

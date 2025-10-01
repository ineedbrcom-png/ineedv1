import { PostRequestForm } from "./post-request-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PostRequestPage() {
  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Post a New Request</CardTitle>
          <CardDescription>
            Detail what you need, and let the right provider find you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostRequestForm />
        </CardContent>
      </Card>
    </div>
  );
}

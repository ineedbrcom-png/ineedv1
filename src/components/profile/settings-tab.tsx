
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
                Notification Management
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    New offer notifications
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for your requests
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Direct messages</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new messages
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Request updates</p>
                  <p className="text-sm text-muted-foreground">
                    Know when the status of requests changes
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Account Security</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium mb-2">Change password</p>
                <Button>Change password</Button>
              </div>
              <div>
                <p className="font-medium mb-2">
                  Two-factor authentication
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-medium">
                    Enabled
                  </span>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                  >
                    Disable
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Privacy</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium mb-2">
                  Profile visibility
                </p>
                <Select defaultValue="public">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="connections">
                      Connections only
                    </SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="font-medium mb-2">
                  Request history
                </p>
                <Select defaultValue="public">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="connections">
                      Connections only
                    </SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Account Data</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Download my data
              </Button>
              <Button variant="destructive" className="w-full">
                Delete account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
}

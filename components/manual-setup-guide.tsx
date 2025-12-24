import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export function ManualSetupGuide() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <Card className="border-blue-500/20">
        <CardHeader>
          <CardTitle>Manual Setup Guide for StudioSphere</CardTitle>
          <CardDescription>Follow these steps to manually add an owner and studio in Supabase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              You'll need access to your Supabase dashboard's SQL Editor to run these commands.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Step 1: Create a User in Supabase Auth</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Go to Authentication → Users → Add User in your Supabase dashboard, or use the signup page.
              </p>
              <div className="bg-muted p-4 rounded-md font-mono text-sm">
                After creating the user, note down the UUID from the Users table.
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Step 2: Get the User UUID</h3>
              <p className="text-sm text-muted-foreground mb-2">In Supabase SQL Editor, run this query:</p>
              <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Step 3: Create the Studio</h3>
              <p className="text-sm text-muted-foreground mb-2">Replace YOUR_USER_UUID with the UUID from Step 2:</p>
              <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                {`INSERT INTO public.studios (name, owner_id)
VALUES ('Your Studio Name', 'YOUR_USER_UUID')
RETURNING id;`}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Copy the studio ID returned from this query.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Step 4: Create the Profile</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Replace YOUR_USER_UUID and YOUR_STUDIO_UUID with the values from previous steps:
              </p>
              <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                {`INSERT INTO public.profiles (id, email, full_name, studio_id, role)
VALUES (
  'YOUR_USER_UUID',
  'your-email@example.com',
  'Your Full Name',
  'YOUR_STUDIO_UUID',
  'owner'
);`}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Step 5 (Optional): Add Default Categories</h3>
              <p className="text-sm text-muted-foreground mb-2">Replace YOUR_STUDIO_UUID with your studio ID:</p>
              <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                {`INSERT INTO public.categories (studio_id, name) VALUES
('YOUR_STUDIO_UUID', 'Cameras'),
('YOUR_STUDIO_UUID', 'Lenses'),
('YOUR_STUDIO_UUID', 'Lighting'),
('YOUR_STUDIO_UUID', 'Audio'),
('YOUR_STUDIO_UUID', 'Accessories');`}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-2">Alternative: Quick Setup Script</h3>
              <p className="text-sm text-muted-foreground mb-2">
                If you're already logged in to Supabase, you can run script 005_seed_test_data.sql from the scripts
                folder. It will automatically set up everything for the current user.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

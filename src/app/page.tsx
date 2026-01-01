import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icons } from "@/components/icons";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-t-4 border-t-primary animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="text-center">
          <div className="mx-auto bg-violet-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 shadow-sm">
            <Icons.trophy className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900">YouLearn</CardTitle>
          <CardDescription className="text-base mt-2">
            The ultimate competitive learning platform for CBSE students.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          
          {/* Primary Action: Go to Login (Redirects to Dashboard if valid) */}
          <Link href="/login" className="w-full block">
            <Button size="lg" className="w-full font-bold text-lg h-12 shadow-md hover:shadow-lg transition-all">
              Start Learning <Icons.arrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          {/* Secondary Action: Direct Dashboard Access */}
          <Link href="/dashboard" className="w-full block">
            <Button variant="outline" size="lg" className="w-full font-medium text-slate-600 h-12 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-all">
              Go to Dashboard
            </Button>
          </Link>

        </CardContent>
      </Card>
      
      {/* Footer / Copyright */}
      <div className="absolute bottom-6 text-center text-slate-400 text-sm">
        <p>© 2024 YouLearn. All rights reserved.</p>
      </div>
    </div>
  );
}
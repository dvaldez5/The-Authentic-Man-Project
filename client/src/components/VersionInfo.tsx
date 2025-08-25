import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Info } from 'lucide-react';
import { VERSION } from '@/lib/version';

export function VersionInfo() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5" />
            Version Information
          </CardTitle>
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            v{VERSION.number}
          </Badge>
        </div>
        <CardDescription>
          Current application version and build details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Release Date:</span>
              <span className="text-muted-foreground">{VERSION.releaseDate}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Status:</span>
              <Badge variant="outline" className="ml-2 capitalize">
                Production-Ready
              </Badge>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">What You Get:</span>
            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
              <li>• Never miss your daily growth</li>
              <li>• Secure reflection space</li>
              <li>• See your transformation</li>
              <li>• Professionally designed challenges</li>
              <li>• Less than a coffee per week ($9.99/month)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
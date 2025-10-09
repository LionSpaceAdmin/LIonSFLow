'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        toast({
          title: 'התחברת בהצלחה!',
          description: 'מעביר אותך למערכת...',
        });
        router.push('/');
      } else {
        const data = await res.json();
        toast({
          variant: 'destructive',
          title: 'שגיאת התחברות',
          description: data.error || 'הסיסמה שהוזנה אינה נכונה.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'שגיאה',
        description: 'אירעה שגיאה בלתי צפויה. נסה שוב מאוחר יותר.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Bot className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold font-headline tracking-tighter">
                אורון
                </h1>
            </div>
          <CardTitle className="text-2xl">כניסה למערכת</CardTitle>
          <CardDescription>
            זוהי מערכת פנימית. אנא הזן את הסיסמה כדי להמשיך.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'מתחבר...' : 'התחבר'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}

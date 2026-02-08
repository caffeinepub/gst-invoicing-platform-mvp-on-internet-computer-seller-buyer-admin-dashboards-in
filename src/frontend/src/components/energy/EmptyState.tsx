import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

interface EmptyStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  actionPath?: string;
}

export default function EmptyState({
  title = 'No Data Available',
  message,
  actionLabel = 'Submit Inputs',
  actionPath = '/inputs',
}: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <Info className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{message}</p>
        <Button onClick={() => navigate({ to: actionPath })} className="w-full">
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

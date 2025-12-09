import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Calendar, 
  MoreHorizontal, 
  Plus,
  Target,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function ProjectSprints({ projectId }) {
  const { data: sprints } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => base44.entities.Sprint.filter({ project_id: projectId }),
    initialData: [
      { id: 1, name: 'Sprint 12', status: 'active', start_date: '2025-12-01', end_date: '2025-12-14', goal: 'Complete Auth Flow' },
      { id: 2, name: 'Sprint 13', status: 'planned', start_date: '2025-12-15', end_date: '2025-12-28', goal: 'User Dashboard' }
    ] // Mock data since we just created the entity and it's empty
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Sprints</h3>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" /> Plan Sprint
        </Button>
      </div>

      {sprints?.map(sprint => (
        <Card key={sprint.id} className={`border-l-4 ${sprint.status === 'active' ? 'border-l-indigo-500' : 'border-l-slate-300'}`}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-lg text-slate-900">{sprint.name}</h4>
                  <Badge variant={sprint.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                    {sprint.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(sprint.start_date), 'MMM d')} - {format(new Date(sprint.end_date), 'MMM d')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    Goal: {sprint.goal}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-2xl font-bold text-slate-900">8/12</span>
                  <p className="text-xs text-slate-500">Tasks Done</p>
                </div>
                <div className="w-32">
                   <Progress value={66} className="h-2" />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="flex items-center justify-between text-sm text-slate-600 cursor-pointer hover:text-indigo-600">
                <span>View Sprint Board</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
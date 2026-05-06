'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2, Circle } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  related_to?: string;
}

const PRIORITY_COLORS: Record<string, 'success' | 'warning' | 'destructive'> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
};

export default function TasksPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const queryClient = useQueryClient();

  // Fetch tasks - with mock fallback if API is not available
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/v1/tasks');
        return response.data;
      } catch (error) {
        // Mock data for demo purposes
        console.log('Using mock data - API not available');
        const today = new Date();
        return [
          { id: '1', title: 'Follow up with John', description: 'Discuss proposal details', due_date: format(today, 'yyyy-MM-dd'), priority: 'high', status: 'pending', related_to: 'TechCorp Deal' },
          { id: '2', title: 'Send contract to Sarah', description: 'Finalize terms', due_date: format(addDays(today, 1), 'yyyy-MM-dd'), priority: 'high', status: 'pending', related_to: 'StartupIO' },
          { id: '3', title: 'Product demo', description: 'Show new features', due_date: format(addDays(today, 2), 'yyyy-MM-dd'), priority: 'medium', status: 'pending', related_to: 'Enterprise Co' },
          { id: '4', title: 'Weekly report', description: 'Prepare sales metrics', due_date: format(addDays(today, 3), 'yyyy-MM-dd'), priority: 'low', status: 'completed', related_to: 'Internal' },
          { id: '5', title: 'Team meeting', description: 'Sprint planning', due_date: format(addDays(today, -1), 'yyyy-MM-dd'), priority: 'medium', status: 'completed', related_to: 'Internal' },
        ] as Task[];
      }
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.patch(`/api/v1/tasks/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task: Task) => isSameDay(new Date(task.due_date), date));
  };

  const getWeekDates = () => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const pendingTasks = tasks.filter((t: Task) => t.status === 'pending');
  const completedTasks = tasks.filter((t: Task) => t.status === 'completed');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <Button>New Task</Button>
        </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === 'list' ? 'default' : 'outline'}
          onClick={() => setView('list')}
        >
          List View
        </Button>
        <Button
          variant={view === 'calendar' ? 'default' : 'outline'}
          onClick={() => setView('calendar')}
        >
          Calendar View
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">Loading tasks...</p>
      ) : view === 'list' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Circle className="h-5 w-5" />
                Pending ({pendingTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <button
                    onClick={() => toggleStatusMutation.mutate({ id: task.id, status: 'completed' })}
                    className="mt-1 text-muted-foreground hover:text-primary"
                  >
                    <Circle className="h-5 w-5" />
                  </button>
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">{task.description}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.due_date), 'MMM d')}
                      </span>
                      {task.related_to && (
                        <span className="text-xs text-muted-foreground">• {task.related_to}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No pending tasks</p>
              )}
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Completed ({completedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border opacity-60">
                  <button
                    onClick={() => toggleStatusMutation.mutate({ id: task.id, status: 'pending' })}
                    className="mt-1 text-green-600 hover:text-primary"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                  <div className="flex-1">
                    <div className="font-medium line-through">{task.title}</div>
                    <div className="text-sm text-muted-foreground">{task.description}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{task.priority}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {completedTasks.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No completed tasks</p>
              )}
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}

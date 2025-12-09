import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import TaskModal from './TaskModal';

const COLUMNS = {
  backlog: { id: 'backlog', title: 'Backlog', color: 'border-t-slate-400' },
  in_progress: { id: 'in_progress', title: 'In Progress', color: 'border-t-blue-500' },
  in_review: { id: 'in_review', title: 'In Review', color: 'border-t-amber-500' },
  done: { id: 'done', title: 'Done', color: 'border-t-emerald-500' }
};

const TaskCard = ({ task, index, onClick }) => {
  const priorityColor =
    {
      low: 'bg-slate-100 text-slate-600',
      medium: 'bg-blue-50 text-blue-700',
      high: 'bg-red-50 text-red-700',
    }[task.priority] || 'bg-slate-100 text-slate-600';

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={[
            'bg-white p-3 rounded-lg border border-slate-200/80 mb-3 cursor-pointer',
            'hover:shadow-md hover:border-indigo-100 transition-all',
            snapshot.isDragging
              ? 'shadow-lg ring-2 ring-indigo-500/40 scale-[1.01] bg-indigo-50/40'
              : 'shadow-sm',
          ].join(' ')}
        >
          <div className="flex justify-between items-start mb-1.5">
            <Badge
              variant="secondary"
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priorityColor}`}
            >
              {task.priority?.toUpperCase() || 'PRIORITY'}
            </Badge>
            {task.due_date && (
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(task.due_date), 'MMM d')}
              </div>
            )}
          </div>

          <h4 className="text-sm font-medium text-slate-900 mb-2 line-clamp-2">
            {task.title}
          </h4>

          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-1 flex-wrap">
              {task.tags?.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100"
                >
                  {tag}
                </span>
              ))}
            </div>
            {task.assignee_email && (
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-[9px] bg-indigo-100 text-indigo-700">
                  {task.assignee_email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default function ProjectKanban({ projectId }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [creatingStatus, setCreatingStatus] = useState('backlog');

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => base44.entities.Task.filter({ project_id: projectId }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Task.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newStatus = destination.droppableId;
    updateStatusMutation.mutate({ id: draggableId, status: newStatus });
  };

  const filteredTasks = useMemo(() => {
    const empty = { backlog: [], in_progress: [], in_review: [], done: [] };
    if (!tasks) return empty;

    const result = { ...empty };

    tasks.forEach((task) => {
      if (
        search &&
        !task.title.toLowerCase().includes(search.toLowerCase())
      )
        return;

      const status = task.status && result[task.status] ? task.status : 'backlog';
      result[status].push(task);
    });

    return result;
  }, [tasks, search]);

  const totalTasks =
    tasks?.length || 0;

  const handleCreateTask = (status = 'backlog') => {
    setSelectedTask(null);
    setCreatingStatus(status);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalOpenChange = (open) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedTask(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="w-full h-10 mb-4" />
        <Skeleton className="w-full h-96" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search tasks..."
              className="pl-10 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {totalTasks > 0 && (
            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
              {totalTasks} tasks
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex border-slate-200 text-slate-600"
          >
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button
            size="sm"
            onClick={() => handleCreateTask('backlog')}
            className="bg-indigo-600 hover:bg-indigo-700 text-xs"
          >
            <Plus className="w-4 h-4 mr-1" /> New Task
          </Button>
        </div>
      </div>

      {/* BOARD */}
      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 min-w-[900px] h-full">
            {Object.values(COLUMNS).map((col) => (
              <div
                key={col.id}
                className="flex-1 flex flex-col bg-slate-50 rounded-xl border border-slate-200/70 h-full min-h-[480px]"
              >
                {/* Column header */}
                <div
                  className={`px-4 py-3 border-t-4 ${col.color} rounded-t-xl bg-white border-b border-slate-100 flex items-center justify-between`}
                >
                  <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    {col.title}
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-slate-100 text-slate-600 text-[10px]"
                    >
                      {filteredTasks[col.id]?.length || 0}
                    </Badge>
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCreateTask(col.id)}
                  >
                    <Plus className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
                  </Button>
                </div>

                {/* Column body */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={[
                        'p-3 flex-1 overflow-y-auto rounded-b-xl',
                        'transition-colors',
                        snapshot.isDraggingOver ? 'bg-indigo-50/80' : 'bg-slate-50',
                      ].join(' ')}
                    >
                      {filteredTasks[col.id]?.map((task, index) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          onClick={() => handleEditTask(task)}
                        />
                      ))}

                      {provided.placeholder}

                      {filteredTasks[col.id]?.length === 0 &&
                        !snapshot.isDraggingOver && (
                          <div className="h-28 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs bg-white/40">
                            <p className="mb-1">No tasks</p>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleCreateTask(col.id)}
                            >
                              + Add one
                            </Button>
                          </div>
                        )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* TASK MODAL */}
      <TaskModal
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        task={selectedTask}
        projectId={projectId}
        onClose={() => setSelectedTask(null)}
        defaultStatus={creatingStatus}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Search, Filter, Calendar, Clock, CheckCircle, Circle, PlayCircle, MoreVertical, X, Edit, Trash2, AlertTriangle, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCRM, Task } from "@/lib/crm-context";
import { formatDate, cn } from "@/lib/utils";

const priorityColors = {
  high: "bg-red-500/15 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/15 text-green-400 border-green-500/30",
};

const statusColors = {
  todo: "bg-gray-500/15 text-gray-400",
  in_progress: "bg-blue-500/15 text-blue-400",
  active: "bg-purple-500/15 text-purple-400",
  completed: "bg-green-500/15 text-green-400",
};

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, projects } = useCRM();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "todo" as "todo" | "in_progress" | "completed",
    dueDate: "",
    projectId: "",
  });

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    addTask({
      title: newTask.title,
      description: newTask.description || undefined,
      priority: newTask.priority,
      status: newTask.status,
      dueDate: newTask.dueDate || undefined,
      projectId: newTask.projectId || undefined,
    });
    setNewTask({ title: "", description: "", priority: "medium", status: "todo", dueDate: "", projectId: "" });
    setShowAddModal(false);
  };

  const handleUpdateTask = () => {
    if (!editingTask || !editingTask.title.trim()) return;
    updateTask(editingTask.id, editingTask);
    setEditingTask(null);
  };

  const handleDeleteTask = () => {
    if (deletingTask) {
      deleteTask(deletingTask.id);
      setDeletingTask(null);
    }
  };

  const cycleTaskStatus = (task: Task) => {
    const statusOrder: Task["status"][] = ["todo", "in_progress", "completed"];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    updateTask(task.id, { status: nextStatus });
  };

  const todoTasks = filteredTasks.filter(t => t.status === "todo");
  const inProgressTasks = filteredTasks.filter(t => t.status === "in_progress");
  const completedTasks = filteredTasks.filter(t => t.status === "completed");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Tasks</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your tasks and activities</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-500/15 flex items-center justify-center">
              <Circle className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{todoTasks.length}</p>
              <p className="text-xs text-[var(--text-muted)]">To Do</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{inProgressTasks.length}</p>
              <p className="text-xs text-[var(--text-muted)]">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{completedTasks.length}</p>
              <p className="text-xs text-[var(--text-muted)]">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* To Do */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-[var(--text-primary)]">To Do</h3>
              <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">{todoTasks.length}</span>
            </div>
          </div>
          <div className="space-y-3">
            {todoTasks.map((task) => (
              <TaskCard key={task.id} task={task} onCycleStatus={cycleTaskStatus} onEdit={setEditingTask} onDelete={setDeletingTask} />
            ))}
            {todoTasks.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">No tasks</p>
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-[var(--text-primary)]">In Progress</h3>
              <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
            </div>
          </div>
          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <TaskCard key={task.id} task={task} onCycleStatus={cycleTaskStatus} onEdit={setEditingTask} onDelete={setDeletingTask} />
            ))}
            {inProgressTasks.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">No tasks</p>
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <h3 className="font-semibold text-[var(--text-primary)]">Completed</h3>
              <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">{completedTasks.length}</span>
            </div>
          </div>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} onCycleStatus={cycleTaskStatus} onEdit={setEditingTask} onDelete={setDeletingTask} />
            ))}
            {completedTasks.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">No tasks</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1c1c1f] border border-[#27272a] rounded-xl p-5 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">New Task</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="What needs to be done?"
                className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
                autoFocus
              />

              <div className="flex gap-2">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  className="flex-1 bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <div className="flex-1 relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="flex-1 bg-[#27272a] border border-[#3f3f46] rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full
                      [&::-webkit-calendar-picker-indicator]:filter
                      [&::-webkit-calendar-picker-indicator]:invert
                      [&::-webkit-calendar-picker-indicator]:opacity-0
                      [&::-webkit-calendar-picker-indicator]:w-5
                      [&::-webkit-calendar-picker-indicator]:h-5
                      [&::-webkit-calendar-picker-indicator]:cursor-pointer
                      [&::-webkit-calendar-picker-indicator]:absolute
                      [&::-webkit-calendar-picker-indicator]:right-2
                      [&::-webkit-calendar-picker-indicator]:top-1/2
                      [&::-webkit-calendar-picker-indicator]:-translate-y-1/2"
                  />
                </div>
              </div>

              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as any })}
                className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={newTask.projectId}
                onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">No Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-3 py-2 text-sm text-gray-400 hover:text-white bg-[#27272a] rounded-lg">Cancel</button>
              <button onClick={handleAddTask} disabled={!newTask.title.trim()} className="flex-1 px-3 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">Add Task</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Edit Task</h3>
              <button onClick={() => setEditingTask(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Title</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Priority</label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Status</label>
                <select
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as any })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={editingTask.dueDate || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setEditingTask(null)} className="flex-1">Cancel</Button>
              <Button onClick={handleUpdateTask} className="flex-1">Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-sm mx-4">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Delete Task</h3>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Are you sure you want to delete <span className="text-[var(--text-primary)] font-medium">"{deletingTask.title}"</span>?
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setDeletingTask(null)} className="flex-1">Cancel</Button>
                <Button onClick={handleDeleteTask} className="flex-1 bg-red-500 hover:bg-red-600">Delete</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Task Card Component
function TaskCard({ task, onCycleStatus, onEdit, onDelete }: { task: Task; onCycleStatus: (task: Task) => void; onEdit: (task: Task) => void; onDelete: (task: Task) => void }) {
  const priorityColors = {
    high: "border-l-red-500",
    medium: "border-l-yellow-500",
    low: "border-l-green-500",
  };

  return (
    <div className={`bg-[var(--bg-tertiary)] border border-[var(--border-default)] border-l-4 ${priorityColors[task.priority]} rounded-lg p-3 hover:border-[var(--border-hover)] transition-colors cursor-pointer group`}>
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); onCycleStatus(task); }}
          className="mt-0.5 flex-shrink-0"
        >
          {task.status === "completed" ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : task.status === "in_progress" ? (
            <PlayCircle className="w-5 h-5 text-blue-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.status === "completed" ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`}>
            {task.title}
          </p>
          {task.dueDate && (
            <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </p>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-1.5 hover:bg-[var(--bg-elevated)] rounded"
          >
            <Edit className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task); }}
            className="p-1.5 hover:bg-red-500/10 rounded"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          task.priority === "high" ? "bg-red-500/15 text-red-400" :
          task.priority === "medium" ? "bg-yellow-500/15 text-yellow-400" :
          "bg-green-500/15 text-green-400"
        }`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
}

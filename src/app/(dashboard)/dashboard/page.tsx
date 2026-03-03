"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Users, Home, DollarSign, ArrowUpRight, Calendar, Clock, Plus, Phone, Mail, FileText, CheckCircle, Circle, PlayCircle, Target, TrendingUp, Activity, Briefcase, UserPlus, Zap, X } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { useCRM } from "@/lib/crm-context";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const { projects, leads, activities, payments, contacts, tasks: contextTasks, addTask, updateTask, units } = useCRM();

  // Quick action modals
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "medium" as "low" | "medium" | "high", dueDate: "" });

  const totalRevenue = payments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
  const totalUnits = projects.reduce((sum, p) => sum + p.units, 0);
  const unitsSold = projects.reduce((sum, p) => sum + p.unitsSold, 0);
  const activeProjects = projects.filter(p => p.status === "In Progress").length;
  const activeLeads = leads.filter(l => !["Won", "Lost"].includes(l.stage)).length;
  const totalPending = payments.filter(p => p.status === "Pending" || p.status === "Overdue").reduce((sum, p) => sum + p.amount, 0);

  // New KPIs
  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 ? Math.round(((leads.filter(l => l.stage === "Won").length) / totalLeads) * 100) : 0;
  const tasks = contextTasks;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const tasksCompletion = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const getTaskIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in_progress": return <PlayCircle className="w-5 h-5 text-blue-500" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/15 text-red-400";
      case "medium": return "bg-yellow-500/15 text-yellow-400";
      case "low": return "bg-green-500/15 text-green-400";
      default: return "bg-gray-500/15 text-gray-400";
    }
  };

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      addTask({
        title: newTask.title,
        priority: newTask.priority,
        status: "todo",
        dueDate: newTask.dueDate || undefined,
      });
      setNewTask({ title: "", priority: "medium", dueDate: "" });
      setShowAddTaskModal(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">Welcome back! Here&apos;s your overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">{formatDate(new Date().toString())}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={() => router.push("/leads")} className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary-hover transition-colors text-sm font-medium">
          <UserPlus className="w-4 h-4" />
          Add Lead
        </button>
        <button onClick={() => setShowAddTaskModal(true)} className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border-default text-text-secondary rounded-lg hover:bg-bg-tertiary hover:text-text-primary transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />
          Create Task
        </button>
        <button onClick={() => router.push("/leads")} className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border-default text-text-secondary rounded-lg hover:bg-bg-tertiary hover:text-text-primary transition-colors text-sm font-medium">
          <Briefcase className="w-4 h-4" />
          View All Leads
        </button>
        <button onClick={() => router.push("/tasks")} className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border-default text-text-secondary rounded-lg hover:bg-bg-tertiary hover:text-text-primary transition-colors text-sm font-medium">
          <Target className="w-4 h-4" />
          View Tasks
        </button>
      </div>

      {/* Core KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-bg-secondary border border-border-default rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/15 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{totalLeads}</p>
              <p className="text-xs text-text-muted">Total Leads</p>
            </div>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-default rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-secondary/15 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{activeProjects}</p>
              <p className="text-xs text-text-muted">Active Projects</p>
            </div>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-default rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-warning/15 flex items-center justify-center">
              <Home className="w-5 h-5 text-accent-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{unitsSold}/{totalUnits}</p>
              <p className="text-xs text-text-muted">Units Sold</p>
            </div>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-default rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-info/15 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-text-muted">Revenue</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks */}
          <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Tasks</h2>
              <button onClick={() => router.push("/tasks")} className="text-sm text-accent-primary hover:text-accent-primary-hover flex items-center gap-1">
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary hover:bg-bg-elevated transition-colors cursor-pointer"
                  onClick={() => {
                    const nextStatus = task.status === "completed" ? "todo" :
                                      task.status === "todo" ? "in_progress" :
                                      task.status === "in_progress" ? "completed" : "completed";
                    updateTask(task.id, { status: nextStatus });
                  }}
                >
                  {getTaskIcon(task.status)}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.status === "completed" ? "line-through text-text-muted" : "text-text-primary"}`}>{task.title}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-sm text-text-muted text-center py-4">No tasks yet. Create one to get started!</p>
              )}
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Recent Leads</h2>
              <button onClick={() => router.push("/leads")} className="text-sm text-accent-primary hover:text-accent-primary-hover flex items-center gap-1">
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary hover:bg-bg-elevated transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white font-medium">
                    {getInitials(lead.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{lead.name}</p>
                    <p className="text-xs text-text-muted truncate">{lead.projectInterest}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      lead.stage === 'New' ? 'bg-accent-info/15 text-accent-info' :
                      lead.stage === 'Qualified' ? 'bg-accent-warning/15 text-accent-warning' :
                      'bg-accent-primary/15 text-accent-primary'
                    }`}>
                      {lead.stage}
                    </span>
                  </div>
                </div>
              ))}
              {leads.length === 0 && (
                <p className="text-sm text-text-muted text-center py-4">No leads yet. Add your first lead!</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Performance Analytics */}
          <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Performance Analytics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Lead Conversion Rate</span>
                <span className="text-sm font-semibold text-accent-secondary">{conversionRate}%</span>
              </div>
              <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <div className={`h-full ${conversionRate > 0 ? 'bg-accent-secondary' : 'bg-gray-500'} rounded-full`} style={{ width: `${conversionRate}%` }} />
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-text-secondary">Tasks Completion</span>
                <span className="text-sm font-semibold text-accent-primary">{tasksCompletion}%</span>
              </div>
              <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <div className={`h-full ${tasksCompletion > 0 ? 'bg-accent-primary' : 'bg-gray-500'} rounded-full`} style={{ width: `${tasksCompletion}%` }} />
              </div>
            </div>

            {/* Category Distribution */}
            <div className="mt-6 pt-4 border-t border-border-default">
              <h3 className="text-sm font-medium text-text-primary mb-3">Leads by Source</h3>
              <div className="flex flex-wrap gap-2">
                {["Website", "Referral", "Agent", "Advertisement"].map((source) => {
                  const count = leads.filter(l => l.source === source).length;
                  return (
                    <div key={source} className="flex items-center gap-2 px-3 py-1.5 bg-bg-tertiary rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-accent-primary" />
                      <span className="text-xs text-text-secondary">{source}</span>
                      <span className="text-xs font-semibold text-text-primary">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'lead' ? 'bg-accent-primary/15' :
                    activity.type === 'payment' ? 'bg-accent-secondary/15' :
                    activity.type === 'sale' ? 'bg-accent-warning/15' :
                    'bg-accent-info/15'
                  }`}>
                    <Activity className={`w-4 h-4 ${
                      activity.type === 'lead' ? 'text-accent-primary' :
                      activity.type === 'payment' ? 'text-accent-secondary' :
                      activity.type === 'sale' ? 'text-accent-warning' :
                      'text-accent-info'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{activity.title}</p>
                    <p className="text-xs text-text-muted truncate">{activity.description}</p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-text-muted text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary border border-border-default rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Create New Task</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                  className="w-full bg-bg-tertiary border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "low" | "medium" | "high" })}
                  className="w-full bg-bg-tertiary border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full bg-bg-tertiary border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowAddTaskModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleAddTask} className="flex-1">Create Task</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

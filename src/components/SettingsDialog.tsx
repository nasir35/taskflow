import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/appStore';
import { useTaskStore } from '@/store/taskStore';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Bell, 
  Timer, 
  Download, 
  Upload,
  Settings,
  Palette,
  Keyboard
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { theme, setTheme, pomodoroSettings, updatePomodoroSettings } = useAppStore();
  const { tasks, projects } = useTaskStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );

  const handleExportJSON = () => {
    const data = {
      tasks,
      projects,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Description', 'Priority', 'Status', 'Due Date', 'Tags', 'Project', 'Created At'];
    const rows = tasks.map((task) => [
      task.title,
      task.description,
      task.priority,
      task.status,
      task.dueDate || '',
      task.tags.join('; '),
      projects.find((p) => p.id === task.projectId)?.name || '',
      task.createdAt,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tasks exported as CSV');
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.tasks && data.projects) {
          localStorage.setItem('task-storage', JSON.stringify({ state: data, version: 0 }));
          toast.success('Data imported! Refreshing...');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast.error('Invalid backup file');
        }
      } catch (err) {
        toast.error('Failed to parse file');
      }
    };
    reader.readAsText(file);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') {
        toast.success('Notifications enabled');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance" className="text-xs">
              <Palette className="w-3.5 h-3.5 mr-1" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">
              <Bell className="w-3.5 h-3.5 mr-1" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="timer" className="text-xs">
              <Timer className="w-3.5 h-3.5 mr-1" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs">
              <Download className="w-3.5 h-3.5 mr-1" />
              Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium">Theme</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Choose your preferred color scheme
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                    theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Sun className="w-6 h-6" />
                  <span className="text-sm">Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                    theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Moon className="w-6 h-6" />
                  <span className="text-sm">Dark</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                    theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Monitor className="w-6 h-6" />
                  <span className="text-sm">System</span>
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Desktop Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified about due tasks and timer
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={() => {
                  if (!notificationsEnabled) {
                    requestNotificationPermission();
                  }
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="timer" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium">Work Duration (minutes)</Label>
              <Input
                type="number"
                value={pomodoroSettings?.workDuration || 25}
                onChange={(e) =>
                  updatePomodoroSettings?.({ workDuration: parseInt(e.target.value) || 25 })
                }
                className="mt-2"
                min={1}
                max={60}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Break Duration (minutes)</Label>
              <Input
                type="number"
                value={pomodoroSettings?.breakDuration || 5}
                onChange={(e) =>
                  updatePomodoroSettings?.({ breakDuration: parseInt(e.target.value) || 5 })
                }
                className="mt-2"
                min={1}
                max={30}
              />
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium">Export Data</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Download your tasks and projects
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportJSON}>
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Import Data</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Restore from a JSON backup file
              </p>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                  id="import-file"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('import-file')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import JSON
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

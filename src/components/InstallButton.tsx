import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Monitor, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success('App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowDialog(true);
    }
  };

  if (isInstalled) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2">
        <CheckCircle2 className="w-4 h-4 text-success" />
        Installed
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleInstallClick}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Install App
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Install TaskFlow
            </DialogTitle>
            <DialogDescription>
              Install this app on your device for the best experience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">🪟 Windows</h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Click the install icon in the address bar</li>
                <li>2. Or press <kbd className="kbd">Ctrl</kbd> + <kbd className="kbd">Shift</kbd> + <kbd className="kbd">A</kbd></li>
                <li>3. Click "Install" in the popup</li>
              </ol>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">🍎 macOS</h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Click the install icon in Chrome's address bar</li>
                <li>2. Or go to Chrome menu → "Install TaskFlow..."</li>
                <li>3. Click "Install" to add to Applications</li>
              </ol>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">🐧 Linux</h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Click the install icon in the address bar</li>
                <li>2. Click "Install" in the popup</li>
                <li>3. The app will be added to your applications</li>
              </ol>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Once installed, the app will work offline and launch like a native application.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

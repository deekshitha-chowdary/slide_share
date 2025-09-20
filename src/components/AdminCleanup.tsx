import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminCleanupProps {
  onCleanupSuccess: () => void;
}

const AdminCleanup = ({ onCleanupSuccess }: AdminCleanupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const ADMIN_PASSWORD = 'shubsss@vitsaids';

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      toast({
        title: "Access denied",
        description: "Incorrect password",
        variant: "destructive",
      });
      setPassword('');
    }
  };

  const handleCleanup = async () => {
    if (!selectedYear) return;

    setIsDeleting(true);

    try {
      // Delete database records
      const { error: dbError } = await supabase
        .from('presentations')
        .delete()
        .eq('year', selectedYear);

      if (dbError) {
        throw dbError;
      }

      // Delete storage files
      const { data: files, error: listError } = await supabase.storage
        .from('presentations')
        .list(selectedYear);

      if (listError) {
        console.warn('Error listing files:', listError);
      } else if (files && files.length > 0) {
        const filePaths = files.map(file => `${selectedYear}/${file.name}`);
        const { error: deleteError } = await supabase.storage
          .from('presentations')
          .remove(filePaths);

        if (deleteError) {
          console.warn('Error deleting files:', deleteError);
        }
      }

      toast({
        title: "Cleanup successful",
        description: `All ${selectedYear} presentations have been deleted`,
      });

      setIsOpen(false);
      setIsAuthenticated(false);
      setSelectedYear('');
      onCleanupSuccess();

    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: "Cleanup failed",
        description: "There was an error during cleanup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetState = () => {
    setIsAuthenticated(false);
    setPassword('');
    setSelectedYear('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetState();
    }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="fixed bottom-4 right-4 opacity-30 hover:opacity-100 transition-opacity duration-300 text-xs h-8 w-8 p-0"
          title="Admin Database Cleanup"
        >
          🧹
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Admin Database Cleanup
          </DialogTitle>
        </DialogHeader>
        
        {!isAuthenticated ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium">
                Enter Admin Password
              </label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
            <Button onClick={handlePasswordSubmit} className="w-full">
              Authenticate
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="year-select" className="text-sm font-medium">
                Select Year to Delete
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year to cleanup" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  disabled={!selectedYear || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all presentations
                    for <strong>{selectedYear}</strong> from both the database and storage.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCleanup} className="bg-destructive hover:bg-destructive/90">
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminCleanup;
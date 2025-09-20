import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, X, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EmbeddedViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  title: string;
}

const EmbeddedViewer = ({ isOpen, onClose, fileUrl, fileName, title }: EmbeddedViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [googleSlidesUrl, setGoogleSlidesUrl] = useState<string | null>(null);
  const [useGoogleSlides, setUseGoogleSlides] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleDocumentLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleDocumentError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (dialogRef.current) {
          await dialogRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const tryGoogleSlidesEmbed = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      const { data, error } = await supabase.functions.invoke('google-slides-embed', {
        body: { fileUrl, fileName }
      });

      if (error) throw error;

      if (data.success) {
        setGoogleSlidesUrl(data.embedUrl);
        setUseGoogleSlides(true);
        const viewerType = data.viewerType === 'office' ? 'Microsoft Office Online' : 'Google Slides';
        toast.success(`Loading with ${viewerType} for better viewing`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Google Slides conversion failed:', error);
      toast.error('Failed to convert to Google Slides, using default viewer');
      setUseGoogleSlides(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Try Google Slides first for PowerPoint files
      const extension = fileName.split('.').pop()?.toLowerCase();
      if (extension === 'ppt' || extension === 'pptx') {
        tryGoogleSlidesEmbed();
      } else {
        setIsLoading(false);
      }
    }
  }, [isOpen, fileUrl, fileName]);

  const getSupportedFormats = () => {
    return ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'];
  };

  const isFileSupported = () => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension && getSupportedFormats().includes(extension);
  };

  // Create Google Viewer URL for supported file types
  const getGoogleViewerUrl = () => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'].includes(extension || '')) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        ref={dialogRef} 
        className={`w-full h-screen max-w-none max-h-none p-0 ${
          isFullscreen ? 'dialog-content-fullscreen' : ''
        }`}
      >
        <DialogHeader className={`p-4 border-b ${isFullscreen ? 'hidden' : ''}`}>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg truncate pr-4">{title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={tryGoogleSlidesEmbed}
                className="h-8 w-8 p-0"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className={`flex-1 overflow-hidden ${isFullscreen ? 'p-0' : 'p-4'}`}>
          {!isFileSupported() ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Unsupported File Format</h3>
              <p className="text-muted-foreground mb-4">
                This file type cannot be previewed. Supported formats: {getSupportedFormats().join(', ')}
              </p>
              <Button 
                onClick={() => window.open(fileUrl, '_blank')}
                variant="outline"
              >
                Download File Instead
              </Button>
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-medium mb-2">Failed to Load Presentation</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading this presentation. You can try downloading it instead.
              </p>
              <Button 
                onClick={() => window.open(fileUrl, '_blank')}
                variant="outline"
              >
                Download File
              </Button>
            </div>
          ) : (
            <div className="h-full relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">
                      {useGoogleSlides ? 'Converting to Google Slides...' : 'Loading presentation...'}
                    </p>
                  </div>
                </div>
              )}
              
              {useGoogleSlides && googleSlidesUrl ? (
                <iframe
                  src={googleSlidesUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  title={title}
                  onLoad={handleDocumentLoad}
                  onError={handleDocumentError}
                />
              ) : (
                <iframe
                  src={getGoogleViewerUrl() || fileUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  title={title}
                  onLoad={handleDocumentLoad}
                  onError={handleDocumentError}
                />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmbeddedViewer;
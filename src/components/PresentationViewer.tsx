import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Calendar, User, FileText, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import EmbeddedViewer from './EmbeddedViewer';

interface Presentation {
  id: string;
  name: string;
  roll_number: string;
  title: string;
  year: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

interface PresentationViewerProps {
  refreshTrigger: number;
}

const PresentationViewer = ({ refreshTrigger }: PresentationViewerProps) => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState('1st Year');
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  const fetchPresentations = async () => {
    try {
      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching presentations:', error);
        return;
      }

      setPresentations(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, [refreshTrigger]);

  const getPresentationsByYear = (year: string) => {
    return presentations.filter(p => p.year === year);
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewPresentation = (presentation: Presentation) => {
    setSelectedPresentation(presentation);
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedPresentation(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up animate-delay-400">
      <Tabs value={activeYear} onValueChange={setActiveYear} className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass-card">
          {years.map((year) => (
            <TabsTrigger key={year} value={year} className="relative">
              {year}
              {getPresentationsByYear(year).length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {getPresentationsByYear(year).length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {years.map((year) => (
          <TabsContent key={year} value={year} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getPresentationsByYear(year).length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No presentations yet</p>
                    <p className="text-sm">Be the first to upload a presentation for {year}!</p>
                  </div>
                </div>
              ) : (
                getPresentationsByYear(year).map((presentation) => (
                  <Card key={presentation.id} className="glass-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2 text-primary">
                        {presentation.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{presentation.name}</span>
                        <Badge variant="outline" className="ml-auto">
                          {presentation.roll_number}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                        <Calendar className="h-3 w-3" />
                        <span>Uploaded {formatDate(presentation.created_at)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewPresentation(presentation)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          View Presentation
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDownload(presentation.file_url, presentation.file_name)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {selectedPresentation && (
        <EmbeddedViewer
          isOpen={viewerOpen}
          onClose={handleCloseViewer}
          fileUrl={selectedPresentation.file_url}
          fileName={selectedPresentation.file_name}
          title={selectedPresentation.title}
        />
      )}
    </div>
  );
};

export default PresentationViewer;
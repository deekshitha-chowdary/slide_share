import { useState } from 'react';
import TypingAnimation from '@/components/TypingAnimation';
import UploadForm from '@/components/UploadForm';
import PresentationViewer from '@/components/PresentationViewer';
import AdminCleanup from '@/components/AdminCleanup';

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCleanupSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4 animate-fade-in-up">
            SlideBoard
          </h1>
          <TypingAnimation />
        </div>

        {/* Upload Section */}
        <div className="mb-16">
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Presentation Viewer */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center text-primary mb-8">
            Browse Presentations
          </h2>
          <PresentationViewer refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card/50 backdrop-blur-sm border-t py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Built by{' '}
            <a 
              href="https://github.com/theshubhamgundu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              shubsss
            </a>
          </p>
        </div>
      </footer>

      {/* Admin Cleanup */}
      <AdminCleanup onCleanupSuccess={handleCleanupSuccess} />
    </div>
  );
};

export default Index;

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadFormProps {
  onUploadSuccess: () => void;
}

const UploadForm = ({ onUploadSuccess }: UploadFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    title: '',
    year: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.ppt') || selectedFile.name.endsWith('.pptx')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload only .ppt or .pptx files",
          variant: "destructive",
        });
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !formData.name || !formData.rollNumber || !formData.title || !formData.year) {
      toast({
        title: "Missing information",
        description: "Please fill all fields and select a file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to storage
      const fileExtension = file.name.split('.').pop();
      const fileName = `${formData.rollNumber}_${formData.title.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;
      const filePath = `${formData.year}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('presentations')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('presentations')
        .getPublicUrl(filePath);

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('presentations')
        .insert({
          name: formData.name,
          roll_number: formData.rollNumber,
          title: formData.title,
          year: formData.year,
          file_url: publicUrl,
          file_name: fileName,
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Upload successful!",
        description: "Your presentation has been uploaded successfully",
      });

      // Reset form
      setFormData({ name: '', rollNumber: '', title: '', year: '' });
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      onUploadSuccess();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your presentation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="glass-card animate-fade-in-up animate-delay-200 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Upload className="h-5 w-5" />
          Upload Your Presentation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input
                id="rollNumber"
                value={formData.rollNumber}
                onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                placeholder="Enter roll number"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title of PPT</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter presentation title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="year">Select Year</Label>
            <Select value={formData.year} onValueChange={(value) => handleInputChange('year', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1st Year">1st Year</SelectItem>
                <SelectItem value="2nd Year">2nd Year</SelectItem>
                <SelectItem value="3rd Year">3rd Year</SelectItem>
                <SelectItem value="4th Year">4th Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">Upload File (.ppt, .pptx)</Label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">.PPT or .PPTX files only</p>
                  {file && <p className="mt-2 text-sm text-primary font-medium">{file.name}</p>}
                </div>
                <input
                  id="file"
                  type="file"
                  className="hidden"
                  accept=".ppt,.pptx"
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isUploading}
            size="lg"
          >
            {isUploading ? "Uploading..." : "Submit Presentation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UploadForm;
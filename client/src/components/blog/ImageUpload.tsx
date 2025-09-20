import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, X, ExternalLink } from "lucide-react";

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  className?: string;
}

export default function ImageUpload({ 
  currentImageUrl, 
  onImageUploaded, 
  onImageRemoved,
  className = ""
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (PNG, JPG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 80));
      }, 100);

      // Get upload URL from backend
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Add Authorization header with token for authentication
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/blog-images/upload", {
        method: "POST",
        headers,
        credentials: 'include',
        body: JSON.stringify({
          contentType: file.type,
          prefix: 'blog-images'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL } = await response.json();

      // Upload file directly to object storage
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Extract the file URL from the upload URL (remove query parameters)
      const fileUrl = uploadURL.split('?')[0];
      
      toast({
        title: "Upload Successful",
        description: "Your image has been uploaded successfully",
      });

      onImageUploaded(fileUrl);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    onImageRemoved?.();
    toast({
      title: "Image Removed",
      description: "The image has been removed from your blog post",
    });
  };

  if (currentImageUrl && !isUploading) {
    return (
      <Card className={`relative group ${className}`}>
        <CardContent className="p-4">
          <div className="relative">
            <img 
              src={currentImageUrl} 
              alt="Uploaded content" 
              className="w-full h-auto rounded-lg border border-border"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => window.open(currentImageUrl, '_blank')}
                data-testid="view-image"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={openFileDialog}
                data-testid="replace-image"
              >
                <Upload className="h-4 w-4 mr-1" />
                Replace
              </Button>
              {onImageRemoved && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={removeImage}
                  data-testid="remove-image"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="file-input"
        />
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/20"
          } ${isUploading ? "pointer-events-none" : ""}`}
          data-testid="upload-area"
        >
          {isUploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Uploading image...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Upload Image</h3>
                <p className="text-sm text-muted-foreground">
                  Click to browse or drag and drop your image here
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PNG, JPG, GIF up to 5MB
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="file-input"
        />
      </CardContent>
    </Card>
  );
}
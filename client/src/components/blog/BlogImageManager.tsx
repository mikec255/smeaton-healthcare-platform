import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Star, Trash2, Image as ImageIcon } from "lucide-react";
import { type BlogImage } from "@shared/schema";

interface BlogImageManagerProps {
  images: BlogImage[];
  onImagesChange: (images: BlogImage[]) => void;
}

export default function BlogImageManager({ images, onImagesChange }: BlogImageManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 immediately - NO SERVER UPLOAD NEEDED
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Add new image - NOT automatically featured, user must select featured image manually
      const newImage: BlogImage = {
        id: Math.random().toString(36).substr(2, 9),
        url: base64Data,
        isFeatured: false,
        uploadedAt: new Date().toISOString(),
      };

      const updatedImages = [...images, newImage];
      onImagesChange(updatedImages);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const toggleFeatured = (id: string) => {
    const updatedImages = images.map((img) => ({
      ...img,
      isFeatured: img.id === id,
    }));
    onImagesChange(updatedImages);
  };

  const removeImage = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id);
    // Don't auto-select a new featured image - user must explicitly choose
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Blog Images
        </label>
        <span className="text-xs text-muted-foreground">
          {images.length} image{images.length !== 1 ? "s" : ""} uploaded
        </span>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-4">
          <label 
            className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isUploading ? "Uploading..." : "Click to upload images"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
              data-testid="image-upload-input"
              onClick={(e) => e.stopPropagation()}
            />
          </label>
        </CardContent>
      </Card>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image) => (
            <Card
              key={image.id}
              className={`relative group overflow-hidden ${
                image.isFeatured ? "ring-2 ring-primary" : ""
              }`}
            >
              <CardContent className="p-0">
                <div className="aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={image.url}
                    alt="Blog image"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={image.isFeatured ? "default" : "outline"}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFeatured(image.id);
                    }}
                    className="bg-white text-black hover:bg-gray-100"
                    data-testid={`toggle-featured-${image.id}`}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        image.isFeatured ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    data-testid={`remove-image-${image.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Featured Badge */}
                {image.isFeatured && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary text-white flex gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Featured
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              No images uploaded yet. Upload images to add them to your blog post.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

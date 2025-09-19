import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { type NewsletterBlock } from "@shared/schema";

interface ImageBlockProps {
  block: NewsletterBlock;
  onUpdate: (updates: Partial<NewsletterBlock>) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
  isEditing: boolean;
  onEditToggle: () => void;
}

export function ImageBlock({ 
  block, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect, 
  isEditing, 
  onEditToggle 
}: ImageBlockProps) {
  const content = (block.content || {}) as { 
    src?: string; 
    alt?: string; 
    caption?: string;
    alignment?: 'left' | 'center' | 'right';
    width?: 'small' | 'medium' | 'large' | 'full';
  };

  const handleContentUpdate = (updates: Partial<typeof content>) => {
    onUpdate({
      content: { ...content, ...updates }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Get upload URL
      const response = await fetch('/api/objects/upload', { method: 'POST' });
      const { uploadURL } = await response.json();

      // Upload the file
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (uploadResponse.ok) {
        // Extract the public URL from the upload URL
        const imageUrl = uploadURL.split('?')[0];
        handleContentUpdate({ src: imageUrl });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const getImageWidth = () => {
    switch (content.width) {
      case 'small': return '25%';
      case 'medium': return '50%';
      case 'large': return '75%';
      case 'full': return '100%';
      default: return '100%';
    }
  };

  if (isEditing) {
    return (
      <Card 
        className={`mb-4 border-2 ${isSelected ? 'border-blue-500' : 'border-gray-200'} cursor-pointer`}
        onClick={onSelect}
        data-testid={`image-block-${block.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Image Block</h4>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onEditToggle} data-testid="image-edit-toggle">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} data-testid="image-delete">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Image
              </label>
              <div className="flex gap-2">
                <Input
                  value={content.src || ""}
                  onChange={(e) => handleContentUpdate({ src: e.target.value })}
                  placeholder="Image URL or upload below"
                  data-testid="image-url-input"
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    data-testid="image-file-input"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <Input
                value={content.alt || ""}
                onChange={(e) => handleContentUpdate({ alt: e.target.value })}
                placeholder="Describe the image for accessibility"
                data-testid="image-alt-input"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Caption
              </label>
              <Textarea
                value={content.caption || ""}
                onChange={(e) => handleContentUpdate({ caption: e.target.value })}
                placeholder="Optional image caption"
                rows={2}
                data-testid="image-caption-textarea"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Width
                </label>
                <Select 
                  value={content.width || 'full'} 
                  onValueChange={(value: 'small' | 'medium' | 'large' | 'full') => handleContentUpdate({ width: value })}
                >
                  <SelectTrigger data-testid="image-width-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (25%)</SelectItem>
                    <SelectItem value="medium">Medium (50%)</SelectItem>
                    <SelectItem value="large">Large (75%)</SelectItem>
                    <SelectItem value="full">Full Width</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Alignment
                </label>
                <Select 
                  value={content.alignment || 'center'} 
                  onValueChange={(value: 'left' | 'center' | 'right') => handleContentUpdate({ alignment: value })}
                >
                  <SelectTrigger data-testid="image-alignment-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      className={`mb-4 p-4 border-2 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent'} 
        cursor-pointer rounded-lg hover:border-gray-300 transition-colors`}
      onClick={onSelect}
      data-testid={`image-block-preview-${block.id}`}
    >
      <div className={`${
        content.alignment === 'center' ? 'text-center' : 
        content.alignment === 'right' ? 'text-right' : 'text-left'
      }`}>
        {content.src ? (
          <img 
            src={content.src} 
            alt={content.alt || "Image"} 
            className="max-w-full h-auto rounded"
            style={{ width: getImageWidth() }}
          />
        ) : (
          <div 
            className="bg-muted border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex flex-col items-center justify-center"
            style={{ width: getImageWidth(), margin: content.alignment === 'center' ? '0 auto' : content.alignment === 'right' ? '0 0 0 auto' : '0' }}
          >
            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No image selected</p>
          </div>
        )}
        {content.caption && (
          <p className="text-sm text-muted-foreground mt-2 italic">
            {content.caption}
          </p>
        )}
      </div>
    </div>
  );
}
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Trash2, Bold, Italic, Link } from "lucide-react";
import { type NewsletterBlock } from "@shared/schema";
import { createSafeFormattedHTML } from "@/lib/utils";

interface TextBlockProps {
  block: NewsletterBlock;
  onUpdate: (updates: Partial<NewsletterBlock>) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
  isEditing: boolean;
  onEditToggle: () => void;
}

export function TextBlock({ 
  block, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect, 
  isEditing, 
  onEditToggle 
}: TextBlockProps) {
  const content = (block.content || {}) as { 
    text?: string; 
    alignment?: 'left' | 'center' | 'right' | 'justify';
    fontSize?: 'small' | 'medium' | 'large';
  };

  const handleContentUpdate = (updates: Partial<typeof content>) => {
    onUpdate({
      content: { ...content, ...updates }
    });
  };


  if (isEditing) {
    return (
      <Card 
        className={`mb-4 border-2 ${isSelected ? 'border-blue-500' : 'border-gray-200'} cursor-pointer`}
        onClick={onSelect}
        data-testid={`text-block-${block.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Text Block</h4>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onEditToggle} data-testid="text-edit-toggle">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} data-testid="text-delete">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Content
              </label>
              <Textarea
                value={content.text || ""}
                onChange={(e) => handleContentUpdate({ text: e.target.value })}
                placeholder="Enter your text content here. Use **bold**, *italic*, and [link text](url) for formatting."
                rows={4}
                data-testid="text-content-textarea"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatting: **bold**, *italic*, [link text](url)
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Font Size
                </label>
                <Select 
                  value={content.fontSize || 'medium'} 
                  onValueChange={(value: 'small' | 'medium' | 'large') => handleContentUpdate({ fontSize: value })}
                >
                  <SelectTrigger data-testid="text-fontsize-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Alignment
                </label>
                <Select 
                  value={content.alignment || 'left'} 
                  onValueChange={(value: 'left' | 'center' | 'right' | 'justify') => handleContentUpdate({ alignment: value })}
                >
                  <SelectTrigger data-testid="text-alignment-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="justify">Justify</SelectItem>
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
      data-testid={`text-block-preview-${block.id}`}
    >
      <div 
        className={`text-foreground whitespace-pre-wrap leading-relaxed ${
          content.alignment === 'center' ? 'text-center' : 
          content.alignment === 'right' ? 'text-right' : 
          content.alignment === 'justify' ? 'text-justify' : 'text-left'
        } ${
          content.fontSize === 'small' ? 'text-sm' :
          content.fontSize === 'large' ? 'text-lg' : 'text-base'
        }`}
        dangerouslySetInnerHTML={createSafeFormattedHTML(content.text || "Add your text content here...")}
      />
    </div>
  );
}
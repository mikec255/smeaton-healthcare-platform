import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Trash2 } from "lucide-react";
import { type NewsletterBlock } from "@shared/schema";
import { RichTextEditor } from "@/components/blog/RichTextEditor";

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
    html?: string;
  };

  const handleContentUpdate = (html: string) => {
    onUpdate({
      content: { ...content, html, text: html }
    });
  };

  if (isEditing) {
    return (
      <Card 
        className={`mb-4 border-2 ${isSelected ? 'border-blue-500' : 'border-gray-200'} cursor-pointer`}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('.ProseMirror')) return;
          onSelect();
        }}
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
          
          <RichTextEditor
            content={content.html || content.text || ''}
            onChange={handleContentUpdate}
            placeholder="Start typing your content..."
          />
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
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: content.html || content.text || '<p>Add your text content here...</p>' }}
      />
    </div>
  );
}

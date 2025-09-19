import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
  SortableContext as SortableProvider,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Type, 
  Heading1, 
  Heading2, 
  Image as ImageIcon, 
  Quote, 
  List, 
  Minus, 
  Space, 
  MousePointer,
  Plus,
  GripVertical,
  Trash2,
  Palette,
  Settings
} from "lucide-react";
import { type BlogBlock, type BlogBlockType } from "@shared/schema";
import BlockStylePanel from "./BlockStylePanel";
import ImageUpload from "./ImageUpload";

interface BlogVisualEditorProps {
  blocks: BlogBlock[];
  onChange: (blocks: BlogBlock[]) => void;
}

interface BlogVisualEditorState {
  selectedBlockId: string | null;
  styleEditorOpen: boolean;
}

// Block type definitions with their configurations
const BLOCK_TYPES: Array<{
  type: BlogBlockType;
  icon: React.ReactNode;
  label: string;
  description: string;
}> = [
  {
    type: "header",
    icon: <Heading1 className="h-4 w-4" />,
    label: "Header",
    description: "Add a main heading"
  },
  {
    type: "text",
    icon: <Type className="h-4 w-4" />,
    label: "Text",
    description: "Add paragraph text"
  },
  {
    type: "image",
    icon: <ImageIcon className="h-4 w-4" />,
    label: "Image",
    description: "Add an image"
  },
  {
    type: "quote",
    icon: <Quote className="h-4 w-4" />,
    label: "Quote",
    description: "Add a quote or testimonial"
  },
  {
    type: "list",
    icon: <List className="h-4 w-4" />,
    label: "List",
    description: "Add a bullet or numbered list"
  },
  {
    type: "divider",
    icon: <Minus className="h-4 w-4" />,
    label: "Divider",
    description: "Add a visual separator"
  },
  {
    type: "spacer",
    icon: <Space className="h-4 w-4" />,
    label: "Spacer",
    description: "Add white space"
  },
  {
    type: "button",
    icon: <MousePointer className="h-4 w-4" />,
    label: "Button",
    description: "Add a call-to-action button"
  }
];

// Individual sortable block component
function SortableBlock({ 
  block, 
  onUpdate, 
  onDelete,
  onStyleEdit
}: { 
  block: BlogBlock; 
  onUpdate: (block: BlogBlock) => void;
  onDelete: (id: string) => void;
  onStyleEdit: (blockId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className="mb-4 border border-border hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          {/* Drag handle and controls */}
          <div className="flex items-center justify-between mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing p-1 hover:bg-muted rounded"
                data-testid={`drag-handle-${block.id}`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>
              <Badge variant="secondary" className="text-xs">
                {BLOCK_TYPES.find(t => t.type === block.type)?.label}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onStyleEdit(block.id)}
                className="h-8 w-8 p-0"
                data-testid={`style-${block.id}`}
              >
                <Palette className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {/* TODO: Open settings */}}
                className="h-8 w-8 p-0"
                data-testid={`settings-${block.id}`}
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(block.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                data-testid={`delete-${block.id}`}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Block content rendering */}
          <BlockRenderer block={block} onUpdate={onUpdate} />
        </CardContent>
      </Card>
    </div>
  );
}

// Block content renderer based on type
function BlockRenderer({ 
  block, 
  onUpdate 
}: { 
  block: BlogBlock; 
  onUpdate: (block: BlogBlock) => void;
}) {
  const updateContent = (newContent: Partial<typeof block.content>) => {
    onUpdate({
      ...block,
      content: { ...block.content, ...newContent }
    });
  };

  switch (block.type) {
    case "header":
      return (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Enter header text..."
            value={block.content.text || ""}
            onChange={(e) => updateContent({ text: e.target.value })}
            className="w-full text-2xl font-bold bg-transparent border-none outline-none resize-none"
            style={block.style}
            data-testid={`header-input-${block.id}`}
          />
          <select
            value={block.content.level || "h1"}
            onChange={(e) => updateContent({ level: e.target.value })}
            className="text-sm border border-border rounded px-2 py-1"
            data-testid={`header-level-${block.id}`}
          >
            <option value="h1">H1 - Main Heading</option>
            <option value="h2">H2 - Sub Heading</option>
            <option value="h3">H3 - Section Heading</option>
          </select>
        </div>
      );

    case "text":
      return (
        <textarea
          placeholder="Enter your text content..."
          value={block.content.text || ""}
          onChange={(e) => updateContent({ text: e.target.value })}
          rows={4}
          className="w-full bg-transparent border-none outline-none resize-none"
          style={block.style}
          data-testid={`text-input-${block.id}`}
        />
      );

    case "image":
      return (
        <div className="space-y-3" style={block.style}>
          <ImageUpload
            currentImageUrl={block.content.url}
            onImageUploaded={(url) => updateContent({ url })}
            onImageRemoved={() => updateContent({ url: "" })}
          />
          <input
            type="text"
            placeholder="Alt text (for accessibility)"
            value={block.content.alt || ""}
            onChange={(e) => updateContent({ alt: e.target.value })}
            className="w-full text-sm border border-border rounded px-3 py-2"
            data-testid={`image-alt-${block.id}`}
          />
        </div>
      );

    case "quote":
      return (
        <div className="space-y-2">
          <textarea
            placeholder="Enter quote text..."
            value={block.content.text || ""}
            onChange={(e) => updateContent({ text: e.target.value })}
            rows={3}
            className="w-full bg-transparent border-l-4 border-primary pl-4 italic text-lg resize-none outline-none"
            style={block.style}
            data-testid={`quote-input-${block.id}`}
          />
          <input
            type="text"
            placeholder="Quote author (optional)"
            value={block.content.author || ""}
            onChange={(e) => updateContent({ author: e.target.value })}
            className="w-full text-sm border border-border rounded px-3 py-2"
            data-testid={`quote-author-${block.id}`}
          />
        </div>
      );

    case "list":
      return (
        <div className="space-y-2">
          <select
            value={block.content.listType || "bullet"}
            onChange={(e) => updateContent({ listType: e.target.value })}
            className="text-sm border border-border rounded px-2 py-1"
            data-testid={`list-type-${block.id}`}
          >
            <option value="bullet">Bullet List</option>
            <option value="numbered">Numbered List</option>
          </select>
          <textarea
            placeholder="Enter list items (one per line)..."
            value={block.content.items?.join('\n') || ""}
            onChange={(e) => updateContent({ items: e.target.value.split('\n').filter(Boolean) })}
            rows={4}
            className="w-full bg-transparent border-none outline-none resize-none"
            style={block.style}
            data-testid={`list-input-${block.id}`}
          />
        </div>
      );

    case "divider":
      return (
        <div className="py-4">
          <hr className="border-border" style={block.style} />
          <p className="text-xs text-muted-foreground text-center mt-2">Divider</p>
        </div>
      );

    case "spacer":
      return (
        <div 
          className="bg-muted/20 border border-dashed border-muted-foreground/30 rounded flex items-center justify-center"
          style={{ height: block.content.height || "40px", ...block.style }}
        >
          <span className="text-xs text-muted-foreground">
            Spacer ({block.content.height || "40px"})
          </span>
        </div>
      );

    case "button":
      return (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Button text..."
            value={block.content.text || ""}
            onChange={(e) => updateContent({ text: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
            data-testid={`button-text-${block.id}`}
          />
          <input
            type="url"
            placeholder="Button link (URL)..."
            value={block.content.url || ""}
            onChange={(e) => updateContent({ url: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
            data-testid={`button-url-${block.id}`}
          />
          <div className="flex justify-center">
            <Button style={block.style} data-testid={`button-preview-${block.id}`}>
              {block.content.text || "Button"}
            </Button>
          </div>
        </div>
      );

    default:
      return <div>Unknown block type: {block.type}</div>;
  }
}

export default function BlogVisualEditor({ blocks, onChange }: BlogVisualEditorProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [styleEditorOpen, setStyleEditorOpen] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedBlock = selectedBlockId ? blocks.find(b => b.id === selectedBlockId) : null;

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex(block => block.id === active.id);
      const newIndex = blocks.findIndex(block => block.id === over?.id);
      
      const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
        ...block,
        order: index
      }));
      
      onChange(reorderedBlocks);
    }
  }, [blocks, onChange]);

  const addBlock = useCallback((type: BlogBlockType) => {
    const newBlock: BlogBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      style: {},
      order: blocks.length
    };
    
    onChange([...blocks, newBlock]);
  }, [blocks, onChange]);

  const updateBlock = useCallback((updatedBlock: BlogBlock) => {
    onChange(blocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    ));
  }, [blocks, onChange]);

  const deleteBlock = useCallback((blockId: string) => {
    onChange(blocks.filter(block => block.id !== blockId));
  }, [blocks, onChange]);

  return (
    <div className="flex gap-6 h-full relative">
      {/* Block Palette */}
      <div className="w-64 shrink-0 border-r border-border p-4">
        <h3 className="font-semibold mb-4">Add Blocks</h3>
        <div className="space-y-2">
          {BLOCK_TYPES.map((blockType) => (
            <Button
              key={blockType.type}
              variant="outline"
              className="w-full justify-start h-auto p-3"
              onClick={() => addBlock(blockType.type)}
              data-testid={`add-${blockType.type}-block`}
            >
              <div className="flex items-start gap-3">
                {blockType.icon}
                <div className="text-left">
                  <div className="font-medium">{blockType.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {blockType.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {blocks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Type className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Start building your blog post</h3>
              <p>Add blocks from the left panel to create your content</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={blocks.map(block => block.id)}
                strategy={verticalListSortingStrategy}
              >
                {blocks
                  .sort((a, b) => a.order - b.order)
                  .map((block) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      onUpdate={updateBlock}
                      onDelete={deleteBlock}
                      onStyleEdit={(blockId) => {
                        setSelectedBlockId(blockId);
                        setStyleEditorOpen(true);
                      }}
                    />
                  ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Style Panel */}
      {styleEditorOpen && selectedBlock && (
        <div className="fixed top-0 right-0 h-full z-50 bg-background border-l border-border shadow-lg">
          <BlockStylePanel
            block={selectedBlock}
            onUpdate={updateBlock}
            onClose={() => {
              setStyleEditorOpen(false);
              setSelectedBlockId(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

// Helper function to get default content for each block type
function getDefaultContent(type: BlogBlockType): Record<string, any> {
  switch (type) {
    case "header":
      return { text: "", level: "h1" };
    case "text":
      return { text: "" };
    case "image":
      return { url: "", alt: "" };
    case "quote":
      return { text: "", author: "" };
    case "list":
      return { items: [], listType: "bullet" };
    case "divider":
      return {};
    case "spacer":
      return { height: "40px" };
    case "button":
      return { text: "", url: "" };
    default:
      return {};
  }
}
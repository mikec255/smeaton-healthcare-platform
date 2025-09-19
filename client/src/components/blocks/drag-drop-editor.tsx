import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GripVertical, AlertCircle } from "lucide-react";
import { type NewsletterBlock } from "@shared/schema";
import { BlockRenderer } from "./block-renderer";
import { BlockPalette } from "./block-palette";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SortableBlockItemProps {
  block: NewsletterBlock;
  onUpdate: (blockId: string, updates: Partial<NewsletterBlock>) => void;
  onDelete: (blockId: string) => void;
  isSelected: boolean;
  onSelect: (blockId: string | null) => void;
  isEditing: boolean;
  onEditToggle: (blockId: string) => void;
}

function SortableBlockItem({
  block,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
  isEditing,
  onEditToggle,
}: SortableBlockItemProps) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing 
          opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded border shadow-sm p-1"
        data-testid={`drag-handle-${block.id}`}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      {/* Block Content */}
      <div className="pl-8">
        <BlockRenderer
          block={block}
          onUpdate={(updates) => onUpdate(block.id, updates)}
          onDelete={() => onDelete(block.id)}
          isSelected={isSelected}
          onSelect={() => onSelect(isSelected ? null : block.id)}
          isEditing={isEditing}
          onEditToggle={() => onEditToggle(block.id)}
        />
      </div>
    </div>
  );
}

interface DragDropEditorProps {
  newsletterId: string | null;
  blocks: NewsletterBlock[];
  onBlocksChange: () => void;
}

export function DragDropEditor({ newsletterId, blocks, onBlocksChange }: DragDropEditorProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mutations for block operations
  const addBlockMutation = useMutation({
    mutationFn: async ({ type, position }: { type: string; position: number }) => {
      if (!newsletterId) throw new Error("Newsletter ID required");
      
      const defaultContent = getDefaultBlockContent(type);
      
      return apiRequest("POST", `/api/newsletters/${newsletterId}/blocks`, {
        type,
        content: defaultContent,
        position,
      });
    },
    onSuccess: () => {
      onBlocksChange();
      toast({
        title: "Block added",
        description: "New block has been added to your newsletter.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add block. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateBlockMutation = useMutation({
    mutationFn: async ({ blockId, updates }: { blockId: string; updates: Partial<NewsletterBlock> }) => {
      if (!newsletterId) throw new Error("Newsletter ID required");
      
      return apiRequest("PUT", `/api/newsletters/${newsletterId}/blocks/${blockId}`, updates);
    },
    onSuccess: () => {
      onBlocksChange();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update block. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      if (!newsletterId) throw new Error("Newsletter ID required");
      
      return apiRequest("DELETE", `/api/newsletters/${newsletterId}/blocks/${blockId}`);
    },
    onSuccess: () => {
      onBlocksChange();
      setSelectedBlockId(null);
      setEditingBlockId(null);
      toast({
        title: "Block deleted",
        description: "Block has been removed from your newsletter.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete block. Please try again.",
        variant: "destructive",
      });
    },
  });

  const reorderBlocksMutation = useMutation({
    mutationFn: async (reorderedBlocks: NewsletterBlock[]) => {
      if (!newsletterId) throw new Error("Newsletter ID required");
      
      // Update positions for all blocks
      const updates = reorderedBlocks.map((block, index) => 
        apiRequest("PUT", `/api/newsletters/${newsletterId}/blocks/${block.id}`, {
          position: index
        })
      );
      
      return Promise.all(updates);
    },
    onSuccess: () => {
      onBlocksChange();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reorder blocks. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getDefaultBlockContent = (type: string): Record<string, any> => {
    switch (type) {
      case "heading":
        return { text: "New Heading", level: 2, alignment: "left" };
      case "text":
        return { text: "Add your text content here...", alignment: "left", fontSize: "medium" };
      case "image":
        return { src: "", alt: "", caption: "", alignment: "center", width: "full" };
      case "button":
        return { text: "Click Here", url: "#", alignment: "center", style: "primary", size: "medium" };
      case "divider":
        return { style: "solid", thickness: 1, color: "#e2e8f0", width: "full", alignment: "center" };
      case "spacer":
        return { height: 32 };
      case "html":
        return { html: "<p>Enter your HTML content here...</p>" };
      default:
        return {};
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const oldIndex = blocks.findIndex(block => block.id === active.id);
    const newIndex = blocks.findIndex(block => block.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex);
      reorderBlocksMutation.mutate(reorderedBlocks);
    }
    
    setActiveId(null);
  };

  const handleAddBlock = useCallback((type: string) => {
    if (!newsletterId) {
      toast({
        title: "Save newsletter first",
        description: "Please save your newsletter before adding blocks.",
        variant: "destructive",
      });
      return;
    }
    
    const nextPosition = blocks.length > 0 ? Math.max(...blocks.map(b => b.position)) + 1 : 0;
    addBlockMutation.mutate({ type, position: nextPosition });
  }, [newsletterId, blocks, addBlockMutation, toast]);

  const handleUpdateBlock = useCallback((blockId: string, updates: Partial<NewsletterBlock>) => {
    updateBlockMutation.mutate({ blockId, updates });
  }, [updateBlockMutation]);

  const handleDeleteBlock = useCallback((blockId: string) => {
    deleteBlockMutation.mutate(blockId);
  }, [deleteBlockMutation]);

  const handleEditToggle = useCallback((blockId: string) => {
    setEditingBlockId(editingBlockId === blockId ? null : blockId);
  }, [editingBlockId]);

  const activeBlock = activeId ? blocks.find(block => block.id === activeId) : null;

  if (!newsletterId) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please save your newsletter first to start adding content blocks.
            </AlertDescription>
          </Alert>
        </div>
        <div className="lg:col-span-1">
          <BlockPalette onAddBlock={handleAddBlock} isDisabled={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" data-testid="drag-drop-editor">
      {/* Main Editor Area */}
      <div className="lg:col-span-3">
        <Card className="min-h-96">
          <CardContent className="p-6">
            {blocks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="space-y-3">
                  <p className="text-lg font-medium">Start building your newsletter</p>
                  <p className="text-sm">Drag blocks from the palette to get started</p>
                </div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-0">
                    {blocks.map((block) => (
                      <SortableBlockItem
                        key={block.id}
                        block={block}
                        onUpdate={handleUpdateBlock}
                        onDelete={handleDeleteBlock}
                        isSelected={selectedBlockId === block.id}
                        onSelect={setSelectedBlockId}
                        isEditing={editingBlockId === block.id}
                        onEditToggle={handleEditToggle}
                      />
                    ))}
                  </div>
                </SortableContext>
                
                <DragOverlay>
                  {activeBlock ? (
                    <div className="opacity-90">
                      <BlockRenderer
                        block={activeBlock}
                        onUpdate={() => {}}
                        onDelete={() => {}}
                        isSelected={false}
                        onSelect={() => {}}
                        isEditing={false}
                        onEditToggle={() => {}}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Block Palette Sidebar */}
      <div className="lg:col-span-1">
        <BlockPalette onAddBlock={handleAddBlock} isDisabled={!newsletterId} />
      </div>
    </div>
  );
}
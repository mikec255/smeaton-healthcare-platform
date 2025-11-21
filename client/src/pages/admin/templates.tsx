import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Copy } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertTemplateSchema, type BlogBlock } from "@shared/schema";
import { z } from "zod";
import BlogVisualEditor from "@/components/blog/BlogVisualEditor";

const templateSchema = insertTemplateSchema.extend({
  name: z.string().min(1, "Template name is required"),
});

type TemplateFormData = z.infer<typeof templateSchema>;

// Pre-built template for Employee of the Month
const EMPLOYEE_OF_MONTH_TEMPLATE: BlogBlock[] = [
  {
    id: "1",
    type: "header",
    content: { level: "h1", text: "Employee of the Month" },
    order: 1,
  },
  {
    id: "2",
    type: "spacer",
    content: { height: "20px" },
    order: 2,
  },
  {
    id: "3",
    type: "image",
    content: { src: "", alt: "Employee photo", caption: "" },
    imageWidth: "medium",
    order: 3,
  },
  {
    id: "4",
    type: "spacer",
    content: { height: "20px" },
    order: 4,
  },
  {
    id: "5",
    type: "text",
    content: { text: "[Employee Name] - [Position]" },
    order: 5,
  },
  {
    id: "6",
    type: "header",
    content: { level: "h2", text: "Manager's Comment" },
    order: 7,
  },
  {
    id: "7",
    type: "text",
    content: { text: "[Insert manager's comment about the employee's performance and impact]" },
    order: 8,
  },
  {
    id: "8",
    type: "header",
    content: { level: "h2", text: "Employee's Statement" },
    order: 9,
  },
  {
    id: "9",
    type: "text",
    content: { text: "[Insert employee's thoughts, achievements, and gratitude]" },
    order: 10,
  },
  {
    id: "10",
    type: "header",
    content: { level: "h2", text: "Key Achievements" },
    order: 11,
  },
  {
    id: "11",
    type: "list",
    content: { items: ["Achievement 1", "Achievement 2", "Achievement 3"], ordered: false },
    order: 12,
  },
];

export default function TemplatesAdmin() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [templateBlocks, setTemplateBlocks] = useState<BlogBlock[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateFormData | null>(null);
  const { toast } = useToast();

  const { data: templates = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/templates"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      return apiRequest("POST", "/api/templates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setIsCreateModalOpen(false);
      form.reset();
      setTemplateBlocks([]);
      toast({
        title: "Success",
        description: "Template created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    },
  });

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      blocks: [],
    },
  });

  const handleCreatePost = (data: TemplateFormData) => {
    createMutation.mutate({
      ...data,
      blocks: templateBlocks as any,
    });
  };

  const loadEmployeeTemplate = () => {
    setTemplateBlocks(EMPLOYEE_OF_MONTH_TEMPLATE);
    form.setValue("name", "Employee of the Month");
    form.setValue(
      "description",
      "Template for monthly employee recognition featuring employee photo, manager comment, employee statement, and achievements"
    );
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Templates</h1>
          <p className="text-muted-foreground mt-2">Create and manage reusable blog post templates</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-template">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreatePost)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Employee of the Month" data-testid="input-template-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Describe what this template is used for"
                          data-testid="input-template-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Template Content</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadEmployeeTemplate}
                      data-testid="button-load-employee-template"
                    >
                      Load Employee of Month Template
                    </Button>
                  </div>

                  <div className="border border-border rounded-lg p-4 min-h-[400px]">
                    <BlogVisualEditor
                      blocks={templateBlocks}
                      onChange={setTemplateBlocks}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-template">
                    {createMutation.isPending ? "Creating..." : "Create Template"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading templates...</p>
        ) : templates.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No templates yet. Create one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          templates.map((template: any) => (
            <Card key={template.id} data-testid={`template-${template.id}`}>
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{template.description}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setTemplateBlocks(template.blocks || []);
                    }}
                    data-testid={`button-edit-${template.id}`}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    data-testid={`button-delete-${template.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

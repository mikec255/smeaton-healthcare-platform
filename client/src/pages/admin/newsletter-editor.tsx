import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Save, 
  Send, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  FileText
} from "lucide-react";
import { insertNewsletterSchema, type Newsletter, type NewsletterBlock, type InsertNewsletter } from "@shared/schema";
import { DragDropEditor } from "@/components/blocks/drag-drop-editor";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { createSafeHTML, createSafeFormattedHTML } from "@/lib/utils";

// Form schema extending the insertNewsletterSchema
const newsletterFormSchema = insertNewsletterSchema.extend({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

type NewsletterFormData = z.infer<typeof newsletterFormSchema>;


export default function NewsletterEditor() {
  const [match, params] = useRoute("/admin/newsletters/:id/edit");
  const isEditing = params?.id && params.id !== "new";
  const newsletterId = params?.id === "new" ? null : params?.id;
  
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // Query for existing newsletter
  const { data: newsletter, isLoading: isLoadingNewsletter } = useQuery<Newsletter>({
    queryKey: ["/api/newsletters", newsletterId],
    enabled: Boolean(newsletterId && isEditing),
  });

  // Query for newsletter blocks
  const { data: blocks = [], isLoading: isLoadingBlocks } = useQuery<NewsletterBlock[]>({
    queryKey: ["/api/newsletters", newsletterId, "blocks"],
    enabled: !!newsletterId,
  });

  // Initialize form with existing data or defaults
  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      status: "draft",
      subject: "",
      preheader: "",
    },
  });

  // Update form when newsletter data loads
  useEffect(() => {
    if (newsletter) {
      form.reset({
        title: newsletter.title,
        slug: newsletter.slug,
        status: newsletter.status,
        subject: newsletter.subject || "",
        preheader: newsletter.preheader || "",
      });
    }
  }, [newsletter, form]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Auto-generate slug when title changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "title" && value.title && !isEditing) {
        const slug = generateSlug(value.title);
        form.setValue("slug", slug);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isEditing]);

  // Save newsletter mutation
  const saveNewsletterMutation = useMutation({
    mutationFn: async (data: NewsletterFormData): Promise<Newsletter> => {
      let response: Response;
      if (isEditing && newsletterId) {
        response = await apiRequest("PUT", `/api/newsletters/${newsletterId}`, data);
      } else {
        response = await apiRequest("POST", "/api/newsletters", data);
      }
      return await response.json();
    },
    onSuccess: (savedNewsletter: Newsletter) => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletters"] });
      if (!isEditing) {
        // Redirect to edit mode for newly created newsletter
        window.location.href = `/admin/newsletters/${savedNewsletter.id}/edit`;
      }
      toast({
        title: "Newsletter saved",
        description: `Newsletter "${form.getValues("title")}" has been saved successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save newsletter. Please try again.",
        variant: "destructive",
      });
    },
  });


  const handleSave = (status: "draft" | "published" = "draft") => {
    const data = { ...form.getValues(), status };
    saveNewsletterMutation.mutate(data);
  };

  const handleBlocksChange = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/newsletters", newsletterId, "blocks"] });
  };

  const renderBlockPreview = (block: NewsletterBlock) => {
    const content = block.content || {};
    
    switch (block.type) {
      case "heading":
        const HeadingTag = `h${content.level || 2}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag 
            className={`font-bold text-foreground mb-2 ${
              content.alignment === 'center' ? 'text-center' : 
              content.alignment === 'right' ? 'text-right' : 'text-left'
            }`}
            style={{
              fontSize: content.level === 1 ? '2rem' : 
                       content.level === 2 ? '1.5rem' : 
                       content.level === 3 ? '1.25rem' : 
                       content.level === 4 ? '1.125rem' : 
                       content.level === 5 ? '1rem' : '0.875rem'
            }}
          >
            {content.text || "Heading"}
          </HeadingTag>
        );
      case "text":
        return (
          <div 
            className={`text-foreground whitespace-pre-wrap mb-4 leading-relaxed ${
              content.alignment === 'center' ? 'text-center' : 
              content.alignment === 'right' ? 'text-right' : 
              content.alignment === 'justify' ? 'text-justify' : 'text-left'
            } ${
              content.fontSize === 'small' ? 'text-sm' :
              content.fontSize === 'large' ? 'text-lg' : 'text-base'
            }`}
            dangerouslySetInnerHTML={createSafeFormattedHTML(content.text || "Text content")}
          />
        );
      case "image":
        const getImageWidth = () => {
          switch (content.width) {
            case 'small': return '25%';
            case 'medium': return '50%';
            case 'large': return '75%';
            default: return '100%';
          }
        };
        return (
          <div className={`mb-4 ${
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
                className="bg-muted border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center"
                style={{ width: getImageWidth(), margin: content.alignment === 'center' ? '0 auto' : content.alignment === 'right' ? '0 0 0 auto' : '0' }}
              >
                <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No image selected</p>
              </div>
            )}
            {content.caption && (
              <p className="text-sm text-muted-foreground mt-2 italic">{content.caption}</p>
            )}
          </div>
        );
      case "button":
        const getButtonVariant = () => {
          switch (content.style) {
            case 'secondary': return 'secondary';
            case 'outline': return 'outline';
            case 'ghost': return 'ghost';
            default: return 'default';
          }
        };
        const getButtonSize = () => {
          switch (content.size) {
            case 'small': return 'sm';
            case 'large': return 'lg';
            default: return 'default';
          }
        };
        return (
          <div className={`mb-4 ${
            content.alignment === 'center' ? 'text-center' : 
            content.alignment === 'right' ? 'text-right' : 'text-left'
          }`}>
            <Button variant={getButtonVariant()} size={getButtonSize()}>
              {content.text || "Button"}
            </Button>
          </div>
        );
      case "divider":
        const getDividerStyles = () => {
          const thickness = content.thickness || 1;
          const color = content.color || '#e2e8f0';
          const style = content.style || 'solid';
          return {
            borderTopWidth: `${thickness}px`,
            borderTopStyle: style,
            borderTopColor: color,
          };
        };
        const getDividerWidth = () => {
          switch (content.width) {
            case '75': return '75%';
            case '50': return '50%';
            case '25': return '25%';
            default: return '100%';
          }
        };
        return (
          <div className={`my-4 flex ${
            content.alignment === 'center' ? 'justify-center' : 
            content.alignment === 'right' ? 'justify-end' : 'justify-start'
          }`}>
            <div
              style={{
                width: getDividerWidth(),
                ...getDividerStyles(),
              }}
              className="border-t"
            />
          </div>
        );
      case "spacer":
        return <div style={{ height: `${content.height || 32}px` }} />;
      case "html":
        return (
          <div 
            className="prose prose-sm max-w-none mb-4"
            dangerouslySetInnerHTML={createSafeHTML(content.html || "<p>Empty HTML block</p>")}
          />
        );
      default:
        return (
          <div className="bg-muted p-4 rounded text-center text-muted-foreground mb-4">
            Unknown block type: {block.type}
          </div>
        );
    }
  };

  if (isLoadingNewsletter && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-2">Loading newsletter...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="newsletter-editor-page">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/newsletters" data-testid="back-to-newsletters">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Newsletters
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground" data-testid="newsletter-editor-title">
            {isEditing ? `Edit Newsletter` : "Create New Newsletter"}
          </h1>
          {newsletter && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={newsletter.status === "published" ? "default" : "secondary"}>
                {newsletter.status}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground font-mono text-sm">{newsletter.slug}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            data-testid="toggle-preview-button"
          >
            {previewMode ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button
            onClick={() => handleSave("draft")}
            disabled={saveNewsletterMutation.isPending}
            data-testid="save-draft-button"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave("published")}
            disabled={saveNewsletterMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
            data-testid="publish-button"
          >
            <Send className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {previewMode ? (
            /* Preview Mode */
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Newsletter Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border" data-testid="newsletter-preview">
                  {form.watch("subject") && (
                    <h1 className="text-2xl font-bold mb-4">{form.watch("subject")}</h1>
                  )}
                  {form.watch("preheader") && (
                    <p className="text-muted-foreground mb-6">{form.watch("preheader")}</p>
                  )}
                  <div className="space-y-4">
                    {blocks.map((block) => (
                      <div key={block.id}>{renderBlockPreview(block)}</div>
                    ))}
                    {blocks.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="mx-auto h-12 w-12 mb-4" />
                        <p>No blocks added yet. Switch to edit mode to add content.</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Edit Mode */
            <>
              {/* Newsletter Settings */}
              <Card className="shadow-lg mb-6">
                <CardHeader>
                  <CardTitle>Newsletter Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title*</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Newsletter title"
                                  {...field}
                                  data-testid="newsletter-title-input"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug*</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="newsletter-slug"
                                  {...field}
                                  data-testid="newsletter-slug-input"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Subject</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Subject line for email"
                                {...field}
                                value={field.value || ""}
                                data-testid="newsletter-subject-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preheader"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preheader Text</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Preview text shown after subject line"
                                rows={2}
                                {...field}
                                value={field.value || ""}
                                data-testid="newsletter-preheader-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Content Blocks - Drag and Drop Editor */}
              <DragDropEditor 
                newsletterId={newsletterId || null}
                blocks={blocks}
                onBlocksChange={handleBlocksChange}
              />
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Block palette is now integrated in the DragDropEditor component */}

          {/* Newsletter Stats */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Newsletter Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={form.watch("status") === "published" ? "default" : "secondary"}>
                    {form.watch("status")}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Content Blocks</span>
                  <span className="font-medium">{blocks.length}</span>
                </div>
                {newsletter && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium text-sm">
                        {newsletter.createdAt ? new Date(newsletter.createdAt).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="font-medium text-sm">
                        {newsletter.updatedAt ? new Date(newsletter.updatedAt).toLocaleDateString() : '-'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
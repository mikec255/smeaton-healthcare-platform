import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, ArrowLeft, Eye, EyeOff, Upload, Calendar, User, BookOpen, Tag } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type BlogPost, insertBlogPostSchema, insertBlogCategorySchema, blogCategories, type BlogBlock } from "@shared/schema";
import BlogVisualEditor from "@/components/blog/BlogVisualEditor";

type BlogCategory = typeof blogCategories.$inferSelect;
import { z } from "zod";

// Extended schemas for form validation
const createBlogPostSchema = insertBlogPostSchema.extend({
  categoryName: z.string().optional(), // For creating new categories
}).refine(
  (data) => data.categoryId || data.categoryName,
  {
    message: "Either select an existing category or provide a new category name",
    path: ["categoryId"],
  }
);

const createCategorySchema = insertBlogCategorySchema;

type CreateBlogPostData = z.infer<typeof createBlogPostSchema>;
type CreateCategoryData = z.infer<typeof createCategorySchema>;

export default function BlogAdmin() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);
  const [editingBlocks, setEditingBlocks] = useState<BlogBlock[]>([]);
  const [useVisualEditorForCreate, setUseVisualEditorForCreate] = useState(true);
  const [newPostBlocks, setNewPostBlocks] = useState<BlogBlock[]>([]);
  const { toast } = useToast();

  // Fetch blog posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog-categories"],
  });

  // Visual editor functions
  const openVisualEditor = (post?: BlogPost) => {
    if (post?.blocks) {
      setEditingBlocks(post.blocks);
    } else {
      setEditingBlocks([]);
    }
    setSelectedPost(post || null);
    setIsVisualEditorOpen(true);
  };

  const closeVisualEditor = () => {
    setIsVisualEditorOpen(false);
    setEditingBlocks([]);
  };

  // Save and continue editing
  const saveVisualContent = async () => {
    if (!selectedPost) {
      toast({
        title: "Error",
        description: "No post selected for visual editing",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("PUT", `/api/blog-posts/${selectedPost.id}`, {
        blocks: editingBlocks,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      
      toast({
        title: "Content Saved",
        description: "Your changes have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save visual content. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Save and close editor
  const saveAndCloseEditor = async () => {
    if (!selectedPost) {
      toast({
        title: "Error",
        description: "No post selected for visual editing",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("PUT", `/api/blog-posts/${selectedPost.id}`, {
        blocks: editingBlocks,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      closeVisualEditor();
      
      toast({
        title: "Content Saved",
        description: "Your changes have been saved and editor closed",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save visual content. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Create blog post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: CreateBlogPostData) => {
      // Create new category if specified
      if (data.categoryName && !data.categoryId) {
        const response = await apiRequest("POST", "/api/blog-categories", {
          name: data.categoryName,
        });
        const newCategory = await response.json() as BlogCategory;
        data.categoryId = newCategory.id;
      }

      // Remove categoryName from the final payload
      const { categoryName, ...postData } = data;
      
      return apiRequest("POST", "/api/blog-posts", postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog-categories"] });
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      return apiRequest("POST", "/api/blog-categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-categories"] });
      setIsCategoryModalOpen(false);
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });

  // Delete blog post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return apiRequest("DELETE", `/api/blog-posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete blog post",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return apiRequest("DELETE", `/api/blog-categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-categories"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  // Publish/unpublish blog post mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ postId, isPublished }: { postId: string; isPublished: boolean }) => {
      if (isPublished) {
        return apiRequest("POST", `/api/blog-posts/${postId}/publish`);
      } else {
        return apiRequest("PUT", `/api/blog-posts/${postId}`, { isPublished: false });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update blog post",
        variant: "destructive",
      });
    },
  });

  // Form setup
  const form = useForm<CreateBlogPostData>({
    resolver: zodResolver(createBlogPostSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      slug: "",
      categoryId: undefined,
      categoryName: "",
      author: "",
      isPublished: false,
      imagePath: "",
    },
  });

  const categoryForm = useForm<CreateCategoryData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onCreatePost = (data: CreateBlogPostData) => {
    // Add blocks to the post data if using visual editor
    const postData = useVisualEditorForCreate 
      ? { ...data, blocks: newPostBlocks }
      : data;
    
    createPostMutation.mutate(postData);
  };

  const onCreateCategory = (data: CreateCategoryData) => {
    createCategoryMutation.mutate(data);
  };

  const handleDeletePost = (postId: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      deletePostMutation.mutate(postId);
    }
  };

  const handleTogglePublish = (postId: string, currentStatus: boolean) => {
    togglePublishMutation.mutate({ postId, isPublished: !currentStatus });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category? This may affect associated blog posts.")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Watch title changes to auto-generate slug
  const watchTitle = form.watch("title");
  
  useEffect(() => {
    const slug = form.getValues("slug");
    const title = form.getValues("title");
    if (title && !slug) {
      form.setValue("slug", generateSlug(title));
    }
  }, [watchTitle, form]);

  // Visual Editor Modal
  if (isVisualEditorOpen) {
    return (
      <div className="fixed inset-0 bg-background z-[100] flex flex-col">
        {/* Visual Editor Header */}
        <div 
          className="w-full bg-red-500 p-6 border-4 border-yellow-400" 
          style={{ 
            position: "relative", 
            zIndex: 9999, 
            background: "red",
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
            minHeight: "80px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div>
              <button
                onClick={closeVisualEditor}
                style={{ 
                  background: "white", 
                  color: "black", 
                  padding: "10px 20px", 
                  border: "none", 
                  borderRadius: "5px",
                  fontSize: "16px",
                  cursor: "pointer"
                }}
                data-testid="close-visual-editor"
              >
                ← Back to Blog List
              </button>
              <span style={{ marginLeft: "20px" }}>Visual Blog Editor - DEBUG HEADER</span>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  toast({
                    title: "Preview",
                    description: "Preview functionality coming soon",
                  });
                }}
                style={{ 
                  background: "blue", 
                  color: "white", 
                  padding: "10px 20px", 
                  border: "none", 
                  borderRadius: "5px",
                  fontSize: "16px",
                  cursor: "pointer"
                }}
                data-testid="preview-blog"
              >
                👁 Preview
              </button>
              <button
                onClick={saveVisualContent}
                style={{ 
                  background: "green", 
                  color: "white", 
                  padding: "10px 20px", 
                  border: "none", 
                  borderRadius: "5px",
                  fontSize: "16px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
                data-testid="save-content"
              >
                💾 SAVE CHANGES
              </button>
              <button
                onClick={saveAndCloseEditor}
                style={{ 
                  background: "purple", 
                  color: "white", 
                  padding: "10px 20px", 
                  border: "none", 
                  borderRadius: "5px",
                  fontSize: "16px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
                data-testid="save-and-close"
              >
                🚀 SAVE & CLOSE
              </button>
            </div>
          </div>
        </div>

        {/* Visual Editor Content */}
        <div className="flex-1 overflow-hidden">
          <BlogVisualEditor
            blocks={editingBlocks}
            onChange={setEditingBlocks}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="blog-admin-page">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="blog-admin-title">
              Blog Management
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="blog-admin-subtitle">
              Create and manage blog posts for the resources section
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-category">
                <Tag className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <Form {...categoryForm}>
                <form onSubmit={categoryForm.handleSubmit(onCreateCategory)} className="space-y-4">
                  <FormField
                    control={categoryForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-category-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={categoryForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} data-testid="input-category-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createCategoryMutation.isPending} data-testid="button-save-category">
                    {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-post">
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Blog Post</DialogTitle>
              </DialogHeader>
              

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onCreatePost)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-post-title" />
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
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-post-slug" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} data-testid="input-post-excerpt" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel>Content</FormLabel>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant={useVisualEditorForCreate ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUseVisualEditorForCreate(true)}
                          data-testid="button-visual-editor"
                        >
                          Visual Editor
                        </Button>
                        <Button
                          type="button"
                          variant={!useVisualEditorForCreate ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUseVisualEditorForCreate(false)}
                          data-testid="button-text-editor"
                        >
                          Text Editor
                        </Button>
                      </div>
                    </div>
                    
                    {useVisualEditorForCreate ? (
                      <div className="border border-border rounded-lg p-4 min-h-[400px]">
                        <BlogVisualEditor
                          blocks={newPostBlocks}
                          onChange={setNewPostBlocks}
                        />
                      </div>
                    ) : (
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea {...field} value={field.value || ""} rows={10} data-testid="input-post-content" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-post-category">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="categoryName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Or Create New Category</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="New category name" data-testid="input-new-category" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Author Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-post-author" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="imagePath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image Path</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="/path/to/image.jpg" data-testid="input-post-image" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between">
                    <FormField
                      control={form.control}
                      name="isPublished"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              data-testid="checkbox-post-published"
                            />
                          </FormControl>
                          <FormLabel>Publish immediately</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={createPostMutation.isPending} data-testid="button-save-post">
                      {createPostMutation.isPending ? "Creating..." : "Create Post"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Total Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground" data-testid="stat-total-posts">
              {posts.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Published Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600" data-testid="stat-published-posts">
              {posts.filter(p => p.isPublished).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="h-5 w-5" />
              Draft Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600" data-testid="stat-draft-posts">
              {posts.filter(p => !p.isPublished).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-muted-foreground">No categories created yet.</p>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`category-${category.id}`}>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg" data-testid={`category-name-${category.id}`}>
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-muted-foreground" data-testid={`category-description-${category.id}`}>
                        {category.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-edit-category-${category.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={deleteCategoryMutation.isPending}
                      data-testid={`button-delete-category-${category.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blog Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {postsLoading ? (
            <p>Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-muted-foreground">No blog posts created yet.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`post-${post.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg" data-testid={`post-title-${post.id}`}>
                        {post.title}
                      </h3>
                      <Badge variant={post.isPublished ? "default" : "secondary"} data-testid={`post-status-${post.id}`}>
                        {post.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-2" data-testid={`post-excerpt-${post.id}`}>
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'No date'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openVisualEditor(post)}
                      className="bg-primary/5 border-primary/20 hover:bg-primary/10"
                      data-testid={`visual-editor-${post.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Visual Editor
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(post.id, post.isPublished || false)}
                      disabled={togglePublishMutation.isPending}
                      data-testid={`button-toggle-publish-${post.id}`}
                    >
                      {post.isPublished ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openVisualEditor(post)}
                      data-testid={`button-edit-${post.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      disabled={deletePostMutation.isPending}
                      data-testid={`button-delete-${post.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
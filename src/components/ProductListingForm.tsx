import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus, Loader2 } from "lucide-react";
import { useCreateProduct } from "@/hooks/useCreateProduct";
import { CreateProductData } from "@/utils/api";

interface ProductFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  condition: string;
  images: File[];
  tags: string[];
  auctionType: string;
  startingBid?: string;
  stocks: string;
  discount: string;
  auctionEndDate?: string;
  brand?: string;
  model?: string;
}

const categories = [
  "Watches",
  "Collectibles", 
  "Art",
  "Jewelry",
  "Electronics",
  "Fashion",
  "Antiques",
  "Books",
  "Sports",
  "Home & Garden"
];

const conditions = [
  "New",
  "Like New", 
  "Excellent",
  "Good",
  "Fair",
  "Poor"
];

const auctionTypes = [
  "Auction",
  "Retail", 
  "Anti-Piece"
];

export default function ProductListingForm({ onClose }: { onClose: () => void }) {
  const { createProductMutation, isLoading, error, isSuccess, reset } = useCreateProduct();
  
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    category: "",
    price: "",
    condition: "",
    images: [],
    tags: [],
    auctionType: "Retail",
    startingBid: "",
    stocks: "",
    discount: "",
    auctionEndDate: "",
    brand: "",
    model: ""
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Limit to 5 images maximum
    if (formData.images.length + imageFiles.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    
    // Check file sizes (max 5MB per file)
    const oversizedFiles = imageFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Images must be smaller than 5MB each. Large images will be automatically compressed.');
    }
    
    setFormData(prev => ({ 
      ...prev, 
      images: [...prev.images, ...imageFiles].slice(0, 5) // Limit to 5 images
    }));
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const setPrimaryImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const primaryImage = newImages.splice(index, 1)[0];
      return {
        ...prev,
        images: [primaryImage, ...newImages]
      };
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};
    
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price.trim()) newErrors.price = "Price is required";
    if (!formData.condition) newErrors.condition = "Condition is required";
    if (!formData.stocks.trim()) newErrors.stocks = "Stocks is required";
    if (formData.images.length === 0) newErrors.images = "At least one image is required";
    
    // Validate auction end date for auction listings
    if (formData.auctionType === "Auction" && !formData.auctionEndDate) {
      newErrors.auctionEndDate = "Auction end date is required for auction listings";
    }
    
    // Validate auction end date is in the future
    if (formData.auctionEndDate && new Date(formData.auctionEndDate) <= new Date()) {
      newErrors.auctionEndDate = "Auction end date must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessingImages(true);

    // Compress image before converting to base64
    const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          // Calculate new dimensions
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original file
            }
          }, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
      });
    };

    // Convert images to base64
    const convertImagesToBase64 = async (files: File[]) => {
      // First compress all images
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
      );
      
      const base64Images = await Promise.all(
        compressedFiles.map(async (file, index) => {
          return new Promise<{url: string; alt: string; isPrimary: boolean; order: number}>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                url: reader.result as string,
                alt: `Product image ${index + 1}`,
                isPrimary: index === 0,
                order: index
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );
      return base64Images;
    };

    try {
      // Convert form data to API format
      const productData: CreateProductData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        stocks: parseInt(formData.stocks) || 0,
        discount: parseFloat(formData.discount) || 0,
        condition: formData.condition,
        auctionType: formData.auctionType as 'Auction' | 'Retail' | 'Anti-Piece',
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        authenticity: 'unknown', // Default value since field is removed from form
        tags: formData.tags,
        images: await convertImagesToBase64(formData.images)
      };

      // Add auction-specific fields if applicable
      if (formData.auctionType === 'Auction') {
        productData.startingBid = parseFloat(formData.startingBid || '0');
        productData.auctionEndDate = formData.auctionEndDate;
      }

      console.log('🚀 Submitting product data:', productData);
      console.log('📊 Form validation passed, calling API...');

      const result = await createProductMutation(productData);
      
      if (result) {
        // Reset form and close modal
        setFormData({
          title: "",
          description: "",
          category: "",
          price: "",
          condition: "",
          images: [],
          tags: [],
          auctionType: "Retail",
          startingBid: "",
          stocks: "",
          discount: "",
          auctionEndDate: "",
          brand: "",
          model: ""
        });
        setNewTag("");
        setErrors({});
        reset();
        onClose();
      }
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsProcessingImages(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>List Your Product</CardTitle>
              <CardDescription>Create a new listing for your item</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter product title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your product in detail"
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Pricing & Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="0.00"
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                  <SelectTrigger className={errors.condition ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.condition && <p className="text-sm text-red-500">{errors.condition}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stocks">Stocks *</Label>
                <Input
                  id="stocks"
                  type="number"
                  value={formData.stocks}
                  onChange={(e) => handleInputChange("stocks", e.target.value)}
                  placeholder="0"
                  min="0"
                  className={errors.stocks ? "border-red-500" : ""}
                />
                {errors.stocks && <p className="text-sm text-red-500">{errors.stocks}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount}
                  onChange={(e) => handleInputChange("discount", e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  className={errors.discount ? "border-red-500" : ""}
                />
                {errors.discount && <p className="text-sm text-red-500">{errors.discount}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auctionType">Listing Type</Label>
              <Select value={formData.auctionType} onValueChange={(value) => handleInputChange("auctionType", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {auctionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Product Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  placeholder="Enter brand name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  placeholder="Enter model name"
                />
              </div>
            </div>

            {/* Auction Specific Fields */}
            {formData.auctionType === "Auction" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startingBid">Starting Bid</Label>
                  <Input
                    id="startingBid"
                    type="number"
                    value={formData.startingBid}
                    onChange={(e) => handleInputChange("startingBid", e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auctionEndDate">Auction End Date *</Label>
                  <Input
                    id="auctionEndDate"
                    type="datetime-local"
                    value={formData.auctionEndDate}
                    onChange={(e) => handleInputChange("auctionEndDate", e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className={errors.auctionEndDate ? "border-red-500" : ""}
                  />
                  {errors.auctionEndDate && <p className="text-sm text-red-500">{errors.auctionEndDate}</p>}
                </div>
              </div>
            )}


            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Images *</Label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver 
                    ? 'border-crimson bg-crimson/5' 
                    : 'border-border hover:border-crimson/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-crimson' : 'text-muted-foreground'}`} />
                <p className={`text-sm mb-2 ${isDragOver ? 'text-crimson font-medium' : 'text-muted-foreground'}`}>
                  {isDragOver 
                    ? 'Drop images here...' 
                    : 'Drag and drop images here or click to browse'
                  }
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Upload up to 5 images (PNG, JPG, GIF) - Max 5MB each
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className={isDragOver ? 'border-crimson text-crimson hover:bg-crimson hover:text-white' : ''}
                >
                  Choose Files
                </Button>
              </div>
              
              {formData.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} selected
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border border-border"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-6 w-6 rounded-full p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        {index === 0 && (
                          <div className="absolute top-1 left-1">
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              Primary
                            </Badge>
                          </div>
                        )}
                        {index !== 0 && (
                          <div className="absolute top-1 right-1">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-5 w-5 rounded-full p-0 text-xs"
                              onClick={() => setPrimaryImage(index)}
                              title="Set as primary image"
                            >
                              ⭐
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-crimson hover:bg-crimson/90"
                disabled={isLoading || isProcessingImages}
              >
                {isProcessingImages ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Images...
                  </>
                ) : isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Product...
                  </>
                ) : (
                  'List Product'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading || isProcessingImages}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

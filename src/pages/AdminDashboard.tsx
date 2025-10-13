import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  Package, 
  Users, 
  Gavel, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Activity,
  Settings,
  LogOut,
  Home,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Key,
  Copy,
  Search,
  Filter,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/utils/api";
import { toast } from "sonner";

interface PendingProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  auctionType: 'Auction' | 'Retail' | 'Anti-Piece';
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  seller: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'pending_review' | 'active' | 'rejected';
  createdAt: string;
  rejectionReason?: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'seller' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  suspensionReason?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  };
  stats: {
    totalProducts: number;
    activeProducts: number;
    pendingProducts: number;
  };
}

interface DetailedUser extends User {
  hasPassword?: boolean;
  products?: Array<{
    _id: string;
    title: string;
    price: number;
    category?: string;
    auctionType?: string;
    status: string;
    images?: Array<{
      url: string;
      alt?: string;
      isPrimary?: boolean;
    }>;
  }>;
}

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  pendingProducts: number;
  totalAuctions: number;
  activeAuctions: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState<DetailedUser | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{url: string; alt: string; title: string} | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userPassword, setUserPassword] = useState<string | null>(null);
  
  // User management filters
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("all");
  const [userVerificationFilter, setUserVerificationFilter] = useState<string>("all");
  const [userSortBy, setUserSortBy] = useState<string>("newest");

  // Fetch pending products
  const { data: pendingProducts, isLoading: pendingLoading, refetch: refetchPending } = useQuery({
    queryKey: ['admin', 'pending-products'],
    queryFn: async () => {
      const response = await apiClient.get<{ products: PendingProduct[] }>('/admin/products?status=pending_review');
      console.log('Admin pending products response:', response);
      return response.products || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      // The admin dashboard API returns stats directly, not nested under data
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      console.log('Admin stats response:', data);
      return data.stats;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Approve product mutation
  const approveProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiClient.put(`/admin/products/${productId}/approve`);
    },
    onSuccess: () => {
      toast.success("Product approved successfully!");
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to approve product");
    },
  });

  // Reject product mutation
  const rejectProductMutation = useMutation({
    mutationFn: async ({ productId, reason }: { productId: string; reason: string }) => {
      return apiClient.put(`/admin/products/${productId}/reject`, { reason });
    },
    onSuccess: () => {
      toast.success("Product rejected successfully!");
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reject product");
    },
  });

  // Fetch all users
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await apiClient.get<{ users: User[] }>('/admin/users');
      console.log('Admin users response:', response);
      return response.users || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch detailed user information
  const { data: detailedUserData, isLoading: detailedUserLoading } = useQuery({
    queryKey: ['admin', 'user', selectedUser?._id],
    queryFn: async () => {
      if (!selectedUser?._id) return null;
      const response = await apiClient.get<{ user: DetailedUser }>(`/admin/users/${selectedUser._id}`);
      console.log('Admin detailed user response:', response);
      return response.user || null;
    },
    enabled: !!selectedUser?._id,
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      return apiClient.post(`/admin/users/${userId}/suspend`, { reason });
    },
    onSuccess: () => {
      toast.success("User suspended successfully!");
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to suspend user");
    },
  });

  // Activate user mutation
  const activateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiClient.post(`/admin/users/${userId}/activate`);
    },
    onSuccess: () => {
      toast.success("User activated successfully!");
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to activate user");
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiClient.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user as DetailedUser);
    setIsUserDialogOpen(true);
    // Reset password state when opening dialog
    setShowPassword(false);
    setUserPassword(null);
  };

  const handleImageClick = (imageUrl: string, alt: string, title: string) => {
    setSelectedImage({ url: imageUrl, alt, title });
    setIsImageModalOpen(true);
  };

  const handleShowPassword = async () => {
    if (!selectedUser?._id) return;
    
    if (!showPassword && !userPassword) {
      try {
        // Fetch the actual password from backend
        const response = await apiClient.get<{ password: string }>(`/admin/users/${selectedUser._id}/password`);
        setUserPassword(response.password);
        setShowPassword(true);
      } catch (error) {
        toast.error("Failed to fetch password");
      }
    } else {
      setShowPassword(!showPassword);
    }
  };

  const handleCopyPassword = async () => {
    if (userPassword) {
      try {
        await navigator.clipboard.writeText(userPassword);
        toast.success("Password copied to clipboard");
      } catch (error) {
        toast.error("Failed to copy password");
      }
    }
  };

  // Filter and sort users based on search and filter criteria
  const filteredUsers = users?.filter((user) => {
    // Search filter
    const matchesSearch = userSearchTerm === "" || 
      user.firstName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase());

    // Role filter
    const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter;

    // Status filter
    const matchesStatus = userStatusFilter === "all" || 
      (userStatusFilter === "active" && user.isActive) ||
      (userStatusFilter === "suspended" && !user.isActive);

    // Verification filter
    const matchesVerification = userVerificationFilter === "all" ||
      (userVerificationFilter === "verified" && user.isVerified) ||
      (userVerificationFilter === "unverified" && !user.isVerified);

    return matchesSearch && matchesRole && matchesStatus && matchesVerification;
  }).sort((a, b) => {
    switch (userSortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "name":
        return (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName);
      case "email":
        return a.email.localeCompare(b.email);
      case "role":
        return a.role.localeCompare(b.role);
      default:
        return 0;
    }
  }) || [];

  // Clear all filters
  const clearAllFilters = () => {
    setUserSearchTerm("");
    setUserRoleFilter("all");
    setUserStatusFilter("all");
    setUserVerificationFilter("all");
    setUserSortBy("newest");
  };

  const handleApproveProduct = (productId: string) => {
    approveProductMutation.mutate(productId);
  };

  const handleRejectProduct = (productId: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason && reason.trim()) {
      rejectProductMutation.mutate({ productId, reason: reason.trim() });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAuctionTypeColor = (type: string) => {
    switch (type) {
      case 'Auction': return 'bg-crimson text-white';
      case 'Retail': return 'bg-blue-600 text-white';
      case 'Anti-Piece': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-crimson" />
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={`${user?.firstName} ${user?.lastName}`} />
                  <AvatarFallback className="bg-crimson text-white text-sm">
                    {user ? getInitials(user.firstName, user.lastName) : 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
                  <p className="text-muted-foreground">Administrator</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Product Review</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : (stats?.totalUsers || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Products</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {statsLoading ? '...' : (stats?.pendingProducts || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting review
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Auctions</CardTitle>
                  <Gavel className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : (stats?.activeAuctions || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently live
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${statsLoading ? '...' : (stats?.monthlyRevenue?.toLocaleString() || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">System is running normally</p>
                      <p className="text-xs text-muted-foreground">Last updated 2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user registration</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Product pending review</p>
                      <p className="text-xs text-muted-foreground">10 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Review Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Product Review Queue</span>
                </CardTitle>
                <CardDescription>
                  Review and approve products before they go live
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crimson mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading pending products...</p>
                    </div>
                  </div>
                ) : pendingProducts && pendingProducts.length > 0 ? (
                  <div className="space-y-4">
                    {pendingProducts.map((product: PendingProduct) => (
                      <div key={product._id} className="border border-border rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0].url}
                                alt={product.images[0].alt}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">{product.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                              </div>
                              <Badge className={getAuctionTypeColor(product.auctionType)}>
                                {product.auctionType}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Price: <span className="font-medium text-foreground">${product.price.toLocaleString()}</span></span>
                              <span>Category: <span className="font-medium text-foreground">{product.category}</span></span>
                              <span>Condition: <span className="font-medium text-foreground">{product.condition}</span></span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Seller: <span className="font-medium text-foreground">{product.seller.firstName} {product.seller.lastName}</span></span>
                              <span>Submitted: <span className="font-medium text-foreground">{formatDate(product.createdAt)}</span></span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-border">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(product.images?.[0]?.url, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Images
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectProduct(product._id)}
                            disabled={rejectProductMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveProduct(product._id)}
                            disabled={approveProductMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pending products</h3>
                    <p className="text-muted-foreground">All products have been reviewed.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>User Management</span>
                </CardTitle>
                <CardDescription>
                  Manage user accounts, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters Section */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Role Filter */}
                    <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Verification Filter */}
                    <Select value={userVerificationFilter} onValueChange={setUserVerificationFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by verification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="unverified">Unverified</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Sort Filter */}
                    <Select value={userSortBy} onValueChange={setUserSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="email">Email (A-Z)</SelectItem>
                        <SelectItem value="role">Role</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filter Summary and Clear */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredUsers.length} of {users?.length || 0} users
                      {(userSearchTerm || userRoleFilter !== "all" || userStatusFilter !== "all" || userVerificationFilter !== "all") && (
                        <span className="ml-2">
                          {userSearchTerm && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1">Search: {userSearchTerm}</span>}
                          {userRoleFilter !== "all" && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-1">Role: {userRoleFilter}</span>}
                          {userStatusFilter !== "all" && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs mr-1">Status: {userStatusFilter}</span>}
                          {userVerificationFilter !== "all" && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-1">Verification: {userVerificationFilter}</span>}
                        </span>
                      )}
                    </div>
                    {(userSearchTerm || userRoleFilter !== "all" || userStatusFilter !== "all" || userVerificationFilter !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading users...</span>
                  </div>
                ) : filteredUsers && filteredUsers.length > 0 ? (
                  <div className="space-y-4">
                    {/* Users Table */}
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Products</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {filteredUsers.map((user) => (
                              <tr key={user._id} className="hover:bg-muted/25">
                                <td className="px-4 py-3">
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="text-xs">
                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">
                                        {user.firstName} {user.lastName}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        ID: {user._id.slice(-8)}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm">{user.email}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {user.isVerified ? (
                                      <Badge variant="secondary" className="text-xs">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Verified
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Unverified
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge 
                                    variant={user.role === 'admin' ? 'default' : user.role === 'seller' ? 'secondary' : 'outline'}
                                    className="text-xs"
                                  >
                                    {user.role}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3">
                                  {user.isActive ? (
                                    <Badge variant="default" className="text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive" className="text-xs">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Suspended
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm">
                                    <div>Total: {user.stats.totalProducts}</div>
                                    <div className="text-xs text-muted-foreground">
                                      Active: {user.stats.activeProducts} | Pending: {user.stats.pendingProducts}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewUser(user)}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      View
                                    </Button>
                                    {user.isActive ? (
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                          const reason = prompt("Enter suspension reason:");
                                          if (reason) {
                                            suspendUserMutation.mutate({ 
                                              userId: user._id, 
                                              reason 
                                            });
                                          }
                                        }}
                                        disabled={suspendUserMutation.isPending}
                                      >
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Suspend
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => {
                                          activateUserMutation.mutate(user._id);
                                        }}
                                        disabled={activateUserMutation.isPending}
                                      >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Activate
                                      </Button>
                                    )}
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
                                          deleteUserMutation.mutate(user._id);
                                        }
                                      }}
                                      disabled={deleteUserMutation.isPending || user.role === 'admin'}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* User Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Total Users</span>
                          </div>
                          <div className="text-2xl font-bold mt-2">{filteredUsers.length}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Active Users</span>
                          </div>
                          <div className="text-2xl font-bold mt-2">
                            {filteredUsers.filter(u => u.isActive).length}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">Admin Users</span>
                          </div>
                          <div className="text-2xl font-bold mt-2">
                            {filteredUsers.filter(u => u.role === 'admin').length}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : users && users.length > 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Users Match Your Filters</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search criteria or clear the filters to see all users.
                    </p>
                    <Button variant="outline" onClick={clearAllFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                    <p className="text-muted-foreground">No users have been registered yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>System Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">System Settings</h3>
                  <p className="text-muted-foreground">System settings panel coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Details Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>User Details</span>
            </DialogTitle>
            <DialogDescription>
              Comprehensive user information and account details
            </DialogDescription>
          </DialogHeader>

          {detailedUserLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading user details...</span>
            </div>
          ) : detailedUserData ? (
            <div className="space-y-6">
              {/* User Profile Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-xl">
                        {detailedUserData.firstName?.[0]}{detailedUserData.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">
                        {detailedUserData.firstName} {detailedUserData.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">ID: {detailedUserData._id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-2">
                      <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{detailedUserData.email}</p>
                        <Badge variant={detailedUserData.isVerified ? "secondary" : "outline"} className="text-xs mt-1">
                          {detailedUserData.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                    </div>

                    {detailedUserData.phone && (
                      <div className="flex items-start space-x-2">
                        <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">{detailedUserData.phone}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-2">
                      <Shield className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Role</p>
                        <Badge variant={detailedUserData.role === 'admin' ? 'default' : 'secondary'}>
                          {detailedUserData.role}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Activity className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Account Status</p>
                        <Badge variant={detailedUserData.isActive ? 'default' : 'destructive'}>
                          {detailedUserData.isActive ? 'Active' : 'Suspended'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Key className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Password</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                            {detailedUserData.hasPassword ? (
                              showPassword ? userPassword || '••••••••' : '••••••••'
                            ) : 'Not set'}
                          </p>
                          {detailedUserData.hasPassword && (
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleShowPassword}
                                className="h-6 px-2 text-xs"
                              >
                                {showPassword ? 'Hide' : 'Show'}
                              </Button>
                              {showPassword && userPassword && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCopyPassword}
                                  className="h-6 px-2 text-xs"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                        <Badge variant={detailedUserData.hasPassword ? "secondary" : "outline"} className="text-xs mt-1">
                          {detailedUserData.hasPassword ? "Password Protected" : "No Password"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Joined</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(detailedUserData.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {detailedUserData.lastLogin && (
                      <div className="flex items-start space-x-2">
                        <Clock className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Last Login</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(detailedUserData.lastLogin).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {detailedUserData.address && (
                      <div className="flex items-start space-x-2 col-span-2">
                        <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Address</p>
                          <p className="text-sm text-muted-foreground">
                            {[
                              detailedUserData.address.street,
                              detailedUserData.address.city,
                              detailedUserData.address.state,
                              detailedUserData.address.zipCode,
                              detailedUserData.address.country
                            ].filter(Boolean).join(', ') || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Suspension Information */}
              {detailedUserData.suspendedAt && (
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-lg text-destructive">Suspension Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Suspended At</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(detailedUserData.suspendedAt).toLocaleString()}
                      </p>
                    </div>
                    {detailedUserData.suspensionReason && (
                      <div>
                        <p className="text-sm font-medium">Reason</p>
                        <p className="text-sm text-muted-foreground">{detailedUserData.suspensionReason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Product Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">{detailedUserData.stats.totalProducts}</p>
                      <p className="text-sm text-muted-foreground">Total Products</p>
                    </div>
                    <div className="text-center">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">{detailedUserData.stats.activeProducts}</p>
                      <p className="text-sm text-muted-foreground">Active Products</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                      <p className="text-2xl font-bold">{detailedUserData.stats.pendingProducts}</p>
                      <p className="text-sm text-muted-foreground">Pending Products</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              {detailedUserData.preferences && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email Notifications</span>
                        <Badge variant={detailedUserData.preferences.emailNotifications ? 'default' : 'outline'}>
                          {detailedUserData.preferences.emailNotifications ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SMS Notifications</span>
                        <Badge variant={detailedUserData.preferences.smsNotifications ? 'default' : 'outline'}>
                          {detailedUserData.preferences.smsNotifications ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Products */}
              {detailedUserData.products && detailedUserData.products.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {detailedUserData.products.slice(0, 5).map((product: any) => {
                        const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
                        return (
                          <div key={product._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/25 transition-colors">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              {primaryImage ? (
                                  <img
                                    src={primaryImage.url}
                                    alt={primaryImage.alt || product.title}
                                    className="w-12 h-12 object-cover rounded-md border cursor-pointer hover:opacity-75 transition-opacity"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                                    }}
                                    onClick={() => handleImageClick(primaryImage.url, primaryImage.alt || product.title, product.title)}
                                  />
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded-md border flex items-center justify-center">
                                  <Package className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.title}</p>
                              <p className="text-xs text-muted-foreground">
                                ${product.price?.toLocaleString()} • {product.auctionType || 'Product'}
                              </p>
                              {product.category && (
                                <p className="text-xs text-muted-foreground">
                                  Category: {product.category}
                                </p>
                              )}
                            </div>
                            
                            {/* Status Badge */}
                            <div className="flex-shrink-0">
                              <Badge variant={
                                product.status === 'active' ? 'default' :
                                product.status === 'pending_review' ? 'secondary' :
                                'destructive'
                              } className="text-xs">
                                {product.status === 'pending_review' ? 'Pending' : product.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                      
                      {detailedUserData.products.length > 5 && (
                        <div className="text-center pt-2">
                          <p className="text-xs text-muted-foreground">
                            And {detailedUserData.products.length - 5} more products...
                          </p>
                        </div>
                      )}
                      
                      {/* Product Images Gallery */}
                      {detailedUserData.products.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Product Images Gallery</h4>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {detailedUserData.products.slice(0, 12).flatMap(product => 
                              product.images?.slice(0, 2).map((image: any, index: number) => (
                                <div key={`${product._id}-${index}`} className="relative group">
                                  <img
                                    src={image.url}
                                    alt={image.alt || `${product.title} - Image ${index + 1}`}
                                    className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-75 transition-opacity"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                                    }}
                                    onClick={() => handleImageClick(image.url, image.alt || `${product.title} - Image ${index + 1}`, product.title)}
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
                                    {product.title.length > 12 ? `${product.title.substring(0, 12)}...` : product.title}
                                  </div>
                                </div>
                              )) || []
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Click on images to view full size
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                {detailedUserData.isActive ? (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const reason = prompt("Enter suspension reason:");
                      if (reason) {
                        suspendUserMutation.mutate({ 
                          userId: detailedUserData._id, 
                          reason 
                        });
                        setIsUserDialogOpen(false);
                      }
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Suspend User
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => {
                      activateUserMutation.mutate(detailedUserData._id);
                      setIsUserDialogOpen(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Activate User
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsUserDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No user data available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Product Image</span>
            </DialogTitle>
            <DialogDescription>
              {selectedImage?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedImage && (
            <div className="flex items-center justify-center p-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="max-w-full max-h-[70vh] object-contain rounded-lg border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsImageModalOpen(false)}
            >
              Close
            </Button>
            {selectedImage && (
              <Button
                variant="default"
                onClick={() => window.open(selectedImage.url, '_blank')}
              >
                Open in New Tab
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

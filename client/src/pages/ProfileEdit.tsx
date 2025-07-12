import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import { Save, X, Upload } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  location: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfileEdit() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      location: user?.location || "",
      bio: user?.bio || "",
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        location: user.location || "",
        bio: user.bio || "",
      });
    }
  }, [user, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      return await apiRequest('PUT', '/api/users/profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLocation('/profile');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600">Update your profile information and settings.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.profileImageUrl} alt="Profile" />
                  <AvatarFallback className="text-xl">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    error={errors.firstName?.message}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    error={errors.lastName?.message}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  error={errors.email?.message}
                />
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">Location</Label>
                <Select
                  value={user?.location || ""}
                  onValueChange={(value) => {
                    reset({
                      ...user,
                      location: value,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mumbai, Maharashtra">Mumbai, Maharashtra</SelectItem>
                    <SelectItem value="Delhi, Delhi">Delhi, Delhi</SelectItem>
                    <SelectItem value="Bangalore, Karnataka">Bangalore, Karnataka</SelectItem>
                    <SelectItem value="Hyderabad, Telangana">Hyderabad, Telangana</SelectItem>
                    <SelectItem value="Chennai, Tamil Nadu">Chennai, Tamil Nadu</SelectItem>
                    <SelectItem value="Kolkata, West Bengal">Kolkata, West Bengal</SelectItem>
                    <SelectItem value="Pune, Maharashtra">Pune, Maharashtra</SelectItem>
                    <SelectItem value="Ahmedabad, Gujarat">Ahmedabad, Gujarat</SelectItem>
                    <SelectItem value="Jaipur, Rajasthan">Jaipur, Rajasthan</SelectItem>
                    <SelectItem value="Surat, Gujarat">Surat, Gujarat</SelectItem>
                    <SelectItem value="Lucknow, Uttar Pradesh">Lucknow, Uttar Pradesh</SelectItem>
                    <SelectItem value="Kanpur, Uttar Pradesh">Kanpur, Uttar Pradesh</SelectItem>
                    <SelectItem value="Nagpur, Maharashtra">Nagpur, Maharashtra</SelectItem>
                    <SelectItem value="Indore, Madhya Pradesh">Indore, Madhya Pradesh</SelectItem>
                    <SelectItem value="Thane, Maharashtra">Thane, Maharashtra</SelectItem>
                    <SelectItem value="Bhopal, Madhya Pradesh">Bhopal, Madhya Pradesh</SelectItem>
                    <SelectItem value="Visakhapatnam, Andhra Pradesh">Visakhapatnam, Andhra Pradesh</SelectItem>
                    <SelectItem value="Pimpri-Chinchwad, Maharashtra">Pimpri-Chinchwad, Maharashtra</SelectItem>
                    <SelectItem value="Patna, Bihar">Patna, Bihar</SelectItem>
                    <SelectItem value="Vadodara, Gujarat">Vadodara, Gujarat</SelectItem>
                    <SelectItem value="Ghaziabad, Uttar Pradesh">Ghaziabad, Uttar Pradesh</SelectItem>
                    <SelectItem value="Ludhiana, Punjab">Ludhiana, Punjab</SelectItem>
                    <SelectItem value="Agra, Uttar Pradesh">Agra, Uttar Pradesh</SelectItem>
                    <SelectItem value="Nashik, Maharashtra">Nashik, Maharashtra</SelectItem>
                    <SelectItem value="Faridabad, Haryana">Faridabad, Haryana</SelectItem>
                    <SelectItem value="Meerut, Uttar Pradesh">Meerut, Uttar Pradesh</SelectItem>
                    <SelectItem value="Rajkot, Gujarat">Rajkot, Gujarat</SelectItem>
                    <SelectItem value="Kalyan-Dombivali, Maharashtra">Kalyan-Dombivali, Maharashtra</SelectItem>
                    <SelectItem value="Vasai-Virar, Maharashtra">Vasai-Virar, Maharashtra</SelectItem>
                    <SelectItem value="Varanasi, Uttar Pradesh">Varanasi, Uttar Pradesh</SelectItem>
                    <SelectItem value="Srinagar, Jammu and Kashmir">Srinagar, Jammu and Kashmir</SelectItem>
                    <SelectItem value="Aurangabad, Maharashtra">Aurangabad, Maharashtra</SelectItem>
                    <SelectItem value="Dhanbad, Jharkhand">Dhanbad, Jharkhand</SelectItem>
                    <SelectItem value="Amritsar, Punjab">Amritsar, Punjab</SelectItem>
                    <SelectItem value="Navi Mumbai, Maharashtra">Navi Mumbai, Maharashtra</SelectItem>
                    <SelectItem value="Allahabad, Uttar Pradesh">Allahabad, Uttar Pradesh</SelectItem>
                    <SelectItem value="Ranchi, Jharkhand">Ranchi, Jharkhand</SelectItem>
                    <SelectItem value="Howrah, West Bengal">Howrah, West Bengal</SelectItem>
                    <SelectItem value="Coimbatore, Tamil Nadu">Coimbatore, Tamil Nadu</SelectItem>
                    <SelectItem value="Jabalpur, Madhya Pradesh">Jabalpur, Madhya Pradesh</SelectItem>
                    <SelectItem value="Gwalior, Madhya Pradesh">Gwalior, Madhya Pradesh</SelectItem>
                    <SelectItem value="Vijayawada, Andhra Pradesh">Vijayawada, Andhra Pradesh</SelectItem>
                    <SelectItem value="Jodhpur, Rajasthan">Jodhpur, Rajasthan</SelectItem>
                    <SelectItem value="Madurai, Tamil Nadu">Madurai, Tamil Nadu</SelectItem>
                    <SelectItem value="Raipur, Chhattisgarh">Raipur, Chhattisgarh</SelectItem>
                    <SelectItem value="Kota, Rajasthan">Kota, Rajasthan</SelectItem>
                    <SelectItem value="Guwahati, Assam">Guwahati, Assam</SelectItem>
                    <SelectItem value="Chandigarh, Chandigarh">Chandigarh, Chandigarh</SelectItem>
                    <SelectItem value="Solapur, Maharashtra">Solapur, Maharashtra</SelectItem>
                    <SelectItem value="Hubli-Dharwad, Karnataka">Hubli-Dharwad, Karnataka</SelectItem>
                    <SelectItem value="Bareilly, Uttar Pradesh">Bareilly, Uttar Pradesh</SelectItem>
                    <SelectItem value="Moradabad, Uttar Pradesh">Moradabad, Uttar Pradesh</SelectItem>
                    <SelectItem value="Mysore, Karnataka">Mysore, Karnataka</SelectItem>
                    <SelectItem value="Gurgaon, Haryana">Gurgaon, Haryana</SelectItem>
                    <SelectItem value="Aligarh, Uttar Pradesh">Aligarh, Uttar Pradesh</SelectItem>
                    <SelectItem value="Jalandhar, Punjab">Jalandhar, Punjab</SelectItem>
                    <SelectItem value="Tiruchirappalli, Tamil Nadu">Tiruchirappalli, Tamil Nadu</SelectItem>
                    <SelectItem value="Bhubaneswar, Odisha">Bhubaneswar, Odisha</SelectItem>
                    <SelectItem value="Salem, Tamil Nadu">Salem, Tamil Nadu</SelectItem>
                    <SelectItem value="Mira-Bhayandar, Maharashtra">Mira-Bhayandar, Maharashtra</SelectItem>
                    <SelectItem value="Warangal, Telangana">Warangal, Telangana</SelectItem>
                    <SelectItem value="Thiruvananthapuram, Kerala">Thiruvananthapuram, Kerala</SelectItem>
                    <SelectItem value="Guntur, Andhra Pradesh">Guntur, Andhra Pradesh</SelectItem>
                    <SelectItem value="Bhiwandi, Maharashtra">Bhiwandi, Maharashtra</SelectItem>
                    <SelectItem value="Saharanpur, Uttar Pradesh">Saharanpur, Uttar Pradesh</SelectItem>
                    <SelectItem value="Gorakhpur, Uttar Pradesh">Gorakhpur, Uttar Pradesh</SelectItem>
                    <SelectItem value="Bikaner, Rajasthan">Bikaner, Rajasthan</SelectItem>
                    <SelectItem value="Amravati, Maharashtra">Amravati, Maharashtra</SelectItem>
                    <SelectItem value="Noida, Uttar Pradesh">Noida, Uttar Pradesh</SelectItem>
                    <SelectItem value="Jamshedpur, Jharkhand">Jamshedpur, Jharkhand</SelectItem>
                    <SelectItem value="Bhilai, Chhattisgarh">Bhilai, Chhattisgarh</SelectItem>
                    <SelectItem value="Cuttack, Odisha">Cuttack, Odisha</SelectItem>
                    <SelectItem value="Firozabad, Uttar Pradesh">Firozabad, Uttar Pradesh</SelectItem>
                    <SelectItem value="Kochi, Kerala">Kochi, Kerala</SelectItem>
                    <SelectItem value="Nellore, Andhra Pradesh">Nellore, Andhra Pradesh</SelectItem>
                    <SelectItem value="Bhavnagar, Gujarat">Bhavnagar, Gujarat</SelectItem>
                    <SelectItem value="Dehradun, Uttarakhand">Dehradun, Uttarakhand</SelectItem>
                    <SelectItem value="Durgapur, West Bengal">Durgapur, West Bengal</SelectItem>
                    <SelectItem value="Asansol, West Bengal">Asansol, West Bengal</SelectItem>
                    <SelectItem value="Rourkela, Odisha">Rourkela, Odisha</SelectItem>
                    <SelectItem value="Nanded, Maharashtra">Nanded, Maharashtra</SelectItem>
                    <SelectItem value="Kolhapur, Maharashtra">Kolhapur, Maharashtra</SelectItem>
                    <SelectItem value="Ajmer, Rajasthan">Ajmer, Rajasthan</SelectItem>
                    <SelectItem value="Akola, Maharashtra">Akola, Maharashtra</SelectItem>
                    <SelectItem value="Gulbarga, Karnataka">Gulbarga, Karnataka</SelectItem>
                    <SelectItem value="Jamnagar, Gujarat">Jamnagar, Gujarat</SelectItem>
                    <SelectItem value="Ujjain, Madhya Pradesh">Ujjain, Madhya Pradesh</SelectItem>
                    <SelectItem value="Loni, Uttar Pradesh">Loni, Uttar Pradesh</SelectItem>
                    <SelectItem value="Siliguri, West Bengal">Siliguri, West Bengal</SelectItem>
                    <SelectItem value="Jhansi, Uttar Pradesh">Jhansi, Uttar Pradesh</SelectItem>
                    <SelectItem value="Ulhasnagar, Maharashtra">Ulhasnagar, Maharashtra</SelectItem>
                    <SelectItem value="Jammu, Jammu and Kashmir">Jammu, Jammu and Kashmir</SelectItem>
                    <SelectItem value="Sangli-Miraj & Kupwad, Maharashtra">Sangli-Miraj & Kupwad, Maharashtra</SelectItem>
                    <SelectItem value="Mangalore, Karnataka">Mangalore, Karnataka</SelectItem>
                    <SelectItem value="Erode, Tamil Nadu">Erode, Tamil Nadu</SelectItem>
                    <SelectItem value="Belgaum, Karnataka">Belgaum, Karnataka</SelectItem>
                    <SelectItem value="Ambattur, Tamil Nadu">Ambattur, Tamil Nadu</SelectItem>
                    <SelectItem value="Tirunelveli, Tamil Nadu">Tirunelveli, Tamil Nadu</SelectItem>
                    <SelectItem value="Malegaon, Maharashtra">Malegaon, Maharashtra</SelectItem>
                    <SelectItem value="Gaya, Bihar">Gaya, Bihar</SelectItem>
                    <SelectItem value="Jalgaon, Maharashtra">Jalgaon, Maharashtra</SelectItem>
                    <SelectItem value="Udaipur, Rajasthan">Udaipur, Rajasthan</SelectItem>
                    <SelectItem value="Maheshtala, West Bengal">Maheshtala, West Bengal</SelectItem>
                  </SelectContent>
                </Select>
                {errors.location && (
                  <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  placeholder="Tell people about yourself, your interests, and what you're passionate about..."
                  {...register("bio")}
                />
                {errors.bio && (
                  <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/profile')}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="bg-primary hover:bg-blue-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

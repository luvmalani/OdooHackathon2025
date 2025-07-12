import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Edit, Plus } from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg h-64 mb-6"></div>
            <div className="bg-white rounded-lg h-32 mb-6"></div>
            <div className="bg-white rounded-lg h-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.profileImageUrl} alt="Profile" />
                <AvatarFallback className="text-xl">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                
                {user.location && (
                  <p className="text-gray-500 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {user.location}
                  </p>
                )}
                
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {renderStars(4.8)}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">4.8 (12 reviews)</span>
                </div>
                
                {user.bio && (
                  <p className="text-gray-600 mt-3">{user.bio}</p>
                )}
              </div>
              
              <Link href="/profile/edit">
                <Button className="flex items-center">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills Offered */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Skills I Offer</CardTitle>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Sample offered skills - replace with real data */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">React Development</span>
                    <div className="flex items-center mt-1">
                      <Badge variant="secondary" className="mr-2">Programming</Badge>
                      <span className="text-sm text-gray-500">Advanced</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">Python</span>
                    <div className="flex items-center mt-1">
                      <Badge variant="secondary" className="mr-2">Programming</Badge>
                      <span className="text-sm text-gray-500">Expert</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-4 text-gray-500">
                  <p>Add your first skill to start swapping!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Wanted */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Skills I Want to Learn</CardTitle>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Sample wanted skills - replace with real data */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">UI/UX Design</span>
                    <div className="flex items-center mt-1">
                      <Badge variant="secondary" className="mr-2">Design</Badge>
                      <Badge variant="outline" className="text-xs">High Priority</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">Spanish</span>
                    <div className="flex items-center mt-1">
                      <Badge variant="secondary" className="mr-2">Languages</Badge>
                      <Badge variant="outline" className="text-xs">Medium Priority</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-4 text-gray-500">
                  <p>Add skills you'd like to learn!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Completed swap with Sarah Williams - UI/UX Design for React Development
                </span>
                <span className="text-xs text-gray-400">2 days ago</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Received a new swap request from Michael Rodriguez
                </span>
                <span className="text-xs text-gray-400">1 week ago</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Added new skill: Machine Learning (Intermediate)
                </span>
                <span className="text-xs text-gray-400">2 weeks ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

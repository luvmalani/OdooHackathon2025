import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Edit, Plus, Users, MessageSquare, Star } from "lucide-react";
import { Link } from "wouter";

export default function GettingStarted() {
  const { user } = useAuth();

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const steps = [
    {
      icon: Edit,
      title: "Complete Your Profile",
      description: "Add your name, location, bio, and profile picture to help others find you.",
      action: "Edit Profile",
      link: "/profile/edit",
      completed: !!(user?.firstName && user?.lastName && user?.location),
    },
    {
      icon: Plus,
      title: "Add Your Skills",
      description: "List the skills you can teach and the skills you want to learn.",
      action: "Add Skills",
      link: "/profile",
      completed: false, // We'll check this based on actual skills data
    },
    {
      icon: Users,
      title: "Discover Others",
      description: "Browse other users and find people with complementary skills.",
      action: "Browse Users",
      link: "/",
      completed: false,
    },
    {
      icon: MessageSquare,
      title: "Make Your First Swap",
      description: "Send a skill swap request to someone you'd like to learn from.",
      action: "Send Request",
      link: "/",
      completed: false,
    },
    {
      icon: Star,
      title: "Rate & Review",
      description: "After completing a skill swap, rate your experience to build trust.",
      action: "View Swaps",
      link: "/swaps",
      completed: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to TalentTrade! 👋
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Let's get you started on your skill exchange journey. Complete these steps to make the most of the platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className={`transition-all hover:shadow-md ${
                step.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        step.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">
                          {step.title}
                        </CardTitle>
                        {step.completed && (
                          <Badge variant="default" className="mt-1 bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      Step {index + 1}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <Link href={step.link}>
                    <Button 
                      variant={step.completed ? "outline" : "default"} 
                      className="w-full sm:w-auto"
                    >
                      {step.action}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">How Skill Swapping Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-1">Find & Connect</h3>
                <p className="text-blue-700">Discover people with skills you want to learn</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-1">Exchange Skills</h3>
                <p className="text-blue-700">Propose skill swaps and coordinate learning sessions</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-1">Grow Together</h3>
                <p className="text-blue-700">Rate experiences and build your reputation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/">
            <Button size="lg" className="px-8">
              Start Exploring
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
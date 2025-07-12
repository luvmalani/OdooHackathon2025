import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftRight, Users, Star, Handshake } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ArrowLeftRight className="text-primary text-2xl mr-2" />
              <span className="text-xl font-bold text-gray-900">TalentTrade</span>
            </div>
            <Button asChild>
              <a href="/auth">Get Started</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Trade Skills,
            <span className="text-primary"> Expand Knowledge</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with talented people around the world. Teach what you know, learn what you want.
            Build meaningful relationships through skill sharing.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild className="bg-primary hover:bg-blue-600 text-lg px-8 py-3">
              <a href="/auth">Start Trading Skills</a>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 mx-auto text-primary" />
              <CardTitle>Discover Talent</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Find skilled professionals and enthusiasts ready to share their expertise
                and learn new skills.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Handshake className="w-12 h-12 mx-auto text-primary" />
              <CardTitle>Request Swaps</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Send skill swap requests to connect with others. Offer your expertise
                in exchange for learning something new.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Star className="w-12 h-12 mx-auto text-primary" />
              <CardTitle>Build Reputation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Rate and review your swap experiences. Build trust and credibility
                within the community.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-primary rounded-lg p-12">
          <h2 className="text-3xl font-bold text-white">Ready to start learning?</h2>
          <p className="mt-4 text-xl text-blue-100">
            Join thousands of people already swapping skills on our platform.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            asChild 
            className="mt-6 bg-white text-primary hover:bg-gray-50"
          >
            <a href="/auth">Join TalentTrade Today</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { SwapRequest } from "@/types";
import { Check, X, Clock, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SwapDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch received swap requests
  const { data: receivedSwaps, isLoading: loadingReceived } = useQuery<SwapRequest[]>({
    queryKey: ['/api/swaps/received'],
    enabled: isAuthenticated,
  });

  // Fetch sent swap requests
  const { data: sentSwaps, isLoading: loadingSent } = useQuery<SwapRequest[]>({
    queryKey: ['/api/swaps/sent'],
    enabled: isAuthenticated,
  });

  // Update swap status mutation
  const updateSwapMutation = useMutation({
    mutationFn: async ({ swapId, status }: { swapId: string; status: string }) => {
      return await apiRequest('PUT', `/api/swaps/${swapId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/swaps/received'] });
      queryClient.invalidateQueries({ queryKey: ['/api/swaps/sent'] });
      toast({
        title: "Swap updated",
        description: "The swap request has been updated successfully.",
      });
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
        description: "Failed to update swap request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAcceptSwap = (swapId: string) => {
    updateSwapMutation.mutate({ swapId, status: 'accepted' });
  };

  const handleRejectSwap = (swapId: string) => {
    updateSwapMutation.mutate({ swapId, status: 'rejected' });
  };

  const handleCompleteSwap = (swapId: string) => {
    updateSwapMutation.mutate({ swapId, status: 'completed' });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      accepted: { variant: "default", label: "Accepted" },
      rejected: { variant: "destructive", label: "Rejected" },
      completed: { variant: "default", label: "Completed" },
      cancelled: { variant: "outline", label: "Cancelled" },
    };

    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const SwapCard = ({ swap, type }: { swap: SwapRequest; type: 'received' | 'sent' }) => {
    const otherUser = type === 'received' ? 'Requester' : 'Target';
    
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <Avatar className="w-12 h-12">
                <AvatarFallback>
                  {type === 'received' ? 'R' : 'T'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    {otherUser} User
                  </h4>
                  {getStatusBadge(swap.status)}
                </div>
                
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Offering:</span> Skill Name (Advanced)
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Wants:</span> Your Skill (Expert)
                </p>
                
                {swap.message && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                    <MessageCircle className="w-4 h-4 inline mr-1" />
                    {swap.message}
                  </div>
                )}
                
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(swap.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {type === 'received' && swap.status === 'pending' && (
              <div className="flex space-x-2 ml-4">
                <Button
                  size="sm"
                  onClick={() => handleAcceptSwap(swap.id)}
                  disabled={updateSwapMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRejectSwap(swap.id)}
                  disabled={updateSwapMutation.isPending}
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            )}
            
            {swap.status === 'accepted' && (
              <Button
                size="sm"
                onClick={() => handleCompleteSwap(swap.id)}
                disabled={updateSwapMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 ml-4"
              >
                Mark Complete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-1" />
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg h-64"></div>
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
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Swaps</h1>
          <p className="text-gray-600">Manage your skill swap requests and collaborations.</p>
        </div>

        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Received Requests
              {receivedSwaps && (
                <Badge variant="secondary" className="ml-2">
                  {receivedSwaps.filter(s => s.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center">
              Sent Requests
              {sentSwaps && (
                <Badge variant="secondary" className="ml-2">
                  {sentSwaps.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            <Card>
              <CardHeader>
                <CardTitle>Received Swap Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingReceived ? (
                  <LoadingSkeleton />
                ) : receivedSwaps && receivedSwaps.length > 0 ? (
                  <div>
                    {receivedSwaps.map((swap) => (
                      <SwapCard key={swap.id} swap={swap} type="received" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No requests yet
                    </h3>
                    <p className="text-gray-500">
                      You haven't received any swap requests yet. Share your profile to get started!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent">
            <Card>
              <CardHeader>
                <CardTitle>Sent Swap Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSent ? (
                  <LoadingSkeleton />
                ) : sentSwaps && sentSwaps.length > 0 ? (
                  <div>
                    {sentSwaps.map((swap) => (
                      <SwapCard key={swap.id} swap={swap} type="sent" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No requests sent
                    </h3>
                    <p className="text-gray-500">
                      Start browsing skills and send your first swap request!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

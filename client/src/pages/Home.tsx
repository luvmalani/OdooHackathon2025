import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { SearchFilters } from "@/components/SearchFilters";
import { UserCard } from "@/components/UserCard";
import { SwapRequestModal } from "@/components/SwapRequestModal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useWebSocket } from "@/services/websocket";
import { useToast } from "@/hooks/use-toast";
import { SearchFilters as SearchFiltersType, UserProfile, PaginationInfo } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [filters, setFilters] = useState<SearchFiltersType>({
    query: "",
    skillCategory: "All Skills",
    location: "All Locations",
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 12 });
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [sortBy, setSortBy] = useState("Most Relevant");
  const { toast } = useToast();

  // Fetch users with search and pagination
  const { data: searchResults, isLoading, refetch } = useQuery({
    queryKey: [
      '/api/users/search',
      filters.query,
      filters.skillCategory !== "All Skills" ? filters.skillCategory : undefined,
      filters.location !== "All Locations" ? filters.location : undefined,
      pagination.page,
      pagination.limit,
    ],
    queryFn: async ({ queryKey }) => {
      const [, query, skillCategory, location, page, limit] = queryKey;
      const params = new URLSearchParams();
      
      if (query) params.append('query', query as string);
      if (skillCategory) params.append('skillCategory', skillCategory as string);
      if (location) params.append('location', location as string);
      params.append('page', (page as number).toString());
      params.append('limit', (limit as number).toString());

      const response = await fetch(`/api/users/search?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  // WebSocket for real-time updates
  useWebSocket((message) => {
    if (message.type === 'new_user_joined') {
      refetch();
      toast({
        title: "New member joined!",
        description: "Someone new just joined the platform.",
      });
    }
  });

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    refetch();
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestSwap = (user: UserProfile) => {
    setSelectedUser(user);
  };

  const totalPages = searchResults ? Math.ceil(searchResults.total / pagination.limit) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={handleSearch}
        />

        {/* Results Summary and Sort */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">
              {searchResults?.total || 0}
            </span> people found
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Most Relevant">Most Relevant</SelectItem>
                <SelectItem value="Newest Members">Newest Members</SelectItem>
                <SelectItem value="Highest Rated">Highest Rated</SelectItem>
                <SelectItem value="Most Active">Most Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* User Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border">
                <div className="flex items-start space-x-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Skeleton key={j} className="w-3 h-3" />
                      ))}
                    </div>
                  </div>
                </div>
                <Skeleton className="h-4 w-20 mt-4 mb-2" />
                <div className="flex gap-2 mb-3">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-18" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {searchResults?.users?.map((user: UserProfile) => (
              <UserCard
                key={user.id}
                user={user}
                onRequestSwap={handleRequestSwap}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!searchResults?.users || searchResults.users.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search filters or check back later.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, searchResults?.total || 0)}
                  </span>{' '}
                  of <span className="font-medium">{searchResults?.total || 0}</span> results
                </p>
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 4) {
                      pageNum = i + 1;
                    } else if (pagination.page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = pagination.page - 3 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={pagination.page === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className={pagination.page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </main>

      {/* Swap Request Modal */}
      {selectedUser && (
        <SwapRequestModal
          targetUser={selectedUser}
          trigger={<div />}
          open={!!selectedUser}
          onOpenChange={(open) => !open && setSelectedUser(null)}
        />
      )}
    </div>
  );
}

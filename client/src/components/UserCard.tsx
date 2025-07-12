import { UserProfile } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Handshake } from "lucide-react";

interface UserCardProps {
  user: UserProfile;
  onRequestSwap: (user: UserProfile) => void;
}

export function UserCard({ user, onRequestSwap }: UserCardProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getProficiencyDots = (level: string) => {
    const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const count = levels[level as keyof typeof levels] || 0;
    return Array.from({ length: 4 }, (_, i) => (
      <span key={i} className={`text-xs ${i < count ? '●' : '○'}`} />
    ));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getSkillBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      'Programming': 'bg-blue-100 text-blue-800',
      'Design': 'bg-pink-100 text-pink-800',
      'Marketing': 'bg-orange-100 text-orange-800',
      'Languages': 'bg-yellow-100 text-yellow-800',
      'Music': 'bg-purple-100 text-purple-800',
      'Business': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
          <AvatarFallback>
            {getInitials(user.firstName, user.lastName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {user.firstName} {user.lastName}
          </h3>
          
          {user.location && (
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {user.location}
            </p>
          )}
          
          <div className="flex items-center mt-2">
            <div className="flex">
              {renderStars(user.averageRating || 0)}
            </div>
            <span className="text-sm text-gray-500 ml-2">
              {user.averageRating?.toFixed(1) || '0.0'} (reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Skills Offered */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Offered:</h4>
        <div className="flex flex-wrap gap-2">
          {user.skillsOffered?.slice(0, 3).map((skillOffer) => (
            <Badge
              key={skillOffer.id}
              variant="secondary"
              className={`text-xs ${getSkillBadgeColor(skillOffer.skill.category)}`}
            >
              {skillOffer.skill.name}
              <span className="ml-1 flex">
                {getProficiencyDots(skillOffer.proficiencyLevel)}
              </span>
            </Badge>
          ))}
        </div>
      </div>

      {/* Skills Wanted */}
      <div className="mt-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Looking to Learn:</h4>
        <div className="flex flex-wrap gap-2">
          {user.skillsWanted?.slice(0, 2).map((skillWant) => (
            <Badge
              key={skillWant.id}
              variant="outline"
              className="text-xs"
            >
              {skillWant.skill.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <Button 
        className="w-full mt-4 bg-primary text-white hover:bg-blue-600"
        onClick={() => onRequestSwap(user)}
      >
        <Handshake className="w-4 h-4 mr-2" />
        Request Swap
      </Button>
    </Card>
  );
}

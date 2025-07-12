export interface UserProfile {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  location?: string;
  bio?: string;
  skillsOffered?: SkillWithProficiency[];
  skillsWanted?: SkillWithUrgency[];
  averageRating?: number;
  isActive?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface SkillWithProficiency {
  id: string;
  skillId: string;
  skill: Skill;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description?: string;
}

export interface SkillWithUrgency {
  id: string;
  skillId: string;
  skill: Skill;
  urgencyLevel: 'low' | 'medium' | 'high';
  description?: string;
}

export interface SwapRequest {
  id: string;
  requesterId: string;
  targetId: string;
  requesterSkillId?: string;
  targetSkillId?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  scheduledAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  query: string;
  skillCategory: string;
  location: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

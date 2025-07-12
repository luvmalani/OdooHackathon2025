import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserProfile, SkillWithProficiency, SkillWithUrgency } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Handshake } from "lucide-react";

interface SwapRequestModalProps {
  targetUser: UserProfile;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SwapRequestModal({ targetUser, trigger, open, onOpenChange }: SwapRequestModalProps) {
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState<string>("");
  const [selectedWantedSkill, setSelectedWantedSkill] = useState<string>("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all available skills for dropdowns
  const { data: allSkills } = useQuery({
    queryKey: ['/api/skills'],
  });

  // Get current user's skills
  const { data: userSkillsOffered } = useQuery<SkillWithProficiency[]>({
    queryKey: ['/api/users/skills/offered'],
  });

  // Create swap request mutation
  const createSwapMutation = useMutation({
    mutationFn: async (data: {
      targetId: string;
      requesterSkillId: string;
      targetSkillId: string;
      message: string;
    }) => {
      return await apiRequest('POST', '/api/swaps/request', data);
    },
    onSuccess: () => {
      toast({
        title: "Swap request sent!",
        description: "Your swap request has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/swaps/sent'] });
      onOpenChange?.(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send swap request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedOfferedSkill("");
    setSelectedWantedSkill("");
    setMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOfferedSkill || !selectedWantedSkill) {
      toast({
        title: "Missing information",
        description: "Please select both skills for the swap.",
        variant: "destructive",
      });
      return;
    }

    createSwapMutation.mutate({
      targetId: targetUser.id,
      requesterSkillId: selectedOfferedSkill,
      targetSkillId: selectedWantedSkill,
      message,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Handshake className="w-5 h-5 mr-2 text-primary" />
            Request Skill Swap
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-gray-600">
            Requesting swap with <strong>{targetUser.firstName} {targetUser.lastName}</strong>
          </div>
          
          <div>
            <Label htmlFor="offered-skill">I want to offer:</Label>
            <Select value={selectedOfferedSkill} onValueChange={setSelectedOfferedSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill you offer" />
              </SelectTrigger>
              <SelectContent>
                {allSkills?.map((skill: any) => (
                  <SelectItem key={skill.id} value={skill.id}>
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="wanted-skill">I want to learn:</Label>
            <Select value={selectedWantedSkill} onValueChange={setSelectedWantedSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill they offer" />
              </SelectTrigger>
              <SelectContent>
                {allSkills?.map((skill: any) => (
                  <SelectItem key={skill.id} value={skill.id}>
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Message (optional):</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'd love to swap skills with you..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSwapMutation.isPending}
              className="bg-primary hover:bg-blue-600"
            >
              {createSwapMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

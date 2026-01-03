import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useVerifyAction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { actionId: number; userWallet: string; proof?: string }) => {
      const res = await fetch(api.executions.verify.path, {
        method: api.executions.verify.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to verify action");
      }

      return api.executions.verify.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.users.stats.path] });
      toast({
        title: data.success ? "Action Verified!" : "Verification Pending",
        description: data.message,
        className: data.success ? "border-primary/50 bg-background" : "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useClaimReward() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { executionId: number; userWallet: string }) => {
      const res = await fetch(api.executions.claim.path, {
        method: api.executions.claim.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to claim reward");
      }

      return api.executions.claim.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.stats.path] });
      toast({
        title: "Tokens Claimed!",
        description: "Tokens have been sent to your wallet.",
        className: "border-primary/50 bg-background",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Claim Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

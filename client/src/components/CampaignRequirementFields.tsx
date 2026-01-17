import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Shield, Coins } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface CampaignRequirementFieldsProps {
  form: UseFormReturn<any>;
}

export function CampaignRequirementFields({ form }: CampaignRequirementFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="border border-white/10 bg-white/[0.02] rounded-3xl overflow-hidden px-6 pb-6">
        <div className="flex items-center gap-3 py-4 border-b border-white/5 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-black uppercase tracking-widest text-xs text-white">Anti-Bot & Eligibility</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="minSolBalance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-white/60">Min SOL Balance</FormLabel>
                <FormControl><Input type="number" step="0.01" className="bg-white/5 border-white/10 h-11" {...field} value={field.value ?? 0} /></FormControl>
                <FormDescription className="text-[9px] text-white/30">User must hold at least this much SOL.</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minWalletAgeDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-white/60">Min Wallet Age (Days)</FormLabel>
                <FormControl><Input type="number" className="bg-white/5 border-white/10 h-11" {...field} value={field.value ?? 0} /></FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minXAccountAgeDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-white/60">Min X Account Age (Days)</FormLabel>
                <FormControl><Input type="number" className="bg-white/5 border-white/10 h-11" {...field} value={field.value ?? 0} /></FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minXFollowers"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-white/60">Min X Followers</FormLabel>
                <FormControl><Input type="number" className="bg-white/5 border-white/10 h-11" {...field} value={field.value ?? 0} /></FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="border border-white/10 bg-white/[0.02] rounded-3xl overflow-hidden px-6 pb-6">
        <div className="flex items-center gap-3 py-4 border-b border-white/5 mb-4">
          <Coins className="w-5 h-5 text-primary" />
          <span className="font-black uppercase tracking-widest text-xs text-white">Advanced Holding Verification</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="multiDaySolAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-white/60">Avg. SOL Amount</FormLabel>
                <FormControl><Input type="number" step="0.1" className="bg-white/5 border-white/10 h-11" {...field} /></FormControl>
                <FormDescription className="text-[9px] text-white/30">Average balance required over period.</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="multiDaySolDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-white/60">Verification Days</FormLabel>
                <FormControl><Input type="number" className="bg-white/5 border-white/10 h-11" {...field} /></FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

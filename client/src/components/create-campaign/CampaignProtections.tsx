import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Shield, Lock, Wallet, Twitter } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface CampaignProtectionsProps {
  form: UseFormReturn<any>;
}

export function CampaignProtections({ form }: CampaignProtectionsProps) {
  const watchedType = form.watch("campaignType");
  const isEngagement = watchedType === "engagement";

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 mb-2">
        <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-3">
          <Shield className="h-6 w-6" /> SECURITY & ANTI-BOT CONFIGURATION
        </h3>
        <p className="text-[13px] text-white font-bold mt-1.5 opacity-100">Configure entry requirements for participants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`space-y-4 p-6 bg-white/5 rounded-[24px] border border-white/10 ${!isEngagement ? 'md:col-span-2' : ''}`}>
          <div className="flex items-center gap-3 text-sm font-black text-primary uppercase tracking-widest mb-2">
            <Wallet className="h-5 w-5" /> Wallet Verification
          </div>
          <div className={!isEngagement ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
            <FormField
              control={form.control}
              name="minSolBalance"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Min SOL Balance</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} className="bg-background/50 border-primary/30 h-10 rounded-xl font-mono text-white font-bold text-center" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minWalletAgeDays"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Min Wallet Age (Days)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="bg-background/50 border-primary/30 h-10 rounded-xl font-mono text-white font-bold text-center" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {isEngagement && (
          <div className="space-y-4 p-6 bg-white/5 rounded-[24px] border border-[#1DA1F2]/20 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 text-sm font-black text-[#1DA1F2] uppercase tracking-widest mb-2">
              <Twitter className="h-5 w-5 text-[#1DA1F2]" /> Social Proof
            </div>
            <FormField
              control={form.control}
              name="minXAccountAgeDays"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[#1DA1F2] font-black uppercase tracking-[0.2em] text-xs">X Account Age (Days)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="bg-background/50 border-[#1DA1F2]/30 h-10 rounded-xl font-mono text-white font-bold text-center focus-visible:ring-[#1DA1F2]/50" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minXFollowers"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[#1DA1F2] font-black uppercase tracking-[0.2em] text-xs">Min X Followers</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="bg-background/50 border-[#1DA1F2]/30 h-10 rounded-xl font-mono text-white font-bold text-center focus-visible:ring-[#1DA1F2]/50" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}
      </div>

      <div className="p-5 bg-primary/5 rounded-[24px] border-2 border-primary/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
          <Lock className="h-16 w-16" />
        </div>
        <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-3 text-primary">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          SOL Balance Holding Period
        </h4>
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="multiDaySolAmount"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Amount (SOL)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} className="bg-background/40 border-primary/30 h-11 rounded-xl text-center font-mono text-lg font-black text-white" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="multiDaySolDays"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Required Days</FormLabel>
                <FormControl>
                  <Input type="number" {...field} className="bg-background/40 border-primary/30 h-11 rounded-xl text-center font-mono text-lg font-black text-white" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <p className="mt-4 text-[11px] text-white font-black italic leading-relaxed opacity-100 uppercase tracking-wider">
          Security protocol: Ensures participants are genuine long-term holders by verifying their SOL balance consistency over the selected period.
        </p>
      </div>
    </div>
  );
}

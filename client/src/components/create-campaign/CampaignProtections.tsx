import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Shield, Lock, Wallet, Twitter } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UseFormReturn } from "react-hook-form";

interface CampaignProtectionsProps {
  form: UseFormReturn<any>;
}

export function CampaignProtections({ form }: CampaignProtectionsProps) {
  const watchedType = form.watch("campaignType");
  const isEngagement = watchedType === "engagement";

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-2">
        <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
          <Shield className="h-4 w-4" /> Security & Anti-Bot Configuration
        </h3>
        <p className="text-[10px] text-white font-bold mt-1 opacity-90">Configure entry requirements for participants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3 p-4 bg-white/5 rounded-[20px] border border-white/10">
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-1">
            <Wallet className="h-3.5 w-3.5" /> Wallet Verification
          </div>
          <FormField
            control={form.control}
            name="minSolBalance"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Min SOL Balance</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} className="bg-background/50 border-primary/30 h-10 rounded-xl font-mono text-white font-bold" />
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
                  <Input type="number" {...field} className="bg-background/50 border-primary/30 h-10 rounded-xl font-mono text-white font-bold" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {isEngagement && (
          <div className="space-y-3 p-4 bg-white/5 rounded-[20px] border border-white/10 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-1">
              <Twitter className="h-3.5 w-3.5" /> Social Proof
            </div>
            <FormField
              control={form.control}
              name="minXAccountAgeDays"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">X Account Age (Days)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="bg-background/50 border-primary/30 h-10 rounded-xl font-mono text-white font-bold" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minXFollowers"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Min X Followers</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="bg-background/50 border-primary/30 h-10 rounded-xl font-mono text-white font-bold" />
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
        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2 text-primary">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          SOL Balance Holding Period
        </h4>
        <div className="grid grid-cols-2 gap-4">
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
        <p className="mt-3 text-[9px] text-white font-bold italic leading-relaxed opacity-90">
          Security protocol: Ensures participants are genuine long-term holders by verifying their SOL balance consistency over the selected period.
        </p>
      </div>
    </div>
  );
}

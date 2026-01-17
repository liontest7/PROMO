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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 mb-4">
        <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
          <Shield className="h-4 w-4" /> Security & Anti-Bot Configuration
        </h3>
        <p className="text-[10px] text-muted-foreground mt-1">Configure entry requirements for participants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 p-5 bg-white/5 rounded-[24px] border border-white/10">
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-2">
            <Wallet className="h-3.5 w-3.5" /> Wallet Verification
          </div>
          <FormField
            control={form.control}
            name="minSolBalance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Min SOL Balance</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} className="bg-background/50 border-primary/20 h-11 rounded-xl font-mono" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minWalletAgeDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Min Wallet Age (Days)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} className="bg-background/50 border-primary/20 h-11 rounded-xl font-mono" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {isEngagement && (
          <div className="space-y-4 p-5 bg-white/5 rounded-[24px] border border-white/10 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-2">
              <Twitter className="h-3.5 w-3.5" /> Social Proof
            </div>
            <FormField
              control={form.control}
              name="minXAccountAgeDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">X Account Age (Days)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="bg-background/50 border-primary/20 h-11 rounded-xl font-mono" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minXFollowers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Min X Followers</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="bg-background/50 border-primary/20 h-11 rounded-xl font-mono" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}
      </div>

      <div className="p-6 bg-primary/5 rounded-[28px] border-2 border-primary/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
          <Lock className="h-20 w-20" />
        </div>
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-primary">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          SOL Balance Holding Period
        </h4>
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="multiDaySolAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground">Amount (SOL)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} className="bg-background/40 border-primary/20 h-12 rounded-2xl text-center font-mono text-lg font-black" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="multiDaySolDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground">Required Days</FormLabel>
                <FormControl>
                  <Input type="number" {...field} className="bg-background/40 border-primary/20 h-12 rounded-2xl text-center font-mono text-lg font-black" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <p className="mt-4 text-[9px] text-muted-foreground italic font-medium leading-relaxed">
          Security protocol: Ensures participants are genuine long-term holders by verifying their SOL balance consistency over the selected period.
        </p>
      </div>
    </div>
  );
}

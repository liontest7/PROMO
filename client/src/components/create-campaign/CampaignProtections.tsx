import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Shield, Lock, Wallet, Twitter, Coins } from "lucide-react";
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
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="protections" className="border-primary/20 bg-primary/5 rounded-2xl px-4 overflow-hidden shadow-sm">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-primary font-bold">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-display uppercase tracking-widest">Anti-Bot & Social Shield</span>
                <span className="block text-[10px] text-muted-foreground font-normal italic">Ensure quality engagement</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mb-2">
                  <Wallet className="h-3 w-3" /> On-Chain Req
                </div>
                <FormField
                  control={form.control}
                  name="minSolBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Min SOL Balance</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} className="bg-background/50 border-primary/20 h-10" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minWalletAgeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Min Wallet Age (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-background/50 border-primary/20 h-10" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mb-2">
                  <Twitter className="h-3 w-3" /> Social Proof
                </div>
                <FormField
                  control={form.control}
                  name="minXAccountAgeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">X Account Age (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-background/50 border-primary/20 h-10" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minXFollowers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Min X Followers</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-background/50 border-primary/20 h-10" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-primary/10">
                <Lock className="h-12 w-12 rotate-12" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                SOL Holding Verification
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="multiDaySolAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Amount (SOL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} className="bg-background/50 border-primary/20 h-10" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="multiDaySolDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Duration (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-background/50 border-primary/20 h-10" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="token-holding" className="border-primary/20 bg-primary/5 rounded-2xl px-4 overflow-hidden shadow-sm">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-primary font-bold">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Coins className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-display uppercase tracking-widest">Token Holding Incentives</span>
                <span className="block text-[10px] text-muted-foreground font-normal italic">Reward long-term supporters</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 relative overflow-hidden group">
              <h4 className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2 text-primary">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Project Token Verification
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minHoldingAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Min Tokens to Hold</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-background/50 border-primary/20 h-10" placeholder="e.g. 1000000" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minHoldingDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Holding Time (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-background/50 border-primary/20 h-10" placeholder="e.g. 7" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <p className="mt-3 text-[9px] text-muted-foreground italic">
                Users must hold at least this amount of your project token for the specified duration to qualify.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

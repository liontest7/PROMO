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
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="protections" className="border-primary/20 bg-primary/5 rounded-2xl px-4 overflow-hidden">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3 text-primary font-bold">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Shield className="h-5 w-5 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-display uppercase tracking-widest">Anti-Bot & Social Shield</span>
              <span className="block text-[10px] text-muted-foreground font-normal">Ensure real users and quality engagement</span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-6 pt-2 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mb-2">
                <Wallet className="h-3 w-3" /> On-Chain Requirements
              </div>
              <FormField
                control={form.control}
                name="minSolBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Min SOL Balance</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} className="bg-background/50 border-primary/20" />
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
                      <Input type="number" {...field} className="bg-background/50 border-primary/20" />
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
                      <Input type="number" {...field} className="bg-background/50 border-primary/20" />
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
                      <Input type="number" {...field} className="bg-background/50 border-primary/20" />
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
              Multi-Day Holding Verification
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="multiDaySolAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Holding Amount (SOL)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} className="bg-background/50 border-primary/20" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="multiDaySolDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Required Duration (Days)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="bg-background/50 border-primary/20" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <p className="mt-3 text-[9px] text-muted-foreground italic">
              Verification requires the user to maintain this balance for the specified duration.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
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
      <AccordionItem value="protections" className="border-primary/20">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Shield className="h-4 w-4" /> Anti-Bot & Social Protections
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minSolBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min SOL Balance</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minWalletAgeDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Wallet Age (Days)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minXAccountAgeDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min X Account Age (Days)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minXFollowers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min X Followers</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
            <h4 className="text-sm font-bold mb-2">
              Multi-Day SOL Holding Verification
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="multiDaySolAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SOL Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="multiDaySolDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Days</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

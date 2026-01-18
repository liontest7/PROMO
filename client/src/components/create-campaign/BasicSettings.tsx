import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, Coins } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface BasicSettingsProps {
  form: UseFormReturn<any>;
  fetchTokenMetadata: (address: string) => Promise<void>;
}

export function BasicSettings({ form, fetchTokenMetadata, onBack }: { form: any, fetchTokenMetadata: any, onBack?: () => void }) {
  const tokenName = form.watch("tokenName");
  
  const { data: settings } = useQuery<any>({ 
    queryKey: ["/api/public/settings"], 
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  const isHolderDisabled = settings?.campaignsEnabled === false || settings?.holderQualificationEnabled === false;
  const isSocialDisabled = settings?.campaignsEnabled === false || settings?.socialEngagementEnabled === false;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 mb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/20 border-2 border-primary/30 shadow-lg">
              <img src={form.watch("logoUrl")} alt="Token Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none drop-shadow-md">
                {form.watch("tokenName") || "Target Asset"}
              </h3>
              <p className="text-[11px] text-white font-bold uppercase tracking-widest mt-1 opacity-90">
                {form.watch("tokenAddress") ? `$${form.watch("tokenSymbol") || form.watch("tokenName")} • ${form.watch("tokenAddress").slice(0, 6)}...${form.watch("tokenAddress").slice(-4)}` : "No Token Loaded"}
              </p>
            </div>
          </div>
          <FormField
            control={form.control}
            name="campaignType"
            render={({ field }) => (
              <FormItem className="w-44">
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background border-primary/30 h-10 rounded-xl text-white font-bold">
                      <SelectValue placeholder="Change Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background border-primary/40">
                    <SelectItem value="engagement" disabled={isSocialDisabled}>
                      <div className="flex items-center gap-2 font-bold text-white">
                        <Rocket className="h-3.5 w-3.5 text-primary" /> Social Growth {isSocialDisabled && "(DISABLED)"}
                      </div>
                    </SelectItem>
                    <SelectItem value="holder_qualification" disabled={isHolderDisabled}>
                      <div className="flex items-center gap-2 font-bold text-white">
                        <Coins className="h-3.5 w-3.5 text-primary" /> Holder Airdrop {isHolderDisabled && "(DISABLED)"}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Campaign Title</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g. My Project Growth Campaign" 
                className="bg-primary/5 border-primary/30 focus:border-primary h-12 rounded-xl text-white font-bold"
                autoComplete="organization-title"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Campaign Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your campaign goals..."
                className="min-h-[80px] bg-primary/5 border-primary/30 focus:border-primary resize-none rounded-xl text-white font-medium"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Logo Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." className="bg-primary/5 border-primary/30 h-11 rounded-xl text-white/90 text-sm" autoComplete="url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bannerUrl"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Banner Header URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." className="bg-primary/5 border-primary/30 h-11 rounded-xl text-white/90 text-sm" autoComplete="url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Website</FormLabel>
              <FormControl>
                <Input placeholder="https://..." className="bg-primary/5 border-primary/30 h-11 rounded-xl text-white font-bold" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="twitterUrl"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Twitter/X</FormLabel>
              <FormControl>
                <Input placeholder="https://x.com/..." className="bg-primary/5 border-primary/30 h-11 rounded-xl text-white font-bold" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telegramUrl"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Telegram</FormLabel>
              <FormControl>
                <Input placeholder="https://t.me/..." className="bg-primary/5 border-primary/30 h-11 rounded-xl text-white font-bold" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

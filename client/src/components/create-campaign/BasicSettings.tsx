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

interface BasicSettingsProps {
  form: UseFormReturn<any>;
  fetchTokenMetadata: (address: string) => Promise<void>;
}

export function BasicSettings({ form, fetchTokenMetadata }: BasicSettingsProps) {
  const tokenName = form.watch("tokenName");
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/10 border border-primary/20">
              <img src={form.watch("logoUrl")} alt="Token Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic leading-none">
                {form.watch("tokenName") || "Target Asset"}
              </h3>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">
                {form.watch("tokenAddress") ? `$${form.watch("tokenName")} • ${form.watch("tokenAddress").slice(0, 6)}...${form.watch("tokenAddress").slice(-4)}` : "No Token Loaded"}
              </p>
            </div>
          </div>
          <FormField
            control={form.control}
            name="campaignType"
            render={({ field }) => (
              <FormItem className="w-48">
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background/50 border-primary/20 h-10 rounded-xl">
                      <SelectValue placeholder="Change Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background border-primary/20">
                    <SelectItem value="engagement">
                      <div className="flex items-center gap-2">
                        <Rocket className="h-3.5 w-3.5 text-primary" /> Social Growth
                      </div>
                    </SelectItem>
                    <SelectItem value="holder_qualification">
                      <div className="flex items-center gap-2">
                        <Coins className="h-3.5 w-3.5 text-primary" /> Holder Airdrop
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
          <FormItem>
            <FormLabel className="text-primary font-bold uppercase tracking-widest text-[10px]">Campaign Title</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g. My Project Growth Campaign" 
                className="bg-primary/5 border-primary/20 focus:border-primary h-12 rounded-xl"
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
          <FormItem>
            <FormLabel className="text-primary font-bold uppercase tracking-widest text-[10px]">Campaign Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your campaign goals..."
                className="min-h-[100px] bg-primary/5 border-primary/20 focus:border-primary resize-none rounded-xl"
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
            <FormItem>
              <FormLabel className="text-primary font-bold uppercase tracking-widest text-[10px]">Logo Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." className="bg-primary/5 border-primary/20 h-12 rounded-xl" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bannerUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary font-bold uppercase tracking-widest text-[10px]">Banner Header URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." className="bg-primary/5 border-primary/20 h-12 rounded-xl" {...field} />
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
            <FormItem>
              <FormLabel className="text-primary font-bold uppercase tracking-widest text-[10px]">Website</FormLabel>
              <FormControl>
                <Input placeholder="https://..." className="bg-primary/5 border-primary/20 h-10 rounded-lg" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="twitterUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary font-bold uppercase tracking-widest text-[10px]">Twitter/X</FormLabel>
              <FormControl>
                <Input placeholder="https://x.com/..." className="bg-primary/5 border-primary/20 h-10 rounded-lg" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telegramUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary font-bold uppercase tracking-widest text-[10px]">Telegram</FormLabel>
              <FormControl>
                <Input placeholder="https://t.me/..." className="bg-primary/5 border-primary/20 h-10 rounded-lg" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

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

interface BasicSettingsProps {
  form: UseFormReturn<any>;
  fetchTokenMetadata: (address: string) => Promise<void>;
}

export function BasicSettings({ form, fetchTokenMetadata }: BasicSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="tokenAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary font-bold">
                Token Contract Address
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter Solana Mint Address..."
                  className="bg-primary/5 border-primary/20 focus:border-primary transition-all hover:bg-primary/10"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    fetchTokenMetadata(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tokenName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary font-bold">Token Symbol</FormLabel>
              <FormControl>
                <Input 
                  placeholder="$SYMBOL" 
                  className="bg-primary/5 border-primary/20 focus:border-primary"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary font-bold">Campaign Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. My Project Growth Campaign" 
                  className="bg-primary/5 border-primary/20 focus:border-primary"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="initialMarketCap"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary font-bold">Initial Market Cap (USD)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Auto-filled from DEX..." 
                  className="bg-primary/5 border-primary/20 focus:border-primary"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-primary font-bold">Campaign Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your campaign goals and what makes your project unique..."
                className="min-h-[120px] bg-primary/5 border-primary/20 focus:border-primary resize-none"
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
              <FormLabel className="text-primary font-bold">Logo Image URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://..." 
                  className="bg-primary/5 border-primary/20 focus:border-primary"
                  {...field} 
                />
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
              <FormLabel className="text-primary font-bold">Banner Header URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://..." 
                  className="bg-primary/5 border-primary/20 focus:border-primary"
                  {...field} 
                />
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
              <FormLabel className="text-primary font-bold">Website</FormLabel>
              <FormControl>
                <Input placeholder="https://..." className="bg-primary/5 border-primary/20" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="twitterUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary font-bold">Twitter/X</FormLabel>
              <FormControl>
                <Input placeholder="https://x.com/..." className="bg-primary/5 border-primary/20" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telegramUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary font-bold">Telegram</FormLabel>
              <FormControl>
                <Input placeholder="https://t.me/..." className="bg-primary/5 border-primary/20" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

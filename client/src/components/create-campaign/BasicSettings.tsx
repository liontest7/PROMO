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
                  className="bg-primary/5 border-primary/20 focus:border-primary"
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
              <FormLabel>Token Symbol</FormLabel>
              <FormControl>
                <Input placeholder="$SYMBOL" {...field} />
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
              <FormLabel>Campaign Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. My Project Growth Campaign" {...field} />
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
              <FormLabel>Initial Market Cap (USD)</FormLabel>
              <FormControl>
                <Input placeholder="Market cap at launch..." {...field} />
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
            <FormLabel>Campaign Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your campaign goals..."
                className="min-h-[100px]"
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
              <FormLabel>Logo Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
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
              <FormLabel>Banner Header URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
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
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
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
              <FormLabel>Twitter/X</FormLabel>
              <FormControl>
                <Input placeholder="https://x.com/..." {...field} />
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
              <FormLabel>Telegram</FormLabel>
              <FormControl>
                <Input placeholder="https://t.me/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

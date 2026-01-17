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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-primary font-bold uppercase tracking-widest text-xs">Campaign Title</FormLabel>
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
            <FormLabel className="text-primary font-bold uppercase tracking-widest text-xs">Campaign Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your campaign goals and what makes your project unique..."
                className="min-h-[120px] bg-primary/5 border-primary/20 focus:border-primary resize-none rounded-xl"
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
              <FormLabel className="text-primary font-bold uppercase tracking-widest text-xs">Logo Image URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://..." 
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
          name="bannerUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary font-bold uppercase tracking-widest text-xs">Banner Header URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://..." 
                  className="bg-primary/5 border-primary/20 focus:border-primary h-12 rounded-xl"
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
              <FormLabel className="text-primary font-bold uppercase tracking-widest text-xs">Website</FormLabel>
              <FormControl>
                <Input placeholder="https://..." className="bg-primary/5 border-primary/20 h-10 rounded-lg" {...field} />
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
              <FormLabel className="text-primary font-bold uppercase tracking-widest text-xs">Twitter/X</FormLabel>
              <FormControl>
                <Input placeholder="https://x.com/..." className="bg-primary/5 border-primary/20 h-10 rounded-lg" {...field} />
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
              <FormLabel className="text-primary font-bold uppercase tracking-widest text-xs">Telegram</FormLabel>
              <FormControl>
                <Input placeholder="https://t.me/..." className="bg-primary/5 border-primary/20 h-10 rounded-lg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Twitter, Send } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface ProjectDetailsProps {
  form: UseFormReturn<any>;
}

export function ProjectDetailsFields({ form }: ProjectDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="border border-white/10 bg-white/[0.02] rounded-3xl overflow-hidden px-6 pb-6">
        <div className="flex items-center gap-3 py-4 border-b border-white/5 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <span className="font-black uppercase tracking-widest text-xs text-white">Project Details</span>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-black text-white">Campaign Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title..." className="bg-white/5 border-white/10 text-white text-base h-11" {...field} />
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
                  <FormLabel className="text-[10px] uppercase font-black text-white">Token Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. SOL" className="bg-white/5 border-white/10 text-white text-base h-11" {...field} />
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
                <FormLabel className="text-[10px] uppercase font-black text-white">Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell users about your project..." 
                    className="bg-white/5 border-white/10 text-white text-base min-h-[100px] resize-none" 
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
                  <FormLabel className="text-[10px] uppercase font-black text-white">Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." className="bg-white/5 border-white/10 text-white text-base h-11" {...field} />
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
                  <FormLabel className="text-[10px] uppercase font-black text-white">Banner URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." className="bg-white/5 border-white/10 text-white text-base h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SocialLinksFields({ form }: ProjectDetailsProps) {
  return (
    <div className="border border-white/10 bg-white/[0.02] rounded-3xl overflow-hidden px-6 pb-6">
      <div className="flex items-center gap-3 py-4 border-b border-white/5 mb-4">
        <Globe className="w-5 h-5 text-primary" />
        <span className="font-black uppercase tracking-widest text-xs text-white">Social Links</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase font-black text-white">Website</FormLabel>
              <FormControl>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                  <Input placeholder="https://..." className="pl-10 bg-white/5 border-white/10 text-white text-base h-11" {...field} />
                </div>
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
              <FormLabel className="text-[10px] uppercase font-black text-white">Twitter / X</FormLabel>
              <FormControl>
                <div className="relative">
                  <Twitter className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                  <Input placeholder="https://x.com/..." className="pl-10 bg-white/5 border-white/10 text-white text-base h-11" {...field} />
                </div>
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
              <FormLabel className="text-[10px] uppercase font-black text-white">Telegram</FormLabel>
              <FormControl>
                <div className="relative">
                  <Send className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                  <Input placeholder="https://t.me/..." className="pl-10 bg-white/5 border-white/10 text-white text-base h-11" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

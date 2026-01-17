import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";

interface CampaignActionFieldsProps {
  form: UseFormReturn<any>;
}

export function CampaignActionFields({ form }: CampaignActionFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });
  const [expandedAction, setExpandedAction] = useState<string | null>("item-0");

  const getActionDefaultTitle = (type: string) => {
    switch (type) {
      case "website": return "Visit Website";
      case "twitter_follow": return "Follow on Twitter";
      case "twitter_retweet": return "Retweet Post";
      case "telegram_join": return "Join Telegram";
      default: return "Custom Task";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Plus className="w-5 h-5 text-primary" />
          <span className="font-black uppercase tracking-widest text-xs text-white">Campaign Tasks</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-primary/10 border-primary/20 hover:bg-primary/20 text-primary font-black uppercase tracking-widest text-[10px]"
          onClick={() => {
            append({ type: "website", title: "Visit Website", url: "", rewardAmount: 0.01, maxExecutions: 10 });
            setExpandedAction(`item-${fields.length}`);
          }}
        >
          <Plus className="w-3 h-3 mr-1" /> Add Task
        </Button>
      </div>

      <Accordion type="single" collapsible value={expandedAction || undefined} onValueChange={setExpandedAction} className="space-y-4">
        {fields.map((field, index) => (
          <AccordionItem 
            key={field.id} 
            value={`item-${index}`} 
            className="border border-white/10 bg-white/[0.02] rounded-3xl px-6 overflow-hidden data-[state=open]:border-primary/30 transition-all"
          >
            <div className="flex items-center justify-between w-full">
              <AccordionTrigger className="flex-1 hover:no-underline py-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">{form.watch(`actions.${index}.title`) || "New Task"}</p>
                    <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">
                      {form.watch(`actions.${index}.type`)} • {form.watch(`actions.${index}.rewardAmount`)} SOL
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white/20 hover:text-red-500 transition-colors"
                onClick={(e) => { e.stopPropagation(); remove(index); }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <AccordionContent className="pb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`actions.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-black text-white/60">Task Type</FormLabel>
                      <Select onValueChange={(val) => { field.onChange(val); form.setValue(`actions.${index}.title`, getActionDefaultTitle(val)); }} value={field.value}>
                        <FormControl><SelectTrigger className="bg-white/5 border-white/10 h-10"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent className="bg-black border-white/10">
                          <SelectItem value="website">Website Visit</SelectItem>
                          <SelectItem value="twitter_follow">X (Twitter) Follow</SelectItem>
                          <SelectItem value="twitter_retweet">X (Twitter) Retweet</SelectItem>
                          <SelectItem value="twitter_like">X (Twitter) Like</SelectItem>
                          <SelectItem value="twitter_comment">X (Twitter) Comment</SelectItem>
                          <SelectItem value="telegram_join">Telegram Join</SelectItem>
                          <SelectItem value="custom">Custom Task</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`actions.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-black text-white/60">Display Title</FormLabel>
                      <FormControl><Input className="bg-white/5 border-white/10 h-10" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name={`actions.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-black text-white/60">Target URL</FormLabel>
                    <FormControl><Input placeholder="https://..." className="bg-white/5 border-white/10 h-10" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`actions.${index}.rewardAmount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-black text-white/60">Reward (SOL)</FormLabel>
                      <FormControl><Input type="number" step="0.001" className="bg-white/5 border-white/10 h-10" {...field} value={field.value ?? 0} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`actions.${index}.maxExecutions`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-black text-white/60">Max Participants</FormLabel>
                      <FormControl><Input type="number" className="bg-white/5 border-white/10 h-10" {...field} value={field.value ?? 0} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Globe, Twitter, Send, Coins } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn, useFieldArray } from "react-hook-form";

interface EngagementActionsProps {
  form: UseFormReturn<any>;
}

export function EngagementActions({ form }: EngagementActionsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

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
      <div className="flex items-center justify-between p-2 bg-primary/10 rounded-xl border border-primary/20">
        <div className="flex items-center gap-2 text-primary font-bold px-2">
          <Coins className="h-5 w-5" />
          <span>Pay-Per-Action Tasks</span>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="font-bold shadow-lg"
          onClick={() =>
            append({
              type: "website",
              title: "Visit Website",
              url: "",
              rewardAmount: 0.01,
              maxExecutions: 10,
            })
          }
        >
          <Plus className="h-4 w-4 mr-1" /> Add Custom Task
        </Button>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {fields.map((field, index) => (
          <div key={field.id} className="group relative p-5 border-2 border-primary/10 rounded-[20px] bg-primary/5 hover:bg-primary/10 transition-all duration-300">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <FormField
                  control={form.control}
                  name={`actions.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Action Type</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue(`actions.${index}.title`, getActionDefaultTitle(val));
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background/50 border-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-background border-primary/20">
                          <SelectItem value="website">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-blue-400" /> Website Visit
                            </div>
                          </SelectItem>
                          <SelectItem value="twitter_follow">
                            <div className="flex items-center gap-2">
                              <Twitter className="h-4 w-4 text-[#1DA1F2]" /> Follow on X
                            </div>
                          </SelectItem>
                          <SelectItem value="twitter_retweet">
                            <div className="flex items-center gap-2">
                              <Twitter className="h-4 w-4 text-[#1DA1F2]" /> Retweet on X
                            </div>
                          </SelectItem>
                          <SelectItem value="telegram_join">
                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4 text-[#0088cc]" /> Join Telegram
                            </div>
                          </SelectItem>
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
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Action Label</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-background/50 border-primary/20" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full mt-6"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <FormField
              control={form.control}
              name={`actions.${index}.url`}
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target URL (Required)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} className="bg-background/50 border-primary/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`actions.${index}.rewardAmount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-primary">Reward Per User</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.00001" {...field} className="bg-primary/10 border-primary/20 font-mono font-bold" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`actions.${index}.maxExecutions`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max Participants</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="bg-background/50 border-primary/20 font-mono" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

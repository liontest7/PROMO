import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Globe, Twitter, Send } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-primary">Engagement Actions</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
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
          <Plus className="h-4 w-4 mr-2" /> Add Action
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="p-4 border rounded-lg bg-primary/5 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <FormField
                control={form.control}
                name={`actions.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action Type</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue(`actions.${index}.title`, getActionDefaultTitle(val));
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="website">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" /> Website Visit
                          </div>
                        </SelectItem>
                        <SelectItem value="twitter_follow">
                          <div className="flex items-center gap-2">
                            <Twitter className="h-4 w-4" /> Twitter Follow
                          </div>
                        </SelectItem>
                        <SelectItem value="twitter_retweet">
                          <div className="flex items-center gap-2">
                            <Twitter className="h-4 w-4" /> Twitter Retweet
                          </div>
                        </SelectItem>
                        <SelectItem value="telegram_join">
                          <div className="flex items-center gap-2">
                            <Send className="h-4 w-4" /> Telegram Join
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
                    <FormLabel>Action Label</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <FormField
            control={form.control}
            name={`actions.${index}.url`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
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
                  <FormLabel>Reward Per User</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.00001" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`actions.${index}.maxExecutions`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Participants</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

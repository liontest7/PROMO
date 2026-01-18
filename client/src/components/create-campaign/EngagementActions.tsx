import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Globe, Twitter, Send, Coins, Zap, Timer, Shield } from "lucide-react";
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
  gasFeeSol: number;
}

export function EngagementActions({ form, gasFeeSol }: EngagementActionsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  const watchedType = form.watch("campaignType");
  const isEngagement = watchedType === "engagement";
  const tokenName = form.watch("tokenName");
  const totalBudget = form.watch("totalBudget");

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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isEngagement ? (
        <>
          <div className="flex items-center justify-between p-2.5 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
              <Zap className="h-4 w-4 animate-pulse" />
              Engagement Rewards
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-8"
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
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Task
            </Button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {fields.map((field, index) => (
              <div key={field.id} className="group relative p-4 border-2 border-primary/10 rounded-[20px] bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 shadow-inner">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                    <FormField
                      control={form.control}
                      name={`actions.${index}.type`}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Task Type</FormLabel>
                          <Select
                            onValueChange={(val) => {
                              field.onChange(val);
                              form.setValue(`actions.${index}.title`, getActionDefaultTitle(val));
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background/50 border-primary/20 h-9 rounded-xl text-white font-bold">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-background border-primary/30">
                              <SelectItem value="website">
                                <div className="flex items-center gap-2 font-bold text-white"><Globe className="h-3.5 w-3.5 text-blue-400" /> Website Visit</div>
                              </SelectItem>
                              <SelectItem value="twitter_follow">
                                <div className="flex items-center gap-2 font-bold text-white"><Twitter className="h-3.5 w-3.5 text-[#1DA1F2]" /> Follow on X</div>
                              </SelectItem>
                              <SelectItem value="twitter_retweet">
                                <div className="flex items-center gap-2 font-bold text-white"><Twitter className="h-3.5 w-3.5 text-[#1DA1F2]" /> Retweet on X</div>
                              </SelectItem>
                              <SelectItem value="telegram_join">
                                <div className="flex items-center gap-2 font-bold text-white"><Send className="h-3.5 w-3.5 text-[#0088cc]" /> Join Telegram</div>
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
                        <FormItem className="space-y-1">
                          <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Action Label</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background/50 border-primary/20 h-9 rounded-xl font-bold text-white" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full mt-5 transition-colors"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name={`actions.${index}.url`}
                  render={({ field }) => (
                    <FormItem className="mb-3">
                      <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Destination Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} className="bg-background/50 border-primary/20 h-10 rounded-xl font-mono text-sm text-white" autoComplete="url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name={`actions.${index}.rewardAmount`}
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Reward Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.00001" {...field} className="bg-primary/10 border-primary/30 h-10 rounded-xl font-mono font-black text-primary text-center" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`actions.${index}.maxExecutions`}
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-xs">Max Slots</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="bg-background/50 border-primary/30 h-10 rounded-xl font-mono font-black text-center text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="p-6 bg-primary/10 rounded-[24px] border-2 border-primary/20 text-center space-y-3 shadow-xl relative overflow-hidden group">
            <div className="absolute -top-6 -right-6 p-2 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Coins className="h-24 w-24" /></div>
            <div className="p-4 bg-primary/20 rounded-[20px] w-fit mx-auto shadow-2xl border-2 border-primary/40"><Coins className="h-10 w-10 text-primary animate-bounce" /></div>
            <div className="space-y-1">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">Airdrop Settlement</h3>
              <p className="text-[12px] text-white font-black uppercase tracking-[0.3em] italic opacity-100">Project Token Incentive Protocol</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <FormField
                control={form.control}
                name="rewardPerWallet"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-sm">Reward Per Wallet</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.00001" {...field} className="h-12 bg-background/50 border-2 border-primary/30 focus:border-primary/60 rounded-xl text-center font-mono text-xl font-black text-primary shadow-inner" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxClaims"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-sm">Participant Cap</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-12 bg-background/50 border-2 border-primary/30 focus:border-primary/60 rounded-xl text-center font-mono text-xl font-black text-white shadow-inner" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4 border-t border-primary/10 mt-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10 group-hover:bg-primary/10 transition-colors shadow-inner">
                <Timer className="h-5 w-5 text-primary animate-pulse" />
                <div className="text-left flex-1">
                  <span className="block text-sm font-black text-primary uppercase tracking-widest leading-none mb-1">Incentive Lock</span>
                  <span className="block text-[11px] text-white font-bold uppercase tracking-tighter italic opacity-100">Required holding duration</span>
                </div>
                <FormField
                  control={form.control}
                  name="minHoldingDuration"
                  render={({ field }) => (
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input type="number" {...field} className="w-20 h-9 bg-background/50 border-primary/30 rounded-lg text-center font-mono font-black text-white text-sm" />
                        <span className="text-xs font-black text-white uppercase">Days</span>
                      </div>
                    </FormControl>
                  )}
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10 group-hover:bg-primary/10 transition-colors shadow-inner">
                <Coins className="h-5 w-5 text-primary" />
                <div className="text-left flex-1">
                  <span className="block text-sm font-black text-primary uppercase tracking-widest leading-none mb-1">Minimum Hold</span>
                  <span className="block text-[11px] text-white font-bold uppercase tracking-tighter italic opacity-100">Token balance required</span>
                </div>
                <FormField
                  control={form.control}
                  name="minHoldingAmount"
                  render={({ field }) => (
                    <FormControl>
                      <Input type="number" {...field} className="w-28 h-9 bg-background/50 border-primary/30 rounded-lg text-center font-mono font-black text-white text-sm" />
                    </FormControl>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Real-time Pricing Summary */}
      <div className="p-6 bg-white/5 rounded-[24px] border-2 border-white/10 space-y-5 shadow-2xl relative overflow-hidden group animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Shield className="h-20 w-20 text-primary" /></div>
            <div className="space-y-4 relative z-10">
          <div className="flex justify-between items-center group/item pb-3 border-b border-white/10">
            <div className="space-y-1">
              <span className="block text-sm font-black text-white uppercase tracking-[0.2em] group-hover/item:text-primary transition-colors">Airdrop Allocation</span>
              <span className="text-[12px] font-bold text-white uppercase italic tracking-widest">Calculated Budget</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-primary font-black text-2xl tracking-tighter block leading-none">{totalBudget?.toLocaleString() || 0}</span>
              <span className="text-sm font-black text-white uppercase tracking-widest opacity-100">${tokenName || 'TOKEN'}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm font-black uppercase tracking-widest text-white">
            <div className="flex flex-col gap-1.5 p-3.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-white">Platform Fee</span>
                <span className="text-white font-mono text-base">0.50 SOL</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 p-3.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-white">Gas (Escrow)</span>
                <span className="text-white font-mono text-base">{gasFeeSol} SOL</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 bg-primary/10 p-5 rounded-[20px] border border-primary/20 shadow-inner group-hover:bg-primary/15 transition-all">
            <div className="space-y-1">
              <span className="block text-sm font-black text-primary uppercase tracking-[0.3em] leading-none">Settlement Amount</span>
              <span className="text-[12px] font-bold text-white uppercase italic tracking-widest">Total SOL Required</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-black text-primary text-2xl tracking-tighter">{(0.5 + gasFeeSol).toFixed(4)}</span>
              <span className="text-[14px] font-black text-primary/60 uppercase">SOL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

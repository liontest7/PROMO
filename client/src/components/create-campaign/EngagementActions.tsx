import { useState, useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Globe, Twitter, Send, Coins, Zap, Timer, Shield, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface EngagementActionsProps {
  form: UseFormReturn<any>;
  gasFeeSol: number;
}

export function EngagementActions({ form, gasFeeSol }: EngagementActionsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  // Auto-append first task if empty and ensure it's open
  useEffect(() => {
    if (fields.length === 0) {
      append({
        type: "website",
        title: "Visit Website",
        url: "",
        rewardAmount: 0.01,
        maxExecutions: 10,
      });
    }
  }, [fields.length, append]);

  // Track which items are open
  useEffect(() => {
    if (fields.length > 0 && Object.keys(openItems).length === 0) {
      setOpenItems({ [fields[0].id]: true });
    }
  }, [fields, openItems]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

  const getIcon = (type: string) => {
    switch (type) {
      case "website": return <Globe className="h-4 w-4 text-blue-400" />;
      case "twitter_follow":
      case "twitter_retweet": return <Twitter className="h-4 w-4 text-[#1DA1F2]" />;
      case "telegram_join": return <Send className="h-4 w-4 text-[#0088cc]" />;
      default: return <Zap className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 pb-32">
        {isEngagement ? (
          <>
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm sticky top-0 z-20 backdrop-blur-md">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm">
                <Zap className="h-5 w-5 animate-pulse" />
                Engagement Rewards
              </div>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
                onClick={() => {
                  const id = Math.random().toString(36).substr(2, 9);
                  append({
                    type: "website",
                    title: "Visit Website",
                    url: "",
                    rewardAmount: 0.01,
                    maxExecutions: 10,
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Add Task
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => {
                const isOpen = openItems[field.id];
                const actionType = form.watch(`actions.${index}.type`);
                const actionTitle = form.watch(`actions.${index}.title`);
                const actionReward = form.watch(`actions.${index}.rewardAmount`);
                const actionSlots = form.watch(`actions.${index}.maxExecutions`);
                
                return (
                  <div key={field.id} className="group border-2 border-primary/10 rounded-[20px] bg-primary/5 overflow-hidden transition-all duration-300">
                    <div 
                      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-primary/10 transition-colors ${!isOpen ? 'bg-primary/5' : 'border-b-2 border-primary/10'}`}
                      onClick={() => toggleItem(field.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-background/50 rounded-lg border border-primary/20">
                          {getIcon(actionType)}
                        </div>
                        <div>
                          <h4 className="text-white font-black uppercase tracking-tight text-sm leading-none">{actionTitle || "Untitled Task"}</h4>
                          {!isOpen && (
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] text-primary font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                {actionReward} $DROPY
                              </span>
                              <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">
                                {actionSlots} Slots
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full"
                          onClick={(e) => { e.stopPropagation(); remove(index); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="text-primary/40 group-hover:text-primary transition-colors">
                          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </div>
                    </div>

                    <Collapsible open={isOpen}>
                      <CollapsibleContent className="p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`actions.${index}.type`}
                            render={({ field: f }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Task Type</FormLabel>
                                <Select
                                  onValueChange={(val) => {
                                    f.onChange(val);
                                    form.setValue(`actions.${index}.title`, getActionDefaultTitle(val));
                                  }}
                                  defaultValue={f.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-background border-primary/20 h-10 rounded-xl text-white font-bold">
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
                            render={({ field: f }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Action Label</FormLabel>
                                <FormControl>
                                  <Input {...f} className="bg-background border-primary/20 h-10 rounded-xl font-bold text-white" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`actions.${index}.url`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Destination Link</FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." {...f} className="bg-background border-primary/20 h-11 rounded-xl font-mono text-sm text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`actions.${index}.rewardAmount`}
                            render={({ field: f }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Reward Amount</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.00001" {...f} className="bg-primary/10 border-primary/30 h-11 rounded-xl font-mono font-black text-primary text-center text-lg" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`actions.${index}.maxExecutions`}
                            render={({ field: f }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Max Slots</FormLabel>
                                <FormControl>
                                  <Input type="number" {...f} className="bg-background border-primary/30 h-11 rounded-xl font-mono font-black text-center text-white text-lg" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full h-10 rounded-xl border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/10"
                          onClick={() => toggleItem(field.id)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Save Task Settings
                        </Button>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              })}
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
      </div>

      {/* Dynamic Real-time Pricing Summary - FIXED at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-30">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex justify-between items-center group/item">
            <div className="space-y-0.5">
              <span className="block text-xs font-black text-white uppercase tracking-[0.2em]">Airdrop Allocation</span>
              <span className="text-[10px] font-bold text-primary uppercase italic tracking-widest italic">Calculated Budget</span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="font-mono text-primary font-black text-xl tracking-tighter block leading-none">{totalBudget?.toLocaleString() || 0}</span>
                <span className="text-xs font-black text-white uppercase tracking-widest">${tokenName || 'TOKEN'}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-[10px] font-black uppercase tracking-widest">
            <div className="flex justify-between items-center px-3 py-2 bg-white/5 rounded-lg border border-white/10">
              <span className="text-white/60">Fee</span>
              <span className="text-white">0.50 SOL</span>
            </div>
            <div className="flex justify-between items-center px-3 py-2 bg-white/5 rounded-lg border border-white/10">
              <span className="text-white/60">Gas</span>
              <span className="text-white">{gasFeeSol} SOL</span>
            </div>
          </div>

          <div className="flex justify-between items-center bg-primary/10 px-4 py-3 rounded-xl border border-primary/30">
            <span className="text-xs font-black text-primary uppercase tracking-[0.3em]">Total Settlement</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono font-black text-primary text-xl tracking-tighter">{(0.5 + gasFeeSol).toFixed(4)}</span>
              <span className="text-[10px] font-black text-primary/60 uppercase">SOL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

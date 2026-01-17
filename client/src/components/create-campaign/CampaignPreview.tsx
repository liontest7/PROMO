import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  Globe,
  Twitter,
  Send,
  CheckCircle2,
  Eye,
  Shield,
  Coins,
  ArrowRight,
  ChevronLeft,
  AlertCircle,
  ExternalLink
} from "lucide-react";

interface CampaignPreviewProps {
  values: any;
  onBack: () => void;
  onConfirm: () => void;
  isPending: boolean;
  gasFeeSol: number;
}

export function CampaignPreview({
  values,
  onBack,
  onConfirm,
  isPending,
  gasFeeSol,
}: CampaignPreviewProps) {
  const isHolder = values.campaignType === "holder_qualification";
  const platformFee = 0.5; // From shared/config
  const totalCostSol = Number((platformFee + gasFeeSol).toFixed(4));

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-300">
      {/* Banner & Brand Card */}
      <div className="relative group">
        <div className="relative h-48 rounded-[24px] overflow-hidden bg-primary/10 border-2 border-primary/20 shadow-2xl">
          {values.bannerUrl ? (
            <img
              src={values.bannerUrl}
              alt="Campaign Banner"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-primary/20 space-y-2">
              <Eye className="h-12 w-12" />
              <span className="text-xs font-black uppercase tracking-widest">Banner Preview</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 border-2 border-white/20 shadow-2xl backdrop-blur-md">
                <img src={values.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-xl text-white italic tracking-tighter uppercase">
                    {values.title}
                  </h3>
                  <Badge variant="primary" className="text-[9px] h-4">LIVE PREVIEW</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-primary font-mono text-sm font-bold tracking-widest">${values.tokenName}</span>
                  {values.websiteUrl && <Globe className="h-3 w-3 text-white/40" />}
                  {values.twitterUrl && <Twitter className="h-3 w-3 text-white/40" />}
                  {values.telegramUrl && <Send className="h-3 w-3 text-white/40" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Details & Rules */}
        <div className="space-y-6">
          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-1">Campaign Strategy</h4>
            <div className="p-5 bg-primary/5 rounded-[24px] border border-primary/10 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Rocket className="h-20 w-20" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Campaign Category</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest py-1 border-primary/20">
                    {values.campaignType?.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Airdrop Pool</span>
                  <div className="text-right">
                    <span className="block text-lg font-mono font-black text-primary leading-none">
                      {values.totalBudget}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">${values.tokenName}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-1">Active Shield Protections</h4>
            <div className="p-5 bg-white/5 rounded-[24px] border border-white/10 space-y-3">
              {[
                { label: `Min ${values.minSolBalance} SOL Balance`, active: values.minSolBalance > 0 },
                { label: `Min ${values.minWalletAgeDays}d Wallet Age`, active: values.minWalletAgeDays > 0 },
                { label: `Min ${values.minXFollowers} X Followers`, active: values.minXFollowers > 0 },
                { label: `Min ${values.minXAccountAgeDays}d X Age`, active: values.minXAccountAgeDays > 0 },
              ].filter(p => p.active).length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: `Min ${values.minSolBalance} SOL Balance`, active: values.minSolBalance > 0 },
                    { label: `Min ${values.minWalletAgeDays}d Wallet Age`, active: values.minWalletAgeDays > 0 },
                    { label: `Min ${values.minXFollowers} X Followers`, active: values.minXFollowers > 0 },
                    { label: `Min ${values.minXAccountAgeDays}d X Age`, active: values.minXAccountAgeDays > 0 },
                  ].map((p, i) => p.active && (
                    <div key={i} className="flex items-center gap-3 text-[11px] font-bold text-white/80 py-1 px-3 bg-white/5 rounded-full border border-white/5">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      {p.label}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground italic py-2">
                  <AlertCircle className="h-4 w-4" />
                  No specific protections enabled
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Actions & Financials */}
        <div className="space-y-6">
          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-1">Engagement Tasks</h4>
            <div className="p-5 bg-primary/5 rounded-[24px] border border-primary/10 space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar">
              {isHolder ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-2">
                  <Coins className="h-8 w-8 text-primary animate-bounce" />
                  <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-white">Holder Reward</p>
                    <p className="text-lg font-mono font-black text-primary">{values.rewardPerWallet} ${values.tokenName}</p>
                  </div>
                </div>
              ) : (
                values.actions?.map((action: any, i: number) => (
                  <div key={i} className="group flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/20 transition-all duration-300">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      {action.type === 'twitter_follow' || action.type === 'twitter_retweet' ? <Twitter className="h-4 w-4 text-[#1DA1F2]" /> :
                       action.type === 'telegram_join' ? <Send className="h-4 w-4 text-[#0088cc]" /> :
                       <Globe className="h-4 w-4 text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{action.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{action.url}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-black text-primary leading-none">+{action.rewardAmount}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">{action.maxExecutions} slots</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-1">Escrow Summary</h4>
            <div className="p-5 bg-white/5 rounded-[24px] border border-white/10 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold py-1 border-b border-white/5">
                  <span className="text-muted-foreground uppercase tracking-widest">Platform Creation Fee</span>
                  <span className="text-white">0.5000 SOL</span>
                </div>
                <div className="flex justify-between text-xs font-bold py-1 border-b border-white/5">
                  <span className="text-muted-foreground uppercase tracking-widest">Airdrop Gas Allocation</span>
                  <span className="text-white">{gasFeeSol} SOL</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Total Required (SOL)</span>
                  <div className="px-4 py-2 bg-primary/20 rounded-xl border border-primary/40">
                    <span className="font-mono font-black text-primary text-xl tracking-tighter">{totalCostSol}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 pt-6 mt-4 border-t border-white/5 relative z-20">
        <Button 
          variant="outline" 
          className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-2 hover:bg-white/5 transition-all"
          onClick={onBack} 
          disabled={isPending}
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Adjust Settings
        </Button>
        <Button 
          className="flex-[1.5] h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-sm bg-primary hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all"
          onClick={onConfirm} 
          disabled={isPending}
        >
          {isPending ? (
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              DEPLOYING ESCROW...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              LAUNCH CAMPAIGN <Rocket className="h-5 w-5 ml-1 animate-pulse" />
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}

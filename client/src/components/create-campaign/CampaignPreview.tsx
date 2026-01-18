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
  ChevronLeft,
  AlertCircle,
  ExternalLink,
  Wallet
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
  const platformFee = 0.5; 
  const totalCostSol = Number((platformFee + gasFeeSol).toFixed(4));

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Banner & Brand Card */}
      <div className="relative group p-1">
        <div className="relative h-56 rounded-[32px] overflow-hidden bg-primary/10 border-4 border-primary/20 shadow-2xl">
          {values.bannerUrl ? (
            <img
              src={values.bannerUrl}
              alt="Campaign Banner"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-primary/20 space-y-2 bg-gradient-to-br from-primary/5 to-primary/20">
              <Eye className="h-16 w-16 opacity-20" />
              <span className="text-xs font-black uppercase tracking-widest opacity-40">Campaign Banner Preview</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-[24px] overflow-hidden bg-background/40 border-4 border-white/30 shadow-2xl backdrop-blur-xl group-hover:scale-105 transition-transform duration-500">
                <img src={values.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-display font-black text-2xl text-white italic tracking-tighter uppercase drop-shadow-lg">
                    {values.title}
                  </h3>
                  <Badge variant="default" className="text-[10px] h-5 bg-primary text-primary-foreground font-black shadow-lg shadow-primary/30">PREVIEW</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-primary font-mono text-base font-black tracking-[0.2em] drop-shadow-md">${values.tokenName}</span>
                  <div className="flex items-center gap-2">
                    {values.websiteUrl && <Globe className="h-3.5 w-3.5 text-white/60 hover:text-white transition-colors cursor-pointer" />}
                    {values.twitterUrl && <Twitter className="h-3.5 w-3.5 text-white/60 hover:text-white transition-colors cursor-pointer" />}
                    {values.telegramUrl && <Send className="h-3.5 w-3.5 text-white/60 hover:text-white transition-colors cursor-pointer" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Rocket className="h-3.5 w-3.5 text-primary" />
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Campaign Core</h4>
            </div>
            <div className="p-6 bg-primary/5 rounded-[28px] border border-primary/10 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Rocket className="h-24 w-24" />
              </div>
              <div className="space-y-5 relative z-10">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-sm text-white uppercase font-black tracking-widest">Type</span>
                  <Badge variant="outline" className="text-xs uppercase font-black tracking-widest py-1.5 border-primary/30 text-primary bg-primary/5">
                    {values.campaignType?.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white uppercase font-black tracking-widest">Airdrop Pool</span>
                  <div className="text-right">
                    <span className="block text-3xl font-mono font-black text-primary leading-none tracking-tighter">
                      {values.totalBudget?.toLocaleString()}
                    </span>
                    <span className="text-xs font-black uppercase text-white tracking-widest">${values.tokenName}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Active Security</h4>
            </div>
            <div className="p-6 bg-white/5 rounded-[28px] border border-white/10 space-y-4 shadow-inner">
              {[
                { label: `Min ${values.minSolBalance} SOL Balance`, active: values.minSolBalance > 0 },
                { label: `Min ${values.minWalletAgeDays}d Wallet Age`, active: values.minWalletAgeDays > 0 },
                { label: `Min ${values.minXFollowers} X Followers`, active: values.minXFollowers > 0 },
                { label: `Min ${values.minXAccountAgeDays}d X Age`, active: values.minXAccountAgeDays > 0 },
                { label: `Hold ${values.minHoldingAmount} $${values.tokenName}`, active: values.minHoldingAmount > 0 },
                { label: `Hold Duration: ${values.minHoldingDuration}d`, active: values.minHoldingDuration > 0 },
              ].filter(p => p.active).length > 0 ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { label: `Min ${values.minSolBalance} SOL Balance`, active: values.minSolBalance > 0 },
                    { label: `Min ${values.minWalletAgeDays}d Wallet Age`, active: values.minWalletAgeDays > 0 },
                    { label: `Min ${values.minXFollowers} X Followers`, active: values.minXFollowers > 0 },
                    { label: `Min ${values.minXAccountAgeDays}d X Age`, active: values.minXAccountAgeDays > 0 },
                    { label: `Hold ${values.minHoldingAmount} $${values.tokenName}`, active: (values.minHoldingAmount || 0) > 0 },
                    { label: `Hold Duration: ${values.minHoldingDuration}d`, active: (values.minHoldingDuration || 0) > 0 },
                  ].map((p, i) => p.active && (
                    <div key={i} className="flex items-center gap-3 text-xs font-black text-white py-2.5 px-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{p.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 space-y-2 opacity-60">
                  <AlertCircle className="h-10 w-10 text-white" />
                  <span className="text-xs font-black uppercase tracking-widest italic text-white">Standard Protections Only</span>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Coins className="h-3.5 w-3.5 text-primary" />
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Engagement Plan</h4>
            </div>
            <div className="p-6 bg-primary/5 rounded-[28px] border border-primary/10 space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar shadow-inner">
              {isHolder ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="p-4 bg-primary/20 rounded-full animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    <Coins className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white">Reward Per Participant</p>
                    <p className="text-3xl font-mono font-black text-primary leading-tight">
                      {values.rewardPerWallet?.toLocaleString()}
                    </p>
                    <p className="text-xs font-black uppercase text-white tracking-widest">${values.tokenName}</p>
                  </div>
                </div>
              ) : (
                values.actions?.map((action: any, i: number) => (
                  <div key={i} className="group flex items-center gap-4 p-4 bg-white/10 rounded-[20px] border border-white/10 hover:border-primary/40 hover:bg-white/20 transition-all duration-500">
                    <div className="p-3 bg-primary/20 rounded-xl group-hover:bg-primary/30 group-hover:scale-110 transition-all shadow-inner">
                      {action.type === 'twitter_follow' || action.type === 'twitter_retweet' ? <Twitter className="h-5 w-5 text-[#1DA1F2]" /> :
                       action.type === 'telegram_join' ? <Send className="h-5 w-5 text-[#0088cc]" /> :
                       <Globe className="h-5 w-5 text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate uppercase tracking-tight group-hover:text-primary transition-colors">{action.title}</p>
                      <p className="text-xs text-white/60 truncate italic font-medium">{action.url}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-mono font-black text-primary leading-none">+{action.rewardAmount}</p>
                      <p className="text-[10px] font-black text-white uppercase tracking-tighter mt-1.5">{action.maxExecutions} SLOTS</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Wallet className="h-3.5 w-3.5 text-primary" />
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Financial Settlement</h4>
            </div>
            <div className="p-6 bg-white/5 rounded-[28px] border border-white/10 space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 p-2 opacity-5">
                <Shield className="h-20 w-20" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center py-2 border-b border-white/10 group">
                  <span className="text-xs font-black text-white/60 uppercase tracking-[0.15em] group-hover:text-primary transition-colors">Creation Fee</span>
                  <span className="text-xs font-mono font-black text-white/60 group-hover:text-primary transition-colors">0.5000 SOL</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10 group">
                  <span className="text-xs font-black text-white/60 uppercase tracking-[0.15em] group-hover:text-white transition-colors">Gas Allocation</span>
                  <span className="text-xs font-mono font-black text-white/60 group-hover:text-primary transition-colors">{gasFeeSol} SOL</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <div className="space-y-1">
                    <span className="block text-xs font-black text-primary uppercase tracking-[0.3em] leading-none">Total Settlement</span>
                    <span className="text-[10px] font-bold text-white/40 uppercase italic tracking-widest">(Secured in Escrow)</span>
                  </div>
                  <div className="px-5 py-2.5 bg-primary/20 rounded-2xl border-2 border-primary/40 shadow-[0_0_20px_rgba(34,197,94,0.2)] group hover:scale-105 transition-transform">
                    <span className="font-mono font-black text-primary text-3xl tracking-tighter group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">{totalCostSol}</span>
                    <span className="text-xs font-black text-primary/60 ml-1">SOL</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="flex gap-4 pt-8 mt-6 border-t border-white/10 relative z-20 pb-2">
        <Button 
          variant="outline" 
          className="flex-1 h-16 rounded-[20px] font-black uppercase tracking-[0.2em] text-[10px] border-2 hover:bg-white/5 border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={onBack} 
          disabled={isPending}
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Adjust Settings
        </Button>
        <Button 
          className="flex-[1.8] h-16 rounded-[20px] font-black uppercase tracking-[0.3em] text-sm bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all relative overflow-hidden group"
          onClick={onConfirm} 
          disabled={isPending}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
          {isPending ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              DEPLOYING SMART CONTRACT...
            </div>
          ) : (
            <div className="flex items-center gap-3">
              LAUNCH CAMPAIGN <Rocket className="h-6 w-6 animate-bounce" />
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}

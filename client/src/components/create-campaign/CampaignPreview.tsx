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

  return (
    <div className="space-y-6">
      <div className="relative h-32 rounded-lg overflow-hidden bg-primary/10 border border-primary/20">
        {values.bannerUrl ? (
          <img
            src={values.bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary/40">
            <Eye className="h-8 w-8" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-background/80 backdrop-blur-md p-2 rounded-lg border border-primary/20">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary/10">
            <img
              src={values.logoUrl}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-none">{values.title}</h3>
            <p className="text-xs text-muted-foreground">{values.tokenName}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <section>
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
              Campaign Details
            </h4>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category:</span>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {values.campaignType?.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Budget:</span>
                <span className="font-mono text-primary font-bold">
                  {values.totalBudget} {values.tokenName}
                </span>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
              Requirements
            </h4>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 space-y-1">
              {values.minSolBalance > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  <span>Min {values.minSolBalance} SOL Balance</span>
                </div>
              )}
              {values.minXFollowers > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  <span>Min {values.minXFollowers} X Followers</span>
                </div>
              )}
              {!values.minSolBalance && !values.minXFollowers && (
                <span className="text-xs text-muted-foreground">
                  No specific requirements
                </span>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section>
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
              Action Summary
            </h4>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 space-y-2 max-h-[150px] overflow-y-auto">
              {isHolder ? (
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="h-4 w-4 text-primary" />
                  <span>Reward per Wallet: {values.rewardPerWallet}</span>
                </div>
              ) : (
                values.actions?.map((action: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs py-1 border-b border-primary/5 last:border-0"
                  >
                    {action.type === "twitter_follow" && (
                      <Twitter className="h-3 w-3" />
                    )}
                    {action.type === "telegram_join" && (
                      <Send className="h-3 w-3" />
                    )}
                    {action.type === "website" && <Globe className="h-3 w-3" />}
                    <span className="flex-1 truncate">{action.title}</span>
                    <span className="font-mono text-primary">
                      {action.rewardAmount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
              Estimated Fees
            </h4>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Creation Fee:</span>
                <span>0.5 SOL</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Gas (Escrow):</span>
                <span>{gasFeeSol} SOL</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-primary/10">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={isPending}
        >
          Back to Edit
        </Button>
        <Button
          className="flex-1 font-bold"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? "Launching..." : "Confirm & Launch"}
        </Button>
      </div>
    </div>
  );
}

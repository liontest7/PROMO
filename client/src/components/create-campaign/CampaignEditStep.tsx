import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ProjectDetailsFields, SocialLinksFields } from "../CampaignFormFields";
import { CampaignActionFields } from "../CampaignActionFields";
import { CampaignRequirementFields } from "../CampaignRequirementFields";
import { type FormValues } from "./schema";

interface CampaignEditStepProps {
  form: UseFormReturn<FormValues>;
  settings: any;
  loadingSettings: boolean;
}

export function CampaignEditStep({ form, settings, loadingSettings }: CampaignEditStepProps) {
  const { toast } = useToast();
  const watchedType = form.watch("campaignType");

  const isHolderDisabled = !settings?.holderQualificationEnabled;
  const isSocialDisabled = !settings?.socialEngagementEnabled;

  const getCampaignStatusLabel = (type: string) => {
    if (type === "holder_qualification" && isHolderDisabled) return "(Maintenance)";
    if (type === "engagement" && isSocialDisabled) return "(Maintenance)";
    return "(Live)";
  };

  const fetchTokenMetadata = async (address: string) => {
    if (!address || address.length < 32) return;
    try {
      const mergedMetadata: any = {};
      const dexPromise = fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`)
        .then(res => res.json())
        .catch(() => null);
      const pumpPromise = fetch(`https://pmpapi.fun/api/get_metadata/${address}`)
        .then(res => res.json())
        .catch(() => null);
      const moralisPromise = fetch(`https://solana-gateway.moralis.io/token/mainnet/${address}/metadata`, {
        headers: {
          'accept': 'application/json',
          'X-API-Key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImRhY2M3ZmQ1LWYyOTgtNGY5Zi1iZDIwLTdiYWM5MWRkMjNhNCIsIm9yZ0lkIjoiNDcxNTg3IiwidXNlcklkIjoiNDg1MTI3IiwidHlwZUlkIjoiYmVlNmFiMTItODg0NS00Nzc3LWJlMDQtODU4ODYzOTYxMjAxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTgzNDIwMzksImV4cCI6NDkxNDEwMjAzOX0.twhytkJWhGoqh5NVfhSkG9Irub-cS2cSSqKqPCI5Ur8'
        }
      })
        .then(res => res.json())
        .catch(() => null);

      const jupPromise = fetch(`https://tokens.jup.ag/token/${address}`)
        .then(res => res.json())
        .catch(() => null);

      const [dexData, pumpData, moralisData, jupData] = await Promise.all([dexPromise, pumpPromise, moralisPromise, jupPromise]);

      mergedMetadata.logoUrl = "";

      if (pumpData && pumpData.success && pumpData.result) {
        const res = pumpData.result;
        if (!mergedMetadata.tokenName) mergedMetadata.tokenName = res.symbol;
        if (!mergedMetadata.title) mergedMetadata.title = `${res.name} Growth Campaign`;
        mergedMetadata.logoUrl = `https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/coin-image/${address}/86x86?alpha=true`;
        if (!mergedMetadata.description) mergedMetadata.description = res.description;
      }

      if (!mergedMetadata.logoUrl && jupData && jupData.logoURI) {
        mergedMetadata.logoUrl = jupData.logoURI;
        if (jupData.symbol && !mergedMetadata.tokenName) mergedMetadata.tokenName = jupData.symbol;
      }

      if (dexData && dexData.pairs && dexData.pairs.length > 0) {
        const bestPair = dexData.pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
        const token = bestPair.baseToken;
        if (token.symbol && !mergedMetadata.tokenName) mergedMetadata.tokenName = token.symbol;
        if (token.name && !mergedMetadata.title) mergedMetadata.title = `${token.name} Growth Campaign`;
        
        if (!mergedMetadata.logoUrl && bestPair.info?.imageUrl) {
           mergedMetadata.logoUrl = bestPair.info.imageUrl;
        }
        if (bestPair.info?.header) mergedMetadata.bannerUrl = bestPair.info.header;
        if (bestPair.info?.websites?.[0]?.url) mergedMetadata.websiteUrl = bestPair.info.websites[0].url;
        const twitter = bestPair.info?.socials?.find((s: any) => s.type === 'twitter');
        if (twitter?.url) mergedMetadata.twitterUrl = twitter.url;
        const telegram = bestPair.info?.socials?.find((s: any) => s.type === 'telegram');
        if (telegram?.url) mergedMetadata.telegramUrl = telegram.url;
      }

      if (moralisData && moralisData.mint) {
        if (moralisData.symbol && !mergedMetadata.tokenName) mergedMetadata.tokenName = moralisData.symbol;
        if (moralisData.name && !mergedMetadata.title) mergedMetadata.title = `${moralisData.name} Growth Campaign`;
        if (moralisData.logo && !mergedMetadata.logoUrl) {
           mergedMetadata.logoUrl = moralisData.logo;
        }
        if (moralisData.description && !mergedMetadata.description) mergedMetadata.description = moralisData.description;
        if (moralisData.links?.website && !mergedMetadata.websiteUrl) mergedMetadata.websiteUrl = moralisData.links.website;
        if (moralisData.links?.twitter && !mergedMetadata.twitterUrl) mergedMetadata.twitterUrl = moralisData.links.twitter;
      }

      if (Object.keys(mergedMetadata).length > 0) {
        if (mergedMetadata.tokenName) form.setValue('tokenName', mergedMetadata.tokenName);
        if (mergedMetadata.title && !form.getValues('title')) form.setValue('title', mergedMetadata.title);
        if (mergedMetadata.logoUrl) form.setValue('logoUrl', mergedMetadata.logoUrl);
        if (mergedMetadata.bannerUrl) form.setValue('bannerUrl', mergedMetadata.bannerUrl);
        if (mergedMetadata.description && !form.getValues('description')) form.setValue('description', mergedMetadata.description);
        if (mergedMetadata.websiteUrl) form.setValue('websiteUrl', mergedMetadata.websiteUrl);
        if (mergedMetadata.twitterUrl) form.setValue('twitterUrl', mergedMetadata.twitterUrl);
        if (mergedMetadata.telegramUrl) form.setValue('telegramUrl', mergedMetadata.telegramUrl);
        
        let mcValue = "";
        if (dexData?.pairs?.[0]?.marketCap) {
          mcValue = dexData.pairs[0].marketCap.toString();
        } else if (dexData?.pairs?.[0]?.fdv) {
          mcValue = dexData.pairs[0].fdv.toString();
        } else if (moralisData?.market_cap_usd) {
          mcValue = moralisData.market_cap_usd.toString();
        }
        
        if (mcValue) {
          form.setValue('initialMarketCap', mcValue);
        }

        toast({ title: "Metadata Loaded", description: `Successfully retrieved token details.` });
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
        <FormField
          control={form.control}
          name="tokenAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary font-black uppercase tracking-widest text-[10px]">Token Mint Address</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter Solana Mint Address..." 
                  className="bg-primary/5 border-primary/20 focus:border-primary h-12 font-mono text-xs text-white"
                  {...field} 
                  onChange={(e) => { 
                    field.onChange(e); 
                    fetchTokenMetadata(e.target.value); 
                  }} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="campaignType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary font-black uppercase tracking-widest text-[10px]">Campaign Category</FormLabel>
              <Select onValueChange={(value) => { field.onChange(value); if (value === "holder_qualification") { form.setValue("actions", []); } else { form.setValue("actions", [{ type: "website", title: "Visit Website", url: "", rewardAmount: 0.01, maxExecutions: 10 }]); } }} value={field.value}>
                <FormControl><SelectTrigger className="h-12 bg-primary/5 border-primary/20 font-black uppercase tracking-widest text-xs text-white"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                <SelectContent className="bg-black border-white/10">
                  <SelectItem value="holder_qualification" disabled={isHolderDisabled || loadingSettings} className="font-black uppercase tracking-widest text-xs py-3 text-white">
                    Holder Qualification {getCampaignStatusLabel("holder_qualification")}
                  </SelectItem>
                  <SelectItem value="engagement" disabled={isSocialDisabled || loadingSettings} className="font-black uppercase tracking-widest text-xs py-3 text-white">
                    Social Engagement {getCampaignStatusLabel("engagement")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {watchedType && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <ProjectDetailsFields form={form} />
          
          {watchedType === "engagement" ? (
            <CampaignActionFields form={form} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
              <FormField
                control={form.control}
                name="rewardPerWallet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-black text-white">Reward per Holder</FormLabel>
                    <FormControl><Input type="number" step="0.001" className="bg-white/5 border-white/10 text-white h-11" {...field} value={field.value ?? 0} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxClaims"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-black text-white">Max Holders</FormLabel>
                    <FormControl><Input type="number" className="bg-white/5 border-white/10 text-white h-11" {...field} value={field.value ?? 0} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <SocialLinksFields form={form} />
          <CampaignRequirementFields form={form} />

          <div className="pt-4 border-t border-white/5">
            <Button 
              type="submit" 
              className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest text-base hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all"
            >
              Review & Preview Campaign
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

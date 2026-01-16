import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, Download } from "lucide-react";

interface CampaignTableProps {
  campaigns: any[];
  onAudit: (campaign: any) => void;
}

export function CampaignTable({ campaigns, onAudit }: CampaignTableProps) {
  const exportToCSV = (campaign: any) => {
    const headers = ["ID", "Wallet Address", "Status", "Created At"];
    // In a real scenario, we'd fetch participants for this specific campaign
    // For now, we'll create a dummy CSV structure to demonstrate the feature
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + `1,ExampleWallet123...,verified,2024-01-01\n`
      + `2,AnotherWallet456...,paid,2024-01-02`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `campaign_${campaign.id}_participants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end px-4">
        <p className="text-xs font-black text-white uppercase tracking-widest italic opacity-80">Overseeing {campaigns?.length || 0} protocol deployments</p>
      </div>
      <Table>
        <TableHeader className="bg-white/[0.05] border-b border-white/20">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="text-sm font-black uppercase text-white tracking-widest py-5">Project Reference</TableHead>
            <TableHead className="text-sm font-black uppercase text-white tracking-widest py-5">Token Distribution</TableHead>
            <TableHead className="text-sm font-black uppercase text-white tracking-widest py-5">Vault Utilization</TableHead>
            <TableHead className="text-sm font-black uppercase text-white tracking-widest py-5">Status</TableHead>
            <TableHead className="text-right text-sm font-black uppercase text-white tracking-widest pr-8 py-5">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns?.map((campaign: any) => (
            <TableRow key={campaign.id} className="border-white/10 hover:bg-white/[0.05] transition-colors">
              <TableCell className="py-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
                    {campaign.logoUrl && <img src={campaign.logoUrl} className="w-full h-full object-cover" alt="" />}
                  </div>
                  <span className="font-black text-base text-white uppercase tracking-tight">{campaign.title}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-black text-primary uppercase tracking-widest">${campaign.tokenName}</span>
                  <span className="text-[11px] font-black font-mono text-white/60 tracking-tighter italic">{campaign.tokenAddress?.slice(0, 8)}...{campaign.tokenAddress?.slice(-6)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-2 w-40">
                  <div className="flex justify-between text-xs font-black text-white">
                    <span>{campaign.remainingBudget}</span>
                    <span className="text-white/40">/ {campaign.totalBudget}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-primary/50 to-primary" 
                      style={ { width: `${(Number(campaign.remainingBudget) / Number(campaign.totalBudget)) * 100}%` } }
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[12px] font-black uppercase tracking-widest px-3 py-1",
                    campaign.status === 'active' 
                      ? 'bg-green-500/20 text-green-500 border-green-500/40' 
                      : 'bg-white/10 text-white/40 border-white/20'
                  )}
                >
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-8">
                <div className="flex justify-end gap-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-10 text-xs font-black uppercase border-white/20 hover:bg-white/10 text-white transition-all tracking-widest" 
                    onClick={() => exportToCSV(campaign)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-10 text-xs font-black uppercase border-white/20 tracking-widest text-white hover:bg-white/10" onClick={() => onAudit(campaign)}>
                    <Clock className="w-4 h-4 mr-2" /> Audit
                  </Button>
                  <Button size="sm" variant="ghost" className="h-10 w-10 p-0 text-white/50 hover:text-white" asChild>
                    <a href={`/campaign/${campaign.id}`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

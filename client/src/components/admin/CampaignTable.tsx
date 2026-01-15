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
    <div className="space-y-4">
      <div className="flex justify-end px-4">
        <p className="text-[10px] font-black text-white uppercase tracking-widest">Manage All Protocol Campaigns</p>
      </div>
      <Table>
        <TableHeader className="bg-white/[0.02]">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[12px] font-black uppercase text-white tracking-widest">Project</TableHead>
            <TableHead className="text-[12px] font-black uppercase text-white tracking-widest">Token Info</TableHead>
            <TableHead className="text-[12px] font-black uppercase text-white tracking-widest">Budget Utilization</TableHead>
            <TableHead className="text-[12px] font-black uppercase text-white tracking-widest">Status</TableHead>
            <TableHead className="text-right text-[12px] font-black uppercase text-white tracking-widest pr-8">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns?.map((campaign: any) => (
            <TableRow key={campaign.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white/5 border border-white/10 overflow-hidden">
                    {campaign.logoUrl && <img src={campaign.logoUrl} className="w-full h-full object-cover" alt="" />}
                  </div>
                  <span className="font-bold text-sm">{campaign.title}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-primary uppercase">${campaign.tokenName}</span>
                  <span className="text-[10px] font-mono text-white font-bold opacity-80">{campaign.tokenAddress?.slice(0, 4)}...{campaign.tokenAddress?.slice(-4)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 w-32">
                  <div className="flex justify-between text-[10px] font-black text-white">
                    <span>{campaign.remainingBudget}</span>
                    <span className="opacity-50">/ {campaign.totalBudget}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={ { width: `${(Number(campaign.remainingBudget) / Number(campaign.totalBudget)) * 100}%` } }
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={campaign.status === 'active' 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20 text-[9px] font-black uppercase' 
                    : 'bg-white/10 text-white/50 border-white/20 text-[9px] font-black uppercase'}
                >
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-8">
                <div className="flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 text-xs font-black uppercase border-white/10 hover:bg-primary/10 hover:text-primary transition-all tracking-widest" 
                    onClick={() => exportToCSV(campaign)}
                    title="Export Participants CSV"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs font-black uppercase border-white/10 tracking-widest" onClick={() => onAudit(campaign)}>
                    <Clock className="w-4 h-4 mr-2" /> Audit
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                    <a href={`/campaign/${campaign.id}`} target="_blank">
                      <ExternalLink className="h-3 w-3" />
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

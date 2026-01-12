import { motion } from "framer-motion";
import { AlertCircle, Ban, Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";

interface StatusAlertProps {
  status: "suspended" | "blocked";
}

export function StatusAlert({ status }: StatusAlertProps) {
  const { disconnect } = useWallet();

  const content = {
    suspended: {
      icon: <Clock className="w-12 h-12 text-yellow-500" />,
      title: "Account Suspended",
      description: "Your account is temporarily suspended for verification purposes.",
      explanation: "Our security system flagged some activities that require a manual review. This process usually takes between a few hours and 3 business days.",
      action: "Please check back later or contact support if you believe this is a mistake.",
    },
    blocked: {
      icon: <Ban className="w-12 h-12 text-destructive" />,
      title: "Account Permanently Blocked",
      description: "Access to the platform has been permanently revoked.",
      explanation: "Your account was found to be in violation of our Terms of Service. This decision is final and follows multiple security system detections.",
      action: "You will no longer be able to use MemeDrop services with this wallet.",
    },
  }[status];

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 shadow-2xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-muted">
                {content.icon}
              </div>
            </div>
            <CardTitle className="text-2xl font-display font-bold">
              {content.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-lg font-medium text-foreground">
              {content.description}
            </p>
            <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground leading-relaxed">
              {content.explanation}
            </div>
            <p className="text-sm text-primary font-medium italic">
              {content.action}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center border-t bg-muted/30 p-4">
            <Button 
              variant="outline" 
              onClick={() => disconnect()}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Disconnect Wallet
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

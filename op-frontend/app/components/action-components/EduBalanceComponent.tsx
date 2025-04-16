import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, CreditCard, ArrowUpRight } from "lucide-react";

interface EduBalanceProps {
  balance: number;
  required: number;
  token: string;
}

export function EduBalanceComponent({
  balance,
  required,
  token,
}: EduBalanceProps) {
  const hasEnoughBalance = balance >= required;

  return (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">EDU Balance Check</h3>
          </div>
          <Badge variant={hasEnoughBalance ? "secondary" : "destructive"}>
            {hasEnoughBalance ? "Sufficient" : "Insufficient"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-400">Current Balance</span>
            </div>
            <div className="text-2xl font-bold">{balance} EDU</div>
          </div>

          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-400">
                Required for {token}
              </span>
            </div>
            <div className="text-2xl font-bold">{required} EDU</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

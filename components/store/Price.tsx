import { formatNepaliCurrency } from "@/lib/utils";

interface PriceProps {
  amount: number | null | undefined;
  className?: string;
  compareAt?: number | null;
}

export function Price({ amount, className, compareAt }: PriceProps) {
  const price = amount || 0;
  return (
    <div className={className}>
      <span className="font-semibold">{formatNepaliCurrency(price)}</span>
      {compareAt && compareAt > price && (
        <span className="ml-2 text-sm text-muted-foreground line-through">
          {formatNepaliCurrency(compareAt)}
        </span>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function ReturnModalButton({ issue, onComplete }: { issue: any; onComplete?: () => void }) {
  const [open, setOpen] = useState(false);
  const [damagedQty, setDamagedQty] = useState(0);
  const [returnNotes, setReturnNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const max = issue.quantity_issued || 1;

  async function handleReturn(mode: "all-good" | "damaged") {
    setProcessing(true);
    setError(null);
    let updates: any = {
      status: "returned",
      actual_return_date: new Date().toISOString(),
      return_notes: returnNotes || null,
    };
    if (mode === "damaged" && damagedQty > 0) {
      updates.return_condition = "damaged";
      updates.damaged_qty = damagedQty;
    } else {
      updates.return_condition = "good";
      updates.damaged_qty = 0;
    }
    const { error } = await supabase
      .from("issues")
      .update(updates)
      .eq("id", issue.id);
    setProcessing(false);
    if (error) {
      setError(error.message);
      return;
    }
    setOpen(false);
    if (onComplete) onComplete();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">Return</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Return Equipment</DialogTitle>
        <div className="space-y-2">
          <Label>Equipment</Label>
          <div>{issue.equipment?.name}</div>
          <div>Qty issued: <b>{max}</b></div>
        </div>
        <div className="space-y-2">
          <Label>Returned Qty Damaged?</Label>
          <Input
            type="number"
            min={0}
            max={max}
            value={damagedQty}
            onChange={e => setDamagedQty(Math.max(0, Math.min(max, Number(e.target.value))))}
          />
          <div className="flex text-xs space-x-2">
            <Button variant="outline" size="sm" onClick={() => setDamagedQty(max)}>Mark ALL Damaged</Button>
            <Button variant="outline" size="sm" onClick={() => setDamagedQty(0)}>None Damaged</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="returnNotes">Return Notes</Label>
          <Input
            id="returnNotes"
            placeholder="Any issues or notes about the return..."
            value={returnNotes}
            onChange={e => setReturnNotes(e.target.value)}
          />
        </div>
        {error && <div className="text-destructive text-sm">{error}</div>}
        <DialogFooter>
          <Button disabled={processing} onClick={() => handleReturn(damagedQty > 0 ? "damaged" : "all-good")}>{processing ? "Processing..." : "Mark Returned"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


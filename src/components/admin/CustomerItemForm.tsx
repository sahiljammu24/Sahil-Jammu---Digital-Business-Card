import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomerItem {
  id: string;
  item_name: string;
  rate: number;
}

interface CustomerItemFormProps {
  customerId: string;
  item: CustomerItem | null;
  onSuccess: () => void;
}

export function CustomerItemForm({ customerId, item, onSuccess }: CustomerItemFormProps) {
  const [itemName, setItemName] = useState('');
  const [rate, setRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setItemName(item.item_name);
      setRate(item.rate);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const itemData = {
        customer_id: customerId,
        item_name: itemName,
        rate: rate,
      };

      if (item) {
        // Update existing item
        const { error } = await supabase
          .from('customer_items')
          .update(itemData)
          .eq('id', item.id);
        if (error) throw error;
        toast({ title: "Success", description: "Item updated successfully" });
      } else {
        // Create new item
        const { error } = await supabase.from('customer_items').insert(itemData);
        if (error) throw error;
        toast({ title: "Success", description: "Item added successfully" });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Error",
        description: "Failed to save item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="item-name">Item Name</Label>
        <Input
          id="item-name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rate">Rate</Label>
        <Input
          id="rate"
          type="number"
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Item'}
      </Button>
    </form>
  );
}

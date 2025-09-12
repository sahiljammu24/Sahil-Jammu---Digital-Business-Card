import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Transaction {
  id: string;
  date: string;
  item: string;
  qty: number;
  rent: number;
}

interface CustomerItem {
  id: string;
  item_name: string;
  rate: number;
}

interface TransactionFormProps {
  customerId: string;
  transaction: Transaction | null;
  onSuccess: () => void;
}

export function TransactionForm({ customerId, transaction, onSuccess }: TransactionFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [item, setItem] = useState('');
  const [qty, setQty] = useState(1);
  const [rent, setRent] = useState(0);
  const [customerItems, setCustomerItems] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomerItems();
    if (transaction) {
      setDate(new Date(transaction.date).toISOString().split('T')[0]);
      setItem(transaction.item);
      setQty(transaction.qty);
      setRent(transaction.rent);
    }
  }, [transaction, customerId]);

  const fetchCustomerItems = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_items')
        .select('*')
        .eq('customer_id', customerId);
      if (error) throw error;
      setCustomerItems(data || []);
    } catch (error) {
      console.error('Error fetching customer items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const transactionData = {
        customer_id: customerId,
        date,
        item,
        qty,
        rent,
      };

      if (transaction) {
        // Update existing transaction
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', transaction.id);
        if (error) throw error;
        toast({ title: "Success", description: "Transaction updated successfully" });
      } else {
        // Create new transaction
        const { error } = await supabase.from('transactions').insert(transactionData);
        if (error) throw error;
        toast({ title: "Success", description: "Transaction added successfully" });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error",
        description: "Failed to save transaction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="item">Item</Label>
        <Select 
          value={item} 
          onValueChange={(value) => {
            setItem(value);
            const selectedItem = customerItems.find(it => it.item_name === value);
            if (selectedItem) {
              setRent(selectedItem.rate);
            }
          }}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an item" />
          </SelectTrigger>
          <SelectContent>
            {customerItems.map((customerItem) => (
              <SelectItem key={customerItem.id} value={customerItem.item_name}>
                {customerItem.item_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="qty">Quantity</Label>
          <Input
            id="qty"
            type="number"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 1)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rent">Rent</Label>
          <Input
            id="rent"
            type="number"
            value={rent}
            readOnly
          />
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Transaction'}
      </Button>
    </form>
  );
}

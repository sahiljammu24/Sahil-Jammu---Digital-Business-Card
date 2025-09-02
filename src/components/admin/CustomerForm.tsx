import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Customer {
  id: string;
  customer_id: string;
  name: string;
  mobile: string;
  address: string;
  previous_balance: number;
  payment_received: number;
}

interface CustomerFormProps {
  customer?: Customer | null;
  onSuccess: () => void;
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    customer_id: '',
    name: '',
    mobile: '',
    address: '',
    previous_balance: 0,
    payment_received: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (customer) {
      setFormData({
        customer_id: customer.customer_id,
        name: customer.name,
        mobile: customer.mobile,
        address: customer.address,
        previous_balance: customer.previous_balance,
        payment_received: customer.payment_received
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (customer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update(formData)
          .eq('id', customer.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Customer updated successfully"
        });
      } else {
        // Create new customer
        const { error } = await supabase
          .from('customers')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Customer created successfully"
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save customer",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('balance') || name.includes('received') ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_id">Customer ID</Label>
          <Input
            id="customer_id"
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            required
            placeholder="CUST-08220948-800"
          />
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="mobile">Mobile</Label>
          <Input
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="previous_balance">Previous Balance</Label>
          <Input
            id="previous_balance"
            name="previous_balance"
            type="number"
            step="0.01"
            value={formData.previous_balance}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="payment_received">Payment Received</Label>
          <Input
            id="payment_received"
            name="payment_received"
            type="number"
            step="0.01"
            value={formData.payment_received}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : customer ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
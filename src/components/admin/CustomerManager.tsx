import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, ShoppingCart, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CustomerForm } from './CustomerForm';
import { CustomerItemManager } from './CustomerItemManager';
import { TransactionManager } from './TransactionManager';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Customer {
  id: string;
  customer_id: string;
  name: string;
  mobile: string;
  address: string;
  previous_balance: number;
  payment_received: number;
}

export function CustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isItemManagerOpen, setIsItemManagerOpen] = useState(false);
  const [isTransactionManagerOpen, setIsTransactionManagerOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer deleted successfully"
      });
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive"
      });
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile.includes(searchTerm)
  );

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
    setSelectedCustomer(null);
    fetchCustomers();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCustomer(null)}>
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
              </DialogTitle>
            </DialogHeader>
            <CustomerForm 
              customer={selectedCustomer} 
              onSuccess={handleFormSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {filteredCustomers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No customers found</p>
          </Card>
        ) : (
          filteredCustomers.map((customer) => (
            <Collapsible key={customer.id} asChild>
              <Card>
                <CollapsibleTrigger asChild>
                  <div className="p-4 flex justify-between items-center cursor-pointer">
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <span className={`font-medium ${(customer.previous_balance - customer.payment_received) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{(customer.previous_balance - customer.payment_received).toLocaleString()}
                    </span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 border-t">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                            {customer.customer_id}
                          </span>
                        </div>
                        <p className="text-muted-foreground mb-2">{customer.mobile}</p>
                        <p className="text-sm text-muted-foreground mb-2">{customer.address}</p>
                        <div className="flex gap-4 text-sm">
                          <span>Balance: ₹{customer.previous_balance.toLocaleString()}</span>
                          <span>Paid: ₹{customer.payment_received.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsTransactionManagerOpen(true);
                          }}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsItemManagerOpen(true);
                          }}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsFormDialogOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(customer.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>

      <Dialog open={isItemManagerOpen} onOpenChange={setIsItemManagerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Items for {selectedCustomer?.name}</DialogTitle>
          </DialogHeader>
          {selectedCustomer && <CustomerItemManager customerId={selectedCustomer.id} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isTransactionManagerOpen} onOpenChange={setIsTransactionManagerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Transactions for {selectedCustomer?.name}</DialogTitle>
          </DialogHeader>
          {selectedCustomer && <TransactionManager customerId={selectedCustomer.id} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

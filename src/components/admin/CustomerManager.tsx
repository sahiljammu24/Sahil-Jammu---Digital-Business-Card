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
  customer_items: Array<{ item_name: string; rate: number; }>;
  transactions: Array<{ date: string; item: string; qty: number; rent: number; }>;
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
    setLoading(true);
    try {
        const { data: customersData, error } = await supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const detailedCustomers = await Promise.all(
            customersData.map(async (customer) => {
                const { data: customer_items } = await supabase
                    .from('customer_items')
                    .select('item_name, rate')
                    .eq('customer_id', customer.id);

                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('date, item, qty, rent')
                    .eq('customer_id', customer.id);

                return {
                    ...customer,
                    customer_items: customer_items || [],
                    transactions: transactions || [],
                };
            })
        );

        setCustomers(detailedCustomers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        toast({
            title: "Error",
            description: "Failed to fetch detailed customer data",
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

  const calculateCustomerDueFromData = (customer: Customer | null): number => {
    if (!customer) {
      return 0;
    }

    const { customer_items, transactions, previous_balance, payment_received } = customer;

    if (!transactions || transactions.length === 0) {
      const balance = previous_balance - payment_received;
      return Math.max(balance, 0);
    }

    const sortedTrans = [...transactions]
      .map(tx => ({ ...tx, date: new Date(tx.date) }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    let totalRent = 0;
    const currentItems: { [key: string]: number } = {};
    customer_items.forEach(item => {
        currentItems[item.item_name] = 0;
    });

    let lastDate = sortedTrans[0].date;

    for (const transaction of sortedTrans) {
        const currentDate = transaction.date;
        const days = Math.max(0, Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)));

        if (days > 0) {
            for (const [itemName, count] of Object.entries(currentItems)) {
                if (count > 0) {
                    const itemData = customer_items.find(it => it.item_name === itemName);
                    const itemRentPrice = itemData ? itemData.rate : 0;
                    totalRent += days * count * itemRentPrice;
                }
            }
        }

        if (transaction.item in currentItems) {
            currentItems[transaction.item] += transaction.qty;
        }
        lastDate = currentDate;
    }

    // Calculate rent from the last transaction to today
    const today = new Date();
    const daysSinceLastTx = Math.max(0, Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)));

    if (daysSinceLastTx > 0) {
        for (const [itemName, count] of Object.entries(currentItems)) {
            if (count > 0) {
                const itemData = customer_items.find(it => it.item_name === itemName);
                const itemRentPrice = itemData ? itemData.rate : 0;
                totalRent += daysSinceLastTx * count * itemRentPrice;
            }
        }
    }

    const grandTotal = totalRent + previous_balance - payment_received;

    return Math.max(grandTotal, 0);
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
                    <span className={`font-medium ${calculateCustomerDueFromData(customer) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{calculateCustomerDueFromData(customer).toLocaleString()}
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

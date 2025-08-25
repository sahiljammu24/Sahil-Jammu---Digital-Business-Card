import { useState } from 'react';
import { Search, ArrowLeft, Phone, MapPin, Calendar, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CustomerData {
  id: string;
  customer_id: string;
  name: string;
  mobile: string;
  address: string;
  previous_balance: number;
  payment_received: number;
  payment_history: Array<{
    payment_id: string;
    date: string;
    amount: number;
    method: string;
    reference: string;
    notes: string;
  }>;
  customer_items: Array<{
    item_name: string;
    rate: number;
  }>;
  transactions: Array<{
    date: string;
    item: string;
    qty: number;
    rent: number;
  }>;
}

export default function CustomerLookup() {
  const [customerId, setCustomerId] = useState('');
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!customerId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a customer ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch customer data
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_id', customerId.trim())
        .single();

      if (customerError || !customerData) {
        toast({
          title: "Customer Not Found",
          description: "No customer found with this ID",
          variant: "destructive"
        });
        return;
      }

      // Fetch payment history
      const { data: paymentHistory } = await supabase
        .from('payment_history')
        .select('*')
        .eq('customer_id', customerData.id)
        .order('date', { ascending: false });

      // Fetch customer items
      const { data: customerItems } = await supabase
        .from('customer_items')
        .select('*')
        .eq('customer_id', customerData.id);

      // Fetch transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', customerData.id)
        .order('date', { ascending: false });

      setCustomer({
        ...customerData,
        payment_history: paymentHistory || [],
        customer_items: customerItems || [],
        transactions: transactions || []
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch customer data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentBalance = (customer: CustomerData | null): number => {
    if (!customer) {
      return 0;
    }

    const { customer_items, transactions, previous_balance, payment_received } = customer;

    if (!transactions || transactions.length === 0) {
      return Math.max(previous_balance - payment_received, 0);
    }

    const parsedTransactions = transactions
      .map(tx => ({
        ...tx,
        date: new Date(tx.date),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const itemRents: { [key: string]: number } = {};
    const currentItems: { [key: string]: number } = {};
    customer_items.forEach(item => {
      currentItems[item.item_name] = 0;
    });

    for (let i = 0; i < parsedTransactions.length; i++) {
      const { date, item, qty } = parsedTransactions[i];

      if (item in currentItems) {
        currentItems[item] += qty;
      }

      if (i < parsedTransactions.length - 1) {
        const nextDate = parsedTransactions[i + 1].date;
        const timeDiff = nextDate.getTime() - date.getTime();
        const days = Math.round(timeDiff / (1000 * 3600 * 24));

        for (const itemName in currentItems) {
          if (currentItems[itemName] > 0) {
            const itemInfo = customer_items.find(ci => ci.item_name === itemName);
            const itemRentPrice = itemInfo ? itemInfo.rate : 0;
            const rentAmount = days * currentItems[itemName] * itemRentPrice;
            itemRents[itemName] = (itemRents[itemName] || 0) + rentAmount;
          }
        }
      }
    }

    const totalRent = Object.values(itemRents).reduce((sum, rent) => sum + rent, 0);
    const grandTotal = totalRent + previous_balance - payment_received;

    return Math.max(grandTotal, 0);
  };

  const currentBalance = calculateCurrentBalance(customer);

  return (
    <main className="min-h-screen p-4" style={{ background: 'var(--gradient-bg)' }}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Business Card
          </Button>
          <h1 className="text-3xl font-bold text-center">Customer Lookup</h1>
        </header>

        <Card className="glass-card p-6 mb-6">
          <div className="flex gap-4">
            <Input
              placeholder="Enter Customer ID (e.g., CUST-08220948-800)"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
            {customerId === 'admin' && (
              <Button onClick={() => navigate('/admin')} variant="destructive">
                Admin
              </Button>
            )}
          </div>
        </Card>

        {customer && (
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-4">{customer.name}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>{customer.mobile}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{customer.address}</span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Previous Balance</p>
                    <p className="text-lg font-semibold">₹{customer.previous_balance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Received</p>
                    <p className="text-lg font-semibold text-green-600">₹{customer.payment_received.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className={`text-lg font-semibold ${currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{currentBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment History */}
            <Card className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment History
              </h3>
              {customer.payment_history.length > 0 ? (
                <div className="space-y-3">
                  {customer.payment_history.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{payment.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(payment.date).toLocaleDateString()}</p>
                        {payment.reference && (
                          <p className="text-xs text-muted-foreground">Ref: {payment.reference}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No payment history available</p>
              )}
            </Card>

            {/* Current Items */}
            <Card className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4">Current Items</h3>
              {customer.customer_items.length > 0 ? (
                <div className="grid gap-3">
                  {customer.customer_items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium">{item.item_name}</span>
                      <span className="text-primary">₹{item.rate}/unit</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No items on rent</p>
              )}
            </Card>

            {/* Recent Transactions */}
            <Card className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Transactions
              </h3>
              {customer.transactions.length > 0 ? (
                <div className="space-y-3">
                  {customer.transactions.map((transaction, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{transaction.item}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {transaction.qty} × ₹{transaction.rent} = ₹{(transaction.qty * transaction.rent).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent transactions</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

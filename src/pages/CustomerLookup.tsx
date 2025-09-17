import { useState, useEffect } from 'react';
import { Search, ArrowLeft, Phone, MapPin, Calendar, CreditCard, Copy } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { Separator } from '@/components/ui/separator';
import { applyTheme, colorThemes } from '@/components/ThemeColorSelector';
import { ThemeToggle } from '@/components/ThemeToggle';

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
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { customerId: urlCustomerId } = useParams();

  useEffect(() => {
    if (urlCustomerId) {
      setCustomerId(urlCustomerId);
      handleSearch(urlCustomerId);
      const arcticMintTheme = colorThemes.find(theme => theme.name === 'Arctic Mint');
      if (arcticMintTheme) {
        applyTheme(arcticMintTheme);
      }
    }
  }, [urlCustomerId]);

  const handleSearch = async (id: string | null = null) => {
    const searchId = id || customerId;
    if (!searchId.trim()) {
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
        .eq('customer_id', searchId.trim())
        .single();

      if (customerError || !customerData) {
        toast({
          title: "Customer Not Found",
          description: "No customer found with this ID",
          variant: "destructive"
        });
        setCustomer(null);
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

      const customerWithDetails = {
        ...customerData,
        payment_history: paymentHistory || [],
        customer_items: customerItems || [],
        transactions: transactions || []
      };

      setCustomer(customerWithDetails);
      setCurrentBalance(calculateCustomerDueFromData(customerWithDetails));

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

  const calculateCustomerDueFromData = (customerData: CustomerData | null): number => {
    if (!customerData) {
      return 0;
    }

    const { customer_items, transactions, previous_balance, payment_received } = customerData;

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

  const shareDetails = async () => {
    if (!customer) return;

    const currentBalance = calculateCustomerDueFromData(customer);
    const shareUrl = `${window.location.origin}/customer-lookup/${urlCustomerId || customerId}`;
    const text = `
      Customer: ${customer.name}\n
      Mobile: ${customer.mobile}\n
      Address: ${customer.address}\n
      --------------------

      Previous Balance: ₹${customer.previous_balance.toLocaleString()}\n
      Payment Received: ₹${customer.payment_received.toLocaleString()}\n
      Current Balance: ₹${currentBalance.toLocaleString()}\n
      --------------------

      Thanks for your business!\n
      Jammu Shuttering Store

          Link: ${shareUrl}
        

    `;

    if (navigator.share) {
      try {
        await navigator.share({ text, url: shareUrl });
        toast({ title: "Details Shared Successfully!" });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({ title: "Error Sharing Details", variant: "destructive" });
      }
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "Details Copied to Clipboard!" });
    }
  };

  return (
    <main className="min-h-screen p-4" style={{ background: 'var(--gradient-bg)' }}>
      <div className="max-w-md mx-auto">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Business Card
            </Button>
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-bold text-center">Customer Lookup</h1>
        </header>

        <Card className="glass-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Enter Customer ID (e.g., CUST-08220948-800)"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={() => handleSearch()} disabled={loading}>
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
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold mb-4">{customer.name}</h2>
                <Button onClick={shareDetails} variant="outline">Share Details</Button>
              </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
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

            {/* UPI Payment */}
            {currentBalance > 0 && (
                            <Card className="glass-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Pay with UPI</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">sp9793893@okaxis</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText('sp9793893@okaxis');
                        toast({ title: "UPI ID Copied!" });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <QRCodeGenerator
                      url={`upi://pay?pa=sp9793893@okaxis&pn=${encodeURIComponent(customer.name)}&am=${currentBalance}&cu=INR`}
                      size={160}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan the QR code with your favorite UPI app
                  </p>
                  
                  <Separator className="my-2" />

                  <a
                    href={`upi://pay?pa=sp9793893@okaxis&pn=${encodeURIComponent(customer.name)}&am=${currentBalance}&cu=INR`}
                    className="w-full"
                  >
                    <Button className="w-full text-lg py-6">
                      <CreditCard className="w-5 h-5 mr-3" />
                      Pay ₹{currentBalance.toLocaleString()} Now
                    </Button>
                  </a>
                </div>
              </Card>
            )}

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


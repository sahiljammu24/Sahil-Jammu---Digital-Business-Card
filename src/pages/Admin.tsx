import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Upload, Settings, LogOut, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerManager } from '@/components/admin/CustomerManager';
import { BusinessCardEditor } from '@/components/admin/BusinessCardEditor';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';

export default function Admin() {
  const [businessCard, setBusinessCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBusinessCardSettings();
  }, []);

  const fetchBusinessCardSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('business_card_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setBusinessCard(data);
    } catch (error) {
      console.error('Error fetching business card settings:', error);
      toast({
        title: "Error",
        description: "Failed to load business card settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      toast({
        title: "Success",
        description: "Password updated successfully!"
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to change password',
        variant: "destructive"
      });
    }
  };

  const handleImportCustomers = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        if (Array.isArray(jsonData)) {
          // Handle array of customers
          for (const customerData of jsonData) {
            await importSingleCustomer(customerData);
          }
        } else {
          // Handle single customer
          await importSingleCustomer(jsonData);
        }

        toast({
          title: "Success",
          description: "Customers imported successfully"
        });
      } catch (error) {
        console.error('Error importing customers:', error);
        toast({
          title: "Error",
          description: "Failed to import customers. Please check the JSON format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const importSingleCustomer = async (customerData: any) => {
    // Insert customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        customer_id: customerData.customer_id,
        name: customerData.name,
        mobile: customerData.mobile,
        address: customerData.address,
        previous_balance: customerData.previous_balance || 0,
        payment_received: customerData.payment_received || 0
      })
      .select()
      .single();

    if (customerError) throw customerError;

    // Insert payment history
    if (customerData.payment_history && customerData.payment_history.length > 0) {
      const paymentHistory = customerData.payment_history.map((payment: any) => ({
        customer_id: customer.id,
        payment_id: payment.id,
        date: payment.date,
        amount: payment.amount,
        method: payment.method,
        reference: payment.reference || '',
        notes: payment.notes || ''
      }));

      await supabase.from('payment_history').insert(paymentHistory);
    }

    // Insert customer items
    if (customerData.items && customerData.items.length > 0) {
      const customerItems = customerData.items.map((item: any) => ({
        customer_id: customer.id,
        item_name: item[0],
        rate: item[1]
      }));

      await supabase.from('customer_items').insert(customerItems);
    }

    // Insert transactions
    if (customerData.transactions && customerData.transactions.length > 0) {
      const transactions = customerData.transactions.map((transaction: any) => ({
        customer_id: customer.id,
        date: transaction.date,
        item: transaction.item,
        qty: transaction.qty,
        rent: transaction.rent
      }));

      await supabase.from('transactions').insert(transactions);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4" style={{ background: 'var(--gradient-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-center mb-2">Admin Panel</h1>
            <p className="text-center text-muted-foreground">Manage customers and card settings</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </header>

        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customers">Customer</TabsTrigger>
            <TabsTrigger value="settings">Card Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-6">
            <Card className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Customer Management</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => document.getElementById('file-input')?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import JSON
                  </Button>
                  <input
                    id="file-input"
                    type="file"
                    accept=".json"
                    onChange={handleImportCustomers}
                    className="hidden"
                  />
                </div>
              </div>
              <CustomerManager />
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-6 h-6" />
                <h2 className="text-2xl font-semibold">Business Card Settings</h2>
              </div>
              <BusinessCardEditor 
                businessCard={businessCard} 
                onUpdate={fetchBusinessCardSettings} 
              />
            </Card>
          </TabsContent>
          <TabsContent value="security">
            <Card className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <KeyRound className="w-6 h-6" />
                <h2 className="text-2xl font-semibold">Change Password</h2>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="old-password">Old Password</Label>
                  <Input
                    id="old-password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Change Password</Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
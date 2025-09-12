-- Create customers table based on the JSON structure
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  address TEXT,
  previous_balance DECIMAL(10,2) DEFAULT 0,
  payment_received DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_history table
CREATE TABLE public.payment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_items table
CREATE TABLE public.customer_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  item TEXT NOT NULL,
  qty INTEGER NOT NULL,
  rent DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_card_settings table for editable card info
CREATE TABLE public.business_card_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_alt TEXT,
  email TEXT NOT NULL,
  website TEXT,
  location TEXT NOT NULL,
  bio TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  social_linkedin TEXT,
  social_instagram TEXT,
  social_facebook TEXT,
  social_twitter TEXT,
  social_youtube TEXT,
  social_github TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_card_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to customers (for customer lookup)
CREATE POLICY "Allow public read access to customers by customer_id" 
ON public.customers 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access to payment_history" 
ON public.payment_history 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access to customer_items" 
ON public.customer_items 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access to transactions" 
ON public.transactions 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access to business_card_settings" 
ON public.business_card_settings 
FOR SELECT 
USING (true);

-- Admin policies (will be updated when auth is implemented)
CREATE POLICY "Admin can manage customers" 
ON public.customers 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admin can manage payment_history" 
ON public.payment_history 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admin can manage customer_items" 
ON public.customer_items 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admin can manage transactions" 
ON public.transactions 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admin can manage business_card_settings" 
ON public.business_card_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_card_settings_updated_at
  BEFORE UPDATE ON public.business_card_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default business card settings
INSERT INTO public.business_card_settings (
  user_id, name, title, company, phone, email, location, bio, skills,
  social_instagram, social_facebook
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Sahil Jammu',
  'Founder & Rental Store',
  'Jammu Shuttering Store',
  '+91 90410 37238',
  'jammushutterringstore@gmail.com',
  'Jammu, J&K, India',
  'I build efficient rental billing apps and modern web experiences. Passionate about creating solutions that help businesses streamline their operations and improve customer satisfaction.',
  '{Business Management,Rental Operations,Customer Service,Digital Solutions,Construction Equipment}',
  'https://instagram.com/jammushutterringstore',
  'https://facebook.com/jammushutterringstore'
);
import { Phone, Mail, Globe, MapPin, Copy } from 'lucide-react';
import { ContactData } from '../types/contact';
import { copyToClipboard } from '../utils/contact';
import { useToast } from '../hooks/use-toast';

interface ContactDetailsProps {
  contact: ContactData;
}

export function ContactDetails({ contact }: ContactDetailsProps) {
  const { toast } = useToast();

  const handleCopy = async (text: string, label: string) => {
    try {
      await copyToClipboard(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <section aria-labelledby="contact-details" className="space-y-4">
      <h2 id="contact-details" className="text-lg font-semibold">Contact Details</h2>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
          <Phone className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="font-medium">{contact.phone}</p>
            <p className="text-sm text-muted-foreground">Primary</p>
          </div>
          <button
            onClick={() => handleCopy(contact.phone, "Phone number")}
            className="btn-glass p-2 rounded-lg"
            aria-label="Copy phone number"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        
        {contact.phoneAlt && (
          <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
            <Phone className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium">{contact.phoneAlt}</p>
              <p className="text-sm text-muted-foreground">Secondary</p>
            </div>
            <button
              onClick={() => handleCopy(contact.phoneAlt!, "Secondary phone")}
              className="btn-glass p-2 rounded-lg"
              aria-label="Copy secondary phone number"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
          <Mail className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="font-medium break-all">{contact.email}</p>
            <p className="text-sm text-muted-foreground">Email</p>
          </div>
          <button
            onClick={() => handleCopy(contact.email, "Email")}
            className="btn-glass p-2 rounded-lg"
            aria-label="Copy email address"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        
        {contact.website && (
          <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
            <Globe className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium break-all">{contact.website}</p>
              <p className="text-sm text-muted-foreground">Website</p>
            </div>
            <button
              onClick={() => handleCopy(contact.website!, "Website")}
              className="btn-glass p-2 rounded-lg"
              aria-label="Copy website URL"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
          <MapPin className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="font-medium">{contact.location}</p>
            <p className="text-sm text-muted-foreground">Location</p>
          </div>
        </div>
      </div>
    </section>
  );
}
import { Phone, Mail, MessageCircle, MapPin, Download, FileDown, Search } from 'lucide-react';
import { ContactData } from '../types/contact';
import { makeCall, sendEmail, sendWhatsApp, openMaps, downloadVCard } from '../utils/contact';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ContactActionsProps {
  contact: ContactData;
}

export function ContactActions({ contact }: ContactActionsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAction = (action: () => void, message: string) => {
    try {
      action();
      toast({
        title: "Success",
        description: message,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Action failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section aria-labelledby="contact-actions" className="space-y-4">
      <h2 id="contact-actions" className="sr-only">Contact Actions</h2>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAction(() => makeCall(contact.phone), "Opening phone app...")}
          className="btn-glass flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium"
          aria-label={`Call ${contact.name}`}
        >
          <Phone className="w-4 h-4" />
          Call
        </button>
        
        <button
          onClick={() => handleAction(() => sendEmail(contact.email), "Opening email app...")}
          className="btn-glass flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium"
          aria-label={`Email ${contact.name}`}
        >
          <Mail className="w-4 h-4" />
          Email
        </button>
        
        <button
          onClick={() => handleAction(() => sendWhatsApp(contact.phone), "Opening WhatsApp...")}
          className="btn-glass flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium"
          aria-label={`WhatsApp ${contact.name}`}
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </button>
        
        <button
          onClick={() => handleAction(() => openMaps(contact.location), "Opening maps...")}
          className="btn-glass flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium"
          aria-label={`Get directions to ${contact.location}`}
        >
          <MapPin className="w-4 h-4" />
          Directions
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAction(() => downloadVCard(contact), "Contact saved!")}
          className="btn-primary-glass flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium"
          aria-label="Save contact to your device"
        >
          <Download className="w-4 h-4" />
          Save Contact
        </button>
        
        <button
          onClick={() => navigate('/customer-lookup')}
          className="btn-primary-glass flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium no-print"
          aria-label="Customer Lookup"
        >
          <Search className="w-4 h-4" />
          Customer Lookup
        </button>
      </div>
    </section>
  );
}
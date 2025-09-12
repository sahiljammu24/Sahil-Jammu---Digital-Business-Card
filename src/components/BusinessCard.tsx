import { useEffect, useState } from 'react';
import { Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ContactData } from '../types/contact';
import { ContactActions } from './ContactActions';
import { ContactDetails } from './ContactDetails';
import { SocialLinks } from './SocialLinks';
import { SkillTags } from './SkillTags';
import { QRCodeGenerator } from './QRCodeGenerator';
import { shareCard, generateStructuredData } from '../utils/contact';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { ThemeColorSelector } from './ThemeColorSelector';

import { supabase } from '@/integrations/supabase/client';
import sahilAvatar from '../assets/sahil-avatar.jpg';
interface BusinessCardProps {
  contact?: ContactData;
}

export function BusinessCard({ contact: initialContact }: BusinessCardProps) {
  const [contact, setContact] = useState<ContactData | null>(initialContact || null);
  const [loading, setLoading] = useState(!initialContact);
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentUrl = window.location.href;

  useEffect(() => {
    if (!initialContact) {
      fetchBusinessCardData();
    }
  }, [initialContact]);

  useEffect(() => {
    if (contact) {
      // Add structured data to the page
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = generateStructuredData(contact);
      document.head.appendChild(script);
      return () => {
        // Cleanup
        const existingScript = document.querySelector('script[type="application/ld+json"]');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    }
  }, [contact]);

  const fetchBusinessCardData = async () => {
    try {
      const { data, error } = await supabase
        .from('business_card_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const contactData: ContactData = {
          name: data.name,
          title: data.title,
          company: data.company,
          phone: data.phone,
          phoneAlt: data.phone_alt || '',
          email: data.email,
          website: data.website || '',
          location: data.location,
          bio: data.bio,
          skills: data.skills || [],
          social: {
            linkedin: data.social_linkedin || '',
            instagram: data.social_instagram || '',
            facebook: data.social_facebook || '',
            twitter: data.social_twitter || '',
            youtube: data.social_youtube || '',
            github: data.social_github || ''
          },
          profileUrl: currentUrl
        };
        setContact(contactData);
      }
    } catch (error) {
      console.error('Error fetching business card data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleShare = () => {
    if (!contact) return;
    shareCard(currentUrl, `${contact.name} - Digital Business Card`);
    if (!navigator.share) {
      toast({
        title: "Link Copied!",
        description: "Business card link copied to clipboard"
      });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center" style={{
        background: 'var(--gradient-bg)'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading business card...</p>
        </div>
      </main>
    );
  }

  if (!contact) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center" style={{
        background: 'var(--gradient-bg)'
      }}>
        <div className="text-center">
          <p>Business card not found</p>
        </div>
      </main>
    );
  }
  return <main className="min-h-screen p-4 flex items-center justify-center" style={{
    background: 'var(--gradient-bg)'
  }}>
      <article className="glass-card w-full max-w-md p-4 sm:p-6 rounded-2xl space-y-6">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="relative inline-block">
            <img src={sahilAvatar} alt={`${contact.name} profile picture`} className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-primary/20" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" aria-hidden="true"></div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold">{contact.name}</h1>
            <p className="text-lg text-muted-foreground">{contact.title}</p>
            <p className="text-sm font-medium text-primary">{contact.company}</p>
          </div>
        </header>

        {/* Quick Actions */}
        <ContactActions contact={contact} />

        {/* Contact Details */}
        <ContactDetails contact={contact} />

        {/* Social Links */}
        <SocialLinks contact={contact} />

        {/* About */}
        <section aria-labelledby="about" className="space-y-4">
          <h2 id="about" className="text-lg font-semibold">About</h2>
          <p className="text-muted-foreground leading-relaxed">{contact.bio}</p>
        </section>

        {/* Skills */}
        <SkillTags skills={contact.skills} />

        {/* QR Code */}
        <section aria-labelledby="qr-code" className="text-center space-y-4">
          
          
        </section>

        {/* Footer */}
        <footer className="text-center space-y-4 pt-4 border-t border-border/50">
          <div className="flex justify-center gap-2 flex-wrap">
            <button onClick={handleShare} className="btn-primary-glass inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium no-print" aria-label="Share this business card">
              <Share2 className="w-4 h-4" />
              Share Card
            </button>
            <ThemeColorSelector />
          </div>
          
          <p className="text-xs text-muted-foreground">
            © 2024 {contact.name}. Digital Business Card.
          </p>
        </footer>
      </article>
    </main>;
}
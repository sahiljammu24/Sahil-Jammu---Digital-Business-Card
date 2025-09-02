import { Linkedin, Instagram, Facebook, Twitter, Youtube, Github } from 'lucide-react';
import { ContactData } from '../types/contact';

interface SocialLinksProps {
  contact: ContactData;
}

export function SocialLinks({ contact }: SocialLinksProps) {
  const socialPlatforms = [
    { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', url: contact.social.linkedin },
    { key: 'instagram', icon: Instagram, label: 'Instagram', url: contact.social.instagram },
    { key: 'facebook', icon: Facebook, label: 'Facebook', url: contact.social.facebook },
    { key: 'twitter', icon: Twitter, label: 'Twitter/X', url: contact.social.twitter },
    { key: 'youtube', icon: Youtube, label: 'YouTube', url: contact.social.youtube },
    { key: 'github', icon: Github, label: 'GitHub', url: contact.social.github },
  ].filter(platform => platform.url);

  if (socialPlatforms.length === 0) return null;

  return (
    <section aria-labelledby="social-links" className="space-y-4">
      <h2 id="social-links" className="text-lg font-semibold">Connect</h2>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {socialPlatforms.map(({ key, icon: Icon, label, url }) => (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass p-3 rounded-xl transition-all duration-300 hover:scale-105"
            aria-label={`Visit ${label} profile`}
          >
            <Icon className="w-5 h-5" />
          </a>
        ))}
      </div>
    </section>
  );
}
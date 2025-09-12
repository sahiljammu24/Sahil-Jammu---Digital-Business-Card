import { ContactData } from '../types/contact';

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function generateVCard(contact: ContactData): string {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.name}`,
    `TITLE:${contact.title}`,
    `ORG:${contact.company}`,
    `TEL;TYPE=CELL:${contact.phone}`,
    ...(contact.phoneAlt ? [`TEL;TYPE=WORK:${contact.phoneAlt}`] : []),
    `EMAIL:${contact.email}`,
    ...(contact.website ? [`URL:${contact.website}`] : []),
    `ADR;TYPE=WORK:;;${contact.location};;;;`,
    `NOTE:${contact.bio}`,
    ...(contact.social.linkedin ? [`URL;TYPE=LinkedIn:${contact.social.linkedin}`] : []),
    ...(contact.social.instagram ? [`URL;TYPE=Instagram:${contact.social.instagram}`] : []),
    ...(contact.social.facebook ? [`URL;TYPE=Facebook:${contact.social.facebook}`] : []),
    ...(contact.social.twitter ? [`URL;TYPE=Twitter:${contact.social.twitter}`] : []),
    ...(contact.social.youtube ? [`URL;TYPE=YouTube:${contact.social.youtube}`] : []),
    ...(contact.social.github ? [`URL;TYPE=GitHub:${contact.social.github}`] : []),
    'END:VCARD'
  ].join('\n');
  
  return vcard;
}

export function downloadVCard(contact: ContactData): void {
  const vcard = generateVCard(contact);
  const blob = new Blob([vcard], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${contact.name.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function downloadPDF(): void {
  window.print();
}

export function openMaps(location: string): void {
  const query = encodeURIComponent(location);
  window.open(`https://maps.google.com/?q=${query}`, '_blank');
}

export function makeCall(phone: string): void {
  window.open(`tel:${phone}`);
}

export function sendEmail(email: string): void {
  window.open(`mailto:${email}`);
}

export function sendWhatsApp(phone: string): void {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  window.open(`https://wa.me/${cleanPhone}`, '_blank');
}

export function shareCard(url: string, title: string): void {
  if (navigator.share) {
    navigator.share({
      title,
      url,
    }).catch(console.error);
  } else {
    copyToClipboard(url);
  }
}

export function generateStructuredData(contact: ContactData): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": contact.name,
    "jobTitle": contact.title,
    "worksFor": {
      "@type": "Organization",
      "name": contact.company
    },
    "email": contact.email,
    "telephone": contact.phone,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": contact.location
    },
    "url": contact.website,
    "sameAs": Object.values(contact.social).filter(Boolean)
  };
  
  return JSON.stringify(structuredData);
}
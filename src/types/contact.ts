export interface ContactData {
  name: string;
  title: string;
  company: string;
  phone: string;
  phoneAlt?: string;
  email: string;
  website?: string;
  location: string;
  bio: string;
  skills: string[];
  social: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    github?: string;
  };
  profileUrl?: string;
}
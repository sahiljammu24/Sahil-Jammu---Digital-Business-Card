import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BusinessCardEditorProps {
  businessCard: any;
  onUpdate: () => void;
}

export function BusinessCardEditor({ businessCard, onUpdate }: BusinessCardEditorProps) {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    phone: '',
    phone_alt: '',
    email: '',
    website: '',
    location: '',
    bio: '',
    skills: '',
    social_linkedin: '',
    social_instagram: '',
    social_facebook: '',
    social_twitter: '',
    social_youtube: '',
    social_github: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (businessCard) {
      setFormData({
        name: businessCard.name || '',
        title: businessCard.title || '',
        company: businessCard.company || '',
        phone: businessCard.phone || '',
        phone_alt: businessCard.phone_alt || '',
        email: businessCard.email || '',
        website: businessCard.website || '',
        location: businessCard.location || '',
        bio: businessCard.bio || '',
        skills: businessCard.skills?.join(', ') || '',
        social_linkedin: businessCard.social_linkedin || '',
        social_instagram: businessCard.social_instagram || '',
        social_facebook: businessCard.social_facebook || '',
        social_twitter: businessCard.social_twitter || '',
        social_youtube: businessCard.social_youtube || '',
        social_github: businessCard.social_github || ''
      });
    }
  }, [businessCard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      };

      if (businessCard) {
        // Update existing
        const { error } = await supabase
          .from('business_card_settings')
          .update(dataToSave)
          .eq('id', businessCard.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('business_card_settings')
          .insert({
            ...dataToSave,
            user_id: '00000000-0000-0000-0000-000000000000'
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Business card settings updated successfully"
      });
      onUpdate();
    } catch (error: any) {
      console.error('Error saving business card settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save business card settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone_alt">Alternative Phone</Label>
          <Input
            id="phone_alt"
            name="phone_alt"
            value={formData.phone_alt}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={3}
          required
        />
      </div>

      <div>
        <Label htmlFor="skills">Skills (comma-separated)</Label>
        <Input
          id="skills"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="Business Management, Rental Operations, Customer Service"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Social Links</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="social_linkedin">LinkedIn</Label>
            <Input
              id="social_linkedin"
              name="social_linkedin"
              value={formData.social_linkedin}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="social_instagram">Instagram</Label>
            <Input
              id="social_instagram"
              name="social_instagram"
              value={formData.social_instagram}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="social_facebook">Facebook</Label>
            <Input
              id="social_facebook"
              name="social_facebook"
              value={formData.social_facebook}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="social_twitter">Twitter</Label>
            <Input
              id="social_twitter"
              name="social_twitter"
              value={formData.social_twitter}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="social_youtube">YouTube</Label>
            <Input
              id="social_youtube"
              name="social_youtube"
              value={formData.social_youtube}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="social_github">GitHub</Label>
            <Input
              id="social_github"
              name="social_github"
              value={formData.social_github}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
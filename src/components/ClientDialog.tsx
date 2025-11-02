import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { clientSchema } from '@/lib/validations';

interface Client {
  id?: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
  onSave: () => void;
}

export function ClientDialog({ open, onOpenChange, client, onSave }: ClientDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Client>(
    client || { name: '', email: '', phone: '', status: 'Actif' }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = clientSchema.parse(formData);
      
      if (client?.id) {
        const { error } = await supabase
          .from('clients')
          .update(validatedData)
          .eq('id', client.id);
        if (error) throw error;
        toast.success('Client modifié avec succès');
      } else {
        const { error } = await supabase.from('clients').insert([validatedData as any]);
        if (error) throw error;
        toast.success('Client ajouté avec succès');
      }
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      if (error.errors) {
        toast.error(error.errors[0]?.message || 'Données invalides');
      } else {
        toast.error(error.message || 'Erreur lors de la sauvegarde');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? 'Modifier le client' : 'Nouveau client'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Suspendu">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sauvegarder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
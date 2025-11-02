import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { inventorySchema, type InventoryFormData } from "@/lib/validations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  item?: any;
}

export function InventoryDialog({ open, onOpenChange, onSuccess, item }: InventoryDialogProps) {
  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: item ? {
      name: item.name,
      description: item.description || "",
      quantity: item.quantity,
      min_quantity: item.min_quantity,
      unit: item.unit,
    } : {
      name: "",
      description: "",
      quantity: 0,
      min_quantity: 10,
      unit: "unité",
    },
  });

  const onSubmit = async (data: InventoryFormData) => {
    try {
      if (item) {
        const { error } = await supabase
          .from("inventory")
          .update(data)
          .eq("id", item.id);
        
        if (error) throw error;
        toast.success("Article mis à jour avec succès");
      } else {
        const { error } = await supabase
          .from("inventory")
          .insert([data]);
        
        if (error) throw error;
        toast.success("Article ajouté avec succès");
      }
      
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? "Modifier l'article" : "Ajouter un article"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'article</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Routeur Wifi 6" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Description de l'article" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité min.</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: pièce, kg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {item ? "Mettre à jour" : "Ajouter"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

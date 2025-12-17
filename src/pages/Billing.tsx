import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InvoiceDialog } from "@/components/InvoiceDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ExportButtons } from "@/components/ExportButtons";

interface Invoice {
  id: string;
  client_id: string;
  invoice_number: string;
  amount: number;
  status: string;
  issue_date: string;
  due_date: string;
  clients?: {
    name: string;
  };
}

export default function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    const filtered = invoices.filter(
      (invoice) =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvoices(filtered);
  }, [searchTerm, invoices]);

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        clients (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des factures");
      return;
    }

    setInvoices(data || []);
    setFilteredInvoices(data || []);
  };

  const handleDelete = async () => {
    if (!invoiceToDelete) return;

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceToDelete);

    if (error) {
      toast.error("Erreur lors de la suppression");
      return;
    }

    toast.success("Facture supprimée avec succès");
    fetchInvoices();
    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Payée": "default",
      "En Attente": "secondary",
      "En retard": "destructive",
      "Brouillon": "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedInvoice(undefined);
    setDialogOpen(true);
  };

  const invoiceColumns = [
    { header: "Numéro", accessor: "invoice_number" },
    { header: "Client", accessor: (row: Invoice) => row.clients?.name || "" },
    { header: "Montant (MAD)", accessor: "amount" },
    { header: "Date d'émission", accessor: (row: Invoice) => new Date(row.issue_date).toLocaleDateString('fr-FR') },
    { header: "Date d'échéance", accessor: (row: Invoice) => new Date(row.due_date).toLocaleDateString('fr-FR') },
    { header: "Statut", accessor: "status" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Facturation</h1>
          <p className="text-muted-foreground mt-1">Gérez toutes vos factures</p>
        </div>
        <div className="flex gap-2">
          <ExportButtons
            data={filteredInvoices}
            columns={invoiceColumns}
            title="Liste des Factures"
            filename="factures"
          />
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Date d'émission</TableHead>
              <TableHead>Date d'échéance</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  Aucune facture trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.clients?.name}</TableCell>
                  <TableCell>{invoice.amount.toLocaleString()} MAD</TableCell>
                  <TableCell>{new Date(invoice.issue_date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>{new Date(invoice.due_date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(invoice)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setInvoiceToDelete(invoice.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InvoiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invoice={selectedInvoice}
        onSave={fetchInvoices}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

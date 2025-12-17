import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OpportunityDialog } from "@/components/OpportunityDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ExportButtons } from "@/components/ExportButtons";

interface Opportunity {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  value: number;
  stage_id: string;
  probability: number;
  expected_close_date?: string;
  status: string;
  clients?: {
    name: string;
  };
  pipeline_stages?: {
    name: string;
    color: string;
  };
}

interface Stage {
  id: string;
  name: string;
  position: number;
  color: string;
}

export default function CRM() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchStages();
    fetchOpportunities();
  }, []);

  const fetchStages = async () => {
    const { data, error } = await supabase
      .from("pipeline_stages")
      .select("*")
      .order("position");

    if (error) {
      toast.error("Erreur lors du chargement des étapes");
      return;
    }

    setStages(data || []);
  };

  const fetchOpportunities = async () => {
    const { data, error } = await supabase
      .from("opportunities")
      .select(`
        *,
        clients (name),
        pipeline_stages (name, color)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des opportunités");
      return;
    }

    setOpportunities(data || []);
  };

  const handleDelete = async () => {
    if (!opportunityToDelete) return;

    const { error } = await supabase
      .from("opportunities")
      .delete()
      .eq("id", opportunityToDelete);

    if (error) {
      toast.error("Erreur lors de la suppression");
      return;
    }

    toast.success("Opportunité supprimée avec succès");
    fetchOpportunities();
    setDeleteDialogOpen(false);
    setOpportunityToDelete(null);
  };

  const filteredOpportunities = opportunities.filter(
    (opp) =>
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOpportunitiesByStage = (stageId: string) => {
    return filteredOpportunities.filter((opp) => opp.stage_id === stageId);
  };

  const getTotalValue = (stageId: string) => {
    return getOpportunitiesByStage(stageId).reduce((sum, opp) => sum + Number(opp.value), 0);
  };

  const opportunityColumns = [
    { header: "Titre", accessor: "title" },
    { header: "Client", accessor: (row: Opportunity) => row.clients?.name || "" },
    { header: "Valeur (MAD)", accessor: "value" },
    { header: "Étape", accessor: (row: Opportunity) => row.pipeline_stages?.name || "" },
    { header: "Probabilité (%)", accessor: "probability" },
    { header: "Date clôture prévue", accessor: (row: Opportunity) => row.expected_close_date ? new Date(row.expected_close_date).toLocaleDateString('fr-FR') : "-" },
    { header: "Statut", accessor: "status" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM - Pipeline Commercial</h1>
          <p className="text-muted-foreground mt-1">Gérez vos opportunités commerciales</p>
        </div>
        <div className="flex gap-2">
          <ExportButtons
            data={filteredOpportunities}
            columns={opportunityColumns}
            title="Opportunités Commerciales"
            filename="opportunites"
          />
          <Button onClick={() => { setSelectedOpportunity(undefined); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Opportunité
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const stageOpportunities = getOpportunitiesByStage(stage.id);
          const totalValue = getTotalValue(stage.id);

          return (
            <div key={stage.id} className="space-y-3">
              <Card className="border-t-4" style={{ borderTopColor: stage.color }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>{stage.name}</span>
                    <Badge variant="outline">{stageOpportunities.length}</Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {totalValue.toLocaleString()} MAD
                  </p>
                </CardHeader>
              </Card>

              <div className="space-y-2">
                {stageOpportunities.map((opportunity) => (
                  <Card key={opportunity.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{opportunity.title}</h4>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {opportunity.probability}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{opportunity.clients?.name}</p>
                      <div className="flex items-center gap-1 text-xs font-medium">
                        <TrendingUp className="h-3 w-3" />
                        {opportunity.value.toLocaleString()} MAD
                      </div>
                      {opportunity.expected_close_date && (
                        <p className="text-xs text-muted-foreground">
                          Clôture: {new Date(opportunity.expected_close_date).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedOpportunity(opportunity);
                            setDialogOpen(true);
                          }}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOpportunityToDelete(opportunity.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <OpportunityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        opportunity={selectedOpportunity}
        onSave={fetchOpportunities}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette opportunité ? Cette action est irréversible.
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

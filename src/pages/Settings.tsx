import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Server, Key, Mail } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Configuration de connexion Odoo</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle>Configuration Odoo</CardTitle>
          </div>
          <CardDescription>
            Connectez votre instance Odoo pour synchroniser les données
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="odoo-url">URL Odoo</Label>
            <Input 
              id="odoo-url" 
              placeholder="https://votre-instance.odoo.com"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="database">Base de données</Label>
            <Input 
              id="database" 
              placeholder="nom_de_votre_base"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input 
              id="username" 
              placeholder="admin@example.com"
              type="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">Clé API</Label>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <Input 
                id="api-key" 
                placeholder="Votre clé API Odoo"
                type="password"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Générez une clé API depuis votre compte Odoo : Préférences → Sécurité → Clés API
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">État de la connexion</p>
              <p className="text-sm text-muted-foreground">Non connecté</p>
            </div>
            <Button>Tester la Connexion</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Configuration SMTP</CardTitle>
          </div>
          <CardDescription>
            Paramètres d'envoi des factures et notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smtp-host">Serveur SMTP</Label>
            <Input 
              id="smtp-host" 
              placeholder="smtp.gmail.com"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp-port">Port</Label>
              <Input 
                id="smtp-port" 
                placeholder="587"
                type="number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-email">Email d'envoi</Label>
              <Input 
                id="smtp-email" 
                placeholder="noreply@digitalmed.tn"
                type="email"
              />
            </div>
          </div>

          <Button variant="outline" className="w-full">
            Enregistrer les Paramètres
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

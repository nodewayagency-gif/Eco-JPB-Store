import { useEffect, useState } from "react";
import { Mail, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { AdminLead } from "@premium/contracts";
import { adminRepository } from "@/services/api/adminRepository";

const AdminLeadsPage = () => {
  const [leads, setLeads] = useState<AdminLead[]>([]);

  useEffect(() => {
    const load = async () => {
      setLeads(await adminRepository.listLeads());
    };

    load();
  }, []);

  const pending = leads.filter((lead) => !lead.notified).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total de Leads</span>
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{leads.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Aguardando Notificação</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{pending}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Taxa de Conversão</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">68%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Leads de Interesse</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>E-mail</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={`${lead.email}-${lead.date}`} className="border-border">
                  <TableCell>{lead.email}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.product}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.date}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={
                        lead.notified
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }
                    >
                      {lead.notified ? "Notificado" : "Pendente"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLeadsPage;


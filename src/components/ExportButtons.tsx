import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToPDF, exportToExcel } from "@/lib/exportUtils";
import { toast } from "sonner";

interface ExportColumn {
  header: string;
  accessor: string | ((row: any) => any);
}

interface ExportButtonsProps {
  data: any[];
  columns: ExportColumn[];
  title: string;
  filename: string;
}

export function ExportButtons({ data, columns, title, filename }: ExportButtonsProps) {
  const handleExportPDF = () => {
    if (data.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }
    exportToPDF(data, columns, title, filename);
    toast.success("Export PDF réussi");
  };

  const handleExportExcel = () => {
    if (data.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }
    exportToExcel(data, columns, filename);
    toast.success("Export Excel réussi");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleExportPDF} className="gap-2">
          <FileText className="h-4 w-4" />
          Exporter en PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Exporter en Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

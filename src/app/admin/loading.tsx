import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metrics Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-24 bg-secondary rounded"></div>
                <div className="w-4 h-4 bg-secondary rounded"></div>
              </div>
              <div className="h-8 w-32 bg-secondary rounded mb-2"></div>
              <div className="h-3 w-20 bg-secondary rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="h-4 w-32 bg-secondary rounded"></div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead><div className="h-4 w-12 bg-secondary rounded"></div></TableHead>
                <TableHead><div className="h-4 w-20 bg-secondary rounded"></div></TableHead>
                <TableHead><div className="h-4 w-24 bg-secondary rounded"></div></TableHead>
                <TableHead className="text-right"><div className="h-4 w-12 ml-auto bg-secondary rounded"></div></TableHead>
                <TableHead className="text-right"><div className="h-4 w-16 ml-auto bg-secondary rounded"></div></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="border-border">
                  <TableCell><div className="h-4 w-24 bg-secondary rounded"></div></TableCell>
                  <TableCell><div className="h-4 w-32 bg-secondary rounded"></div></TableCell>
                  <TableCell><div className="h-4 w-40 bg-secondary rounded"></div></TableCell>
                  <TableCell className="text-right"><div className="h-4 w-16 ml-auto bg-secondary rounded"></div></TableCell>
                  <TableCell className="text-right"><div className="h-6 w-20 ml-auto bg-secondary rounded-full"></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}



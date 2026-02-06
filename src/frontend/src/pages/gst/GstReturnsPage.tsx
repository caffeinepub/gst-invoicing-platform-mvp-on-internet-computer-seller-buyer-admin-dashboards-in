import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileBarChart, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useGenerateGSTR1, useGenerateGSTR3B } from '../../hooks/useGstReturns';
import { downloadJSON, downloadCSV } from '../../utils/download';
import type { GSTR1Data, GSTR3BData } from '../../types/extended';

export default function GstReturnsPage() {
  const generateGSTR1 = useGenerateGSTR1();
  const generateGSTR3B = useGenerateGSTR3B();

  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  
  const [gstr1Data, setGstr1Data] = useState<GSTR1Data | null>(null);
  const [gstr3bData, setGstr3bData] = useState<GSTR3BData | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const handleGenerateGSTR1 = async () => {
    try {
      const data = await generateGSTR1.mutateAsync({ 
        year: parseInt(year), 
        month: parseInt(month) 
      });
      setGstr1Data(data);
      toast.success('GSTR-1 generated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate GSTR-1');
    }
  };

  const handleGenerateGSTR3B = async () => {
    try {
      const data = await generateGSTR3B.mutateAsync({ 
        year: parseInt(year), 
        month: parseInt(month) 
      });
      setGstr3bData(data);
      toast.success('GSTR-3B generated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate GSTR-3B');
    }
  };

  const downloadGSTR1JSON = () => {
    if (gstr1Data) {
      downloadJSON(gstr1Data, `GSTR1_${gstr1Data.period}.json`);
      toast.success('GSTR-1 downloaded as JSON');
    }
  };

  const downloadGSTR1CSV = () => {
    if (gstr1Data) {
      const csvData = [
        ['Period', 'Total Taxable Value', 'Total CGST', 'Total SGST', 'Total IGST', 'Invoice Count'],
        [
          gstr1Data.period,
          gstr1Data.totalTaxableValue.toString(),
          gstr1Data.totalCGST.toString(),
          gstr1Data.totalSGST.toString(),
          gstr1Data.totalIGST.toString(),
          gstr1Data.invoiceCount.toString(),
        ],
      ];
      downloadCSV(csvData, `GSTR1_${gstr1Data.period}.csv`);
      toast.success('GSTR-1 downloaded as CSV');
    }
  };

  const downloadGSTR3BJSON = () => {
    if (gstr3bData) {
      downloadJSON(gstr3bData, `GSTR3B_${gstr3bData.period}.json`);
      toast.success('GSTR-3B downloaded as JSON');
    }
  };

  const downloadGSTR3BCSV = () => {
    if (gstr3bData) {
      const csvData = [
        ['Period', 'Outward Supplies', 'Inward Supplies', 'ITC Available', 'Total Tax'],
        [
          gstr3bData.period,
          gstr3bData.outwardSupplies.toString(),
          gstr3bData.inwardSupplies.toString(),
          gstr3bData.itcAvailable.toString(),
          gstr3bData.totalTax.toString(),
        ],
      ];
      downloadCSV(csvData, `GSTR3B_${gstr3bData.period}.csv`);
      toast.success('GSTR-3B downloaded as CSV');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">GST Returns</h1>
        <p className="text-muted-foreground mt-1">Generate GSTR-1 and GSTR-3B reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            Generate Returns
          </CardTitle>
          <CardDescription>Select a period to generate GST returns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger id="year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger id="month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="gstr1" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gstr1">GSTR-1</TabsTrigger>
          <TabsTrigger value="gstr3b">GSTR-3B</TabsTrigger>
        </TabsList>

        <TabsContent value="gstr1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GSTR-1 - Outward Supplies</CardTitle>
              <CardDescription>Details of outward supplies of goods or services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGenerateGSTR1} 
                disabled={generateGSTR1.isPending}
                className="w-full md:w-auto"
              >
                {generateGSTR1.isPending ? 'Generating...' : 'Generate GSTR-1'}
              </Button>

              {gstr1Data && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Period</p>
                      <p className="font-medium">{gstr1Data.period}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Invoice Count</p>
                      <p className="font-medium">{gstr1Data.invoiceCount.toString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Taxable Value</p>
                      <p className="font-medium">₹{gstr1Data.totalTaxableValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total CGST</p>
                      <p className="font-medium">₹{gstr1Data.totalCGST.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total SGST</p>
                      <p className="font-medium">₹{gstr1Data.totalSGST.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total IGST</p>
                      <p className="font-medium">₹{gstr1Data.totalIGST.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={downloadGSTR1JSON}>
                      <Download className="mr-2 h-4 w-4" />
                      Download JSON
                    </Button>
                    <Button variant="outline" onClick={downloadGSTR1CSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Download CSV
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gstr3b" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GSTR-3B - Summary Return</CardTitle>
              <CardDescription>Monthly summary of outward and inward supplies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGenerateGSTR3B} 
                disabled={generateGSTR3B.isPending}
                className="w-full md:w-auto"
              >
                {generateGSTR3B.isPending ? 'Generating...' : 'Generate GSTR-3B'}
              </Button>

              {gstr3bData && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Period</p>
                      <p className="font-medium">{gstr3bData.period}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Outward Supplies</p>
                      <p className="font-medium">₹{gstr3bData.outwardSupplies.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Inward Supplies</p>
                      <p className="font-medium">₹{gstr3bData.inwardSupplies.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ITC Available</p>
                      <p className="font-medium">₹{gstr3bData.itcAvailable.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Tax</p>
                      <p className="font-medium">₹{gstr3bData.totalTax.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={downloadGSTR3BJSON}>
                      <Download className="mr-2 h-4 w-4" />
                      Download JSON
                    </Button>
                    <Button variant="outline" onClick={downloadGSTR3BCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Download CSV
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

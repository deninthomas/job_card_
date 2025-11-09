"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, TrendingUp, TrendingDown, Minus, Printer } from "lucide-react";

interface LabourComparison {
  description: string;
  estimated_hours: number;
  actual_hours: number;
  estimated_cost: number;
  actual_cost: number;
  variance: number;
}

interface MaterialComparison {
  description: string;
  estimated_quantity: number;
  actual_quantity: number;
  estimated_amount: number;
  actual_amount: number;
  variance: number;
}

interface FinalStatement {
  work_order: any;
  estimate: any | null;
  has_estimate: boolean;
  labour_comparison: LabourComparison[];
  material_comparison: MaterialComparison[];
  financial_summary: {
    estimated: {
      labour_cost: number;
      material_cost: number;
      additional_charges: number;
      subtotal: number;
      discount: number;
      tax: number;
      grand_total: number;
    };
    actual: {
      labour_cost: number;
      material_cost: number;
      grand_total: number;
    };
    variance: {
      labour_cost: number;
      material_cost: number;
      total: number;
      percentage: number;
    };
  };
}

interface FinalStatementCardProps {
  workOrderId: string;
}

export function FinalStatementCard({ workOrderId }: FinalStatementCardProps) {
  const [statement, setStatement] = useState<FinalStatement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinalStatement();
  }, [workOrderId]);

  const fetchFinalStatement = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/work-order/${workOrderId}/final-statement`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch final statement");
      }

      setStatement(data.data);
    } catch (err: any) {
      console.error("Error fetching final statement:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (variance < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return "text-red-600";
    if (variance < 0) return "text-green-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Generating final statement...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchFinalStatement} className="mt-4">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!statement) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-purple-50 to-transparent">
        <CardTitle className="text-xl flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="h-5 w-5 text-purple-600" />
          </div>
          Final Statement
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print Statement
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Financial Summary */}
        {statement.has_estimate && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 bg-blue-50">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Estimated Total</p>
              <p className="text-3xl font-bold text-blue-600">
                ₹{statement.financial_summary.estimated.grand_total.toFixed(2)}
              </p>
            </div>
            <div className="border rounded-lg p-4 bg-green-50">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Actual Total</p>
              <p className="text-3xl font-bold text-green-600">
                ₹{statement.financial_summary.actual.grand_total.toFixed(2)}
              </p>
            </div>
            <div className={`border rounded-lg p-4 ${statement.financial_summary.variance.total > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Variance</p>
              <div className="flex items-center gap-2">
                {getVarianceIcon(statement.financial_summary.variance.total)}
                <p className={`text-3xl font-bold ${getVarianceColor(statement.financial_summary.variance.total)}`}>
                  {statement.financial_summary.variance.total > 0 ? '+' : ''}₹{statement.financial_summary.variance.total.toFixed(2)}
                </p>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {statement.financial_summary.variance.percentage > 0 ? '+' : ''}{statement.financial_summary.variance.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-900">Cost Breakdown</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Labour Cost</span>
              <div className="flex items-center gap-4">
                {statement.has_estimate && (
                  <span className="text-sm text-gray-400">
                    Est: ₹{statement.financial_summary.estimated.labour_cost.toFixed(2)}
                  </span>
                )}
                <span className="text-sm font-semibold">
                  ₹{statement.financial_summary.actual.labour_cost.toFixed(2)}
                </span>
                {statement.has_estimate && (
                  <span className={`text-sm font-medium w-24 text-right ${getVarianceColor(statement.financial_summary.variance.labour_cost)}`}>
                    {statement.financial_summary.variance.labour_cost > 0 ? '+' : ''}₹{statement.financial_summary.variance.labour_cost.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Material Cost</span>
              <div className="flex items-center gap-4">
                {statement.has_estimate && (
                  <span className="text-sm text-gray-400">
                    Est: ₹{statement.financial_summary.estimated.material_cost.toFixed(2)}
                  </span>
                )}
                <span className="text-sm font-semibold">
                  ₹{statement.financial_summary.actual.material_cost.toFixed(2)}
                </span>
                {statement.has_estimate && (
                  <span className={`text-sm font-medium w-24 text-right ${getVarianceColor(statement.financial_summary.variance.material_cost)}`}>
                    {statement.financial_summary.variance.material_cost > 0 ? '+' : ''}₹{statement.financial_summary.variance.material_cost.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            {statement.has_estimate && statement.financial_summary.estimated.additional_charges > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Additional Charges</span>
                <span className="text-sm font-semibold">
                  ₹{statement.financial_summary.estimated.additional_charges.toFixed(2)}
                </span>
              </div>
            )}
            {statement.has_estimate && statement.financial_summary.estimated.discount > 0 && (
              <div className="flex justify-between items-center text-red-600">
                <span className="text-sm">Discounts</span>
                <span className="text-sm font-semibold">
                  -₹{statement.financial_summary.estimated.discount.toFixed(2)}
                </span>
              </div>
            )}
            {statement.has_estimate && statement.financial_summary.estimated.tax > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tax</span>
                <span className="text-sm font-semibold">
                  ₹{statement.financial_summary.estimated.tax.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Labour Comparison */}
        {statement.has_estimate && statement.labour_comparison.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Labour Comparison</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Est. Hours</TableHead>
                    <TableHead className="text-right">Actual Hours</TableHead>
                    <TableHead className="text-right">Est. Cost</TableHead>
                    <TableHead className="text-right">Actual Cost</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statement.labour_comparison.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.estimated_hours.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{item.actual_hours.toFixed(1)}</TableCell>
                      <TableCell className="text-right">₹{item.estimated_cost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{item.actual_cost.toFixed(2)}</TableCell>
                      <TableCell className={`text-right font-semibold ${getVarianceColor(item.variance)}`}>
                        {item.variance > 0 ? '+' : ''}₹{item.variance.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Material Comparison */}
        {statement.has_estimate && statement.material_comparison.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Material Comparison</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Est. Quantity</TableHead>
                    <TableHead className="text-right">Actual Quantity</TableHead>
                    <TableHead className="text-right">Est. Amount</TableHead>
                    <TableHead className="text-right">Actual Amount</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statement.material_comparison.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.estimated_quantity}</TableCell>
                      <TableCell className="text-right">{item.actual_quantity}</TableCell>
                      <TableCell className="text-right">₹{item.estimated_amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{item.actual_amount.toFixed(2)}</TableCell>
                      <TableCell className={`text-right font-semibold ${getVarianceColor(item.variance)}`}>
                        {item.variance > 0 ? '+' : ''}₹{item.variance.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {!statement.has_estimate && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No estimate available for comparison</p>
            <p className="text-sm text-gray-500 mt-1">Only actual costs are shown</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


"use client";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  BanknoteIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  LightbulbIcon,
  PiggyBankIcon,
  ZapIcon,
} from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";

// Transaction type
interface Transaction {
  date: string;
  time: string | null;
  description: string;
  amount: number;
  upi_id: string | null;
  category: string;
}

// Full analysis type
interface FinancialAnalysis {
  transactions: Transaction[];
  summary: {
    total_spent: number;
    total_received: number;
    net_change: number;
    transaction_count: number;
    start_date: string;
    end_date: string;
  };
  category_breakdown: Record<
    string,
    {
      total: number;
      percentage: number;
      count: number;
    }
  >;
  insights: Array<{
    type: "saving_opportunity" | "spending_pattern" | "anomaly" | "tip";
    description: string;
    impact: number | null;
  }>;
  recommendations: Array<{
    category: string;
    action: string;
    potential_savings: number;
  }>;
}

interface TransactionSummaryProps {
  data: FinancialAnalysis;
}

// Colors for the different categories in charts
const CATEGORY_COLORS: Record<string, string> = {
  food: "#FF8042",
  shopping: "#0088FE",
  entertainment: "#00C49F",
  utilities: "#FFBB28",
  transport: "#FF6B6B",
  health: "#8884D8",
  education: "#82CA9D",
  travel: "#8DD1E1",
  subscription: "#A28BFF",
  other: "#D0D0D0",
};

// Type for pie chart label
interface PieChartLabelProps {
  name: string;
  percentage: number;
}

export function TransactionSummary({ data }: TransactionSummaryProps) {
  if (!data || !data.transactions || data.transactions.length === 0) {
    return null;
  }

  // Format as INR currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Prepare data for pie chart
  const pieChartData = Object.entries(data.category_breakdown).map(
    ([category, info]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: Math.abs(info.total),
      percentage: info.percentage,
    }),
  );

  // Prepare data for bar chart (top expenses by category)
  const barChartData = Object.entries(data.category_breakdown)
    .filter(([, info]) => info.total < 0) // Only show expenses (negative amounts)
    .sort((a, b) => Math.abs(b[1].total) - Math.abs(a[1].total)) // Sort by absolute amount
    .slice(0, 5) // Take the top 5
    .map(([category, info]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      amount: Math.abs(info.total), // Use absolute values for the chart
    }));

  return (
    <div className="w-full space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
            <CardTitle className="text-xs font-medium">Spent</CardTitle>
            <TrendingDownIcon className="text-destructive h-3.5 w-3.5" />
          </CardHeader>
          <CardContent className="py-2 px-4">
            <div className="text-destructive text-xl font-bold">
              {formatCurrency(data.summary.total_spent)}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
            <CardTitle className="text-xs font-medium">Received</CardTitle>
            <TrendingUpIcon className="h-3.5 w-3.5 text-emerald-500" />
          </CardHeader>
          <CardContent className="py-2 px-4">
            <div className="text-xl font-bold text-emerald-500">
              {formatCurrency(data.summary.total_received)}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
            <CardTitle className="text-xs font-medium">Net</CardTitle>
            <BanknoteIcon className="text-primary h-3.5 w-3.5" />
          </CardHeader>
          <CardContent className="py-2 px-4">
            <div
              className={`text-xl font-bold ${data.summary.net_change >= 0 ? "text-emerald-500" : "text-destructive"}`}
            >
              {formatCurrency(data.summary.net_change)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        {data.summary.start_date
          ? `${formatDate(data.summary.start_date)} to ${formatDate(data.summary.end_date)} • ${data.summary.transaction_count} transactions`
          : ""}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-xs">
            Insights
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs">
            Tips
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Category Breakdown - Pie Chart */}
            <Card className="overflow-hidden">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Category Spending</CardTitle>
              </CardHeader>
              <CardContent className="p-2 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percentage }: PieChartLabelProps) =>
                        `${name} (${percentage.toFixed(0)}%)`
                      }
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            CATEGORY_COLORS[entry.name.toLowerCase()] ||
                            "#D0D0D0"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(index: number) =>
                        pieChartData[index]?.name || ""
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Expenses - Bar Chart */}
            <Card className="overflow-hidden">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Top Expenses</CardTitle>
              </CardHeader>
              <CardContent className="p-2 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      tickFormatter={(value: number) =>
                        formatCurrency(value).split(".")[0]
                      }
                    />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(value: string) => `${value}`}
                    />
                    <Bar dataKey="amount" fill="#8884d8">
                      {barChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            CATEGORY_COLORS[entry.name.toLowerCase()] ||
                            "#D0D0D0"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="pt-4">
          <Card className="overflow-hidden">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <LightbulbIcon className="h-3.5 w-3.5 text-yellow-500" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div className="grid grid-cols-1 gap-3">
                {data.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                  >
                    <div className="mt-0.5">
                      {insight.type === "saving_opportunity" && (
                        <PiggyBankIcon className="h-4 w-4 text-emerald-500" />
                      )}
                      {insight.type === "spending_pattern" && (
                        <TrendingDownIcon className="h-4 w-4 text-blue-500" />
                      )}
                      {insight.type === "anomaly" && (
                        <ZapIcon className="h-4 w-4 text-amber-500" />
                      )}
                      {insight.type === "tip" && (
                        <LightbulbIcon className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p>{insight.description}</p>
                      {insight.impact !== null && (
                        <p className="text-muted-foreground text-xs mt-1">
                          Impact: {formatCurrency(insight.impact)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="pt-4">
          <Card className="overflow-hidden">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="border-t">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 border-b">
                      <tr className="divide-x">
                        <th className="px-3 py-2 font-medium text-left">
                          Date
                        </th>
                        <th className="px-3 py-2 font-medium text-left">
                          Description
                        </th>
                        <th className="px-3 py-2 font-medium text-left">
                          Category
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.transactions.map((transaction, index) => (
                        <tr key={index} className="divide-x">
                          <td className="px-3 py-2 whitespace-nowrap">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="px-3 py-2 max-w-[180px] truncate">
                            {transaction.description}
                          </td>
                          <td className="px-3 py-2">
                            <span className="inline-flex capitalize text-[10px] px-1.5 py-0.5 rounded-full bg-muted">
                              {transaction.category}
                            </span>
                          </td>
                          <td
                            className={`px-3 py-2 text-right whitespace-nowrap ${transaction.amount < 0 ? "text-red-500" : "text-green-500"}`}
                          >
                            {formatCurrency(transaction.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="pt-4">
          <Card className="overflow-hidden">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <PiggyBankIcon className="h-3.5 w-3.5 text-emerald-500" />
                Saving Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div className="grid grid-cols-1 gap-3">
                {data.recommendations.map((recommendation, index) => (
                  <div key={index} className="border rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex capitalize text-[10px] px-1.5 py-0.5 rounded-full bg-muted">
                        {recommendation.category}
                      </span>
                      {recommendation.potential_savings > 0 && (
                        <span className="text-xs text-emerald-500">
                          Save{" "}
                          {formatCurrency(recommendation.potential_savings)}
                        </span>
                      )}
                    </div>
                    <p>{recommendation.action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

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

export function TransactionSummary({ data }: TransactionSummaryProps) {
  if (!data || !data.transactions || data.transactions.length === 0) {
    return null;
  }

  // Format as INR currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  // Prepare data for pie chart - ensure we handle missing count property
  const pieChartData = Object.entries(data.category_breakdown).map(
    ([category, info]) => {
      // Handle both the full and minimized data structure
      const categoryInfo =
        typeof info === "object" ? info : { total: 0, percentage: 0 };
      return {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: Math.abs(
          typeof categoryInfo.total === "number" ? categoryInfo.total : 0,
        ),
        percentage:
          typeof categoryInfo.percentage === "number"
            ? categoryInfo.percentage
            : 0,
      };
    },
  );

  // Prepare data for bar chart - handle simplified category breakdown
  const barChartData = Object.entries(data.category_breakdown)
    .filter(([, info]) => {
      // Handle both data structures and ensure we only show expenses
      const total =
        typeof info === "object" && "total" in info
          ? info.total
          : typeof info === "number"
            ? info
            : 0;
      return total < 0;
    })
    .sort((a, b) => {
      // Sort by absolute amount
      const totalA =
        typeof a[1] === "object" && "total" in a[1]
          ? a[1].total
          : typeof a[1] === "number"
            ? a[1]
            : 0;
      const totalB =
        typeof b[1] === "object" && "total" in b[1]
          ? b[1].total
          : typeof b[1] === "number"
            ? b[1]
            : 0;
      return Math.abs(totalB) - Math.abs(totalA);
    })
    .slice(0, 5) // Take the top 5
    .map(([category, info]) => {
      const total =
        typeof info === "object" && "total" in info
          ? info.total
          : typeof info === "number"
            ? info
            : 0;
      return {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        amount: Math.abs(total), // Use absolute values for the chart
      };
    });

  return (
    <div className="w-full space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between px-4 py-2">
            <CardTitle className="text-xs font-medium">Spent</CardTitle>
            <TrendingDownIcon className="text-destructive h-3.5 w-3.5" />
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="text-destructive text-xl font-bold">
              {formatCurrency(data.summary.total_spent)}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between px-4 py-2">
            <CardTitle className="text-xs font-medium">Received</CardTitle>
            <TrendingUpIcon className="h-3.5 w-3.5 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="text-xl font-bold text-emerald-500">
              {formatCurrency(data.summary.total_received)}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between px-4 py-2">
            <CardTitle className="text-xs font-medium">Net</CardTitle>
            <BanknoteIcon className="text-primary h-3.5 w-3.5" />
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div
              className={`text-xl font-bold ${data.summary.net_change >= 0 ? "text-emerald-500" : "text-destructive"}`}>
              {formatCurrency(data.summary.net_change)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-muted-foreground text-center text-xs">
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percentage }) =>
                          `${name} (${typeof percentage === "number" ? percentage.toFixed(1) : "0"}%)`
                        }>
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              CATEGORY_COLORS[entry.name.toLowerCase()] ||
                              CATEGORY_COLORS.other
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Expenses - Bar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={80}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Bar
                        dataKey="amount"
                        fill="#8884d8"
                        barSize={20}
                        radius={[0, 4, 4, 0]}>
                        {barChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              CATEGORY_COLORS[entry.name.toLowerCase()] ||
                              CATEGORY_COLORS.other
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab - Only show if insights exist */}
        <TabsContent value="insights" className="pt-4">
          {data.insights && data.insights.length > 0 ? (
            <Card className="overflow-hidden">
              <CardHeader className="px-4 py-3">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <LightbulbIcon className="h-3.5 w-3.5 text-yellow-500" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <div className="grid grid-cols-1 gap-3">
                  {data.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border p-3 text-sm">
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
                          <p className="text-muted-foreground mt-1 text-xs">
                            Impact: {formatCurrency(insight.impact)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-muted-foreground py-10 text-center">
              No insights available for this statement
            </div>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="pt-4">
          <Card className="overflow-hidden">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-sm">Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="border-t">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 border-b">
                      <tr className="divide-x">
                        <th className="px-3 py-2 text-left font-medium">
                          Date
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Description
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
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
                          <td className="max-w-[180px] truncate px-3 py-2">
                            {transaction.description}
                          </td>
                          <td className="px-3 py-2">
                            <span className="bg-muted inline-flex rounded-full px-1.5 py-0.5 text-[10px] capitalize">
                              {transaction.category}
                            </span>
                          </td>
                          <td
                            className={`px-3 py-2 text-right whitespace-nowrap ${transaction.amount < 0 ? "text-red-500" : "text-green-500"}`}>
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

        {/* Recommendations Tab - Only show if recommendations exist */}
        <TabsContent value="recommendations" className="pt-4">
          {data.recommendations && data.recommendations.length > 0 ? (
            <Card className="overflow-hidden">
              <CardHeader className="px-4 py-3">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <PiggyBankIcon className="h-3.5 w-3.5 text-emerald-500" />
                  Saving Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <div className="grid grid-cols-1 gap-3">
                  {data.recommendations.map((recommendation, index) => (
                    <div key={index} className="rounded-lg border p-3 text-sm">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="bg-muted inline-flex rounded-full px-1.5 py-0.5 text-[10px] capitalize">
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
          ) : (
            <div className="text-muted-foreground py-10 text-center">
              No recommendations available for this statement
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
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
    <div className="w-full space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDownIcon className="text-destructive h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-destructive text-2xl font-bold">
              {formatCurrency(data.summary.total_spent)}
            </div>
            <p className="text-muted-foreground text-xs">
              {data.summary.start_date
                ? `From ${formatDate(data.summary.start_date)} to ${formatDate(data.summary.end_date)}`
                : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Received
            </CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(data.summary.total_received)}
            </div>
            <p className="text-muted-foreground text-xs">
              From {data.summary.transaction_count} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Change</CardTitle>
            <BanknoteIcon className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${data.summary.net_change >= 0 ? "text-emerald-500" : "text-destructive"}`}
            >
              {formatCurrency(data.summary.net_change)}
            </div>
            <p className="text-muted-foreground text-xs">
              {data.summary.net_change >= 0
                ? "Net positive balance"
                : "Net negative balance"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Category Breakdown - Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>
                  Distribution of your spending across different categories
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
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
            <Card>
              <CardHeader>
                <CardTitle>Top Expenses</CardTitle>
                <CardDescription>
                  Your biggest spending categories
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      tickFormatter={(value: number) =>
                        formatCurrency(value).split(".")[0]
                      }
                    />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(value: string) => `Category: ${value}`}
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

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LightbulbIcon className="h-5 w-5 text-yellow-500" />
                Key Insights
              </CardTitle>
              <CardDescription>
                Important observations from your spending patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {data.insights.slice(0, 3).map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div className="mt-0.5">
                      {insight.type === "saving_opportunity" && (
                        <PiggyBankIcon className="h-5 w-5 text-emerald-500" />
                      )}
                      {insight.type === "spending_pattern" && (
                        <TrendingDownIcon className="h-5 w-5 text-blue-500" />
                      )}
                      {insight.type === "anomaly" && (
                        <ZapIcon className="h-5 w-5 text-amber-500" />
                      )}
                      {insight.type === "tip" && (
                        <LightbulbIcon className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <Badge variant="outline">
                        {insight.type.replace("_", " ")}
                      </Badge>
                      <p>{insight.description}</p>
                      {insight.impact !== null && (
                        <p className="text-muted-foreground text-sm">
                          Potential impact: {formatCurrency(insight.impact)}
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
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                Complete list of transactions from{" "}
                {formatDate(data.summary.start_date)}
                to {formatDate(data.summary.end_date)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr className="divide-x">
                        <th className="px-4 py-2 font-medium">Date</th>
                        <th className="px-4 py-2 font-medium">Description</th>
                        <th className="px-4 py-2 font-medium">Category</th>
                        <th className="px-4 py-2 text-right font-medium">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.transactions.map((transaction, index) => (
                        <tr key={index} className="divide-x">
                          <td className="px-4 py-2">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="px-4 py-2">
                            {transaction.description}
                          </td>
                          <td className="px-4 py-2">
                            <Badge className="capitalize" variant="outline">
                              {transaction.category}
                            </Badge>
                          </td>
                          <td
                            className={`px-4 py-2 text-right ${transaction.amount < 0 ? "text-red-500" : "text-green-500"}`}
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

        {/* Insights Tab */}
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Spending Insights</CardTitle>
              <CardDescription>
                Detailed analysis of your spending patterns and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-6">
                  {data.insights.map((insight, index) => (
                    <div key={index} className="flex flex-col space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-full p-2">
                          {insight.type === "saving_opportunity" && (
                            <PiggyBankIcon className="h-5 w-5 text-emerald-500" />
                          )}
                          {insight.type === "spending_pattern" && (
                            <TrendingDownIcon className="h-5 w-5 text-blue-500" />
                          )}
                          {insight.type === "anomaly" && (
                            <ZapIcon className="h-5 w-5 text-amber-500" />
                          )}
                          {insight.type === "tip" && (
                            <LightbulbIcon className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <Badge variant="outline" className="capitalize">
                            {insight.type.replace(/_/g, " ")}
                          </Badge>
                          {insight.impact !== null && (
                            <Badge variant="outline" className="ml-2">
                              Impact: {formatCurrency(insight.impact)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="ml-10 text-base">{insight.description}</p>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Saving Recommendations</CardTitle>
              <CardDescription>
                Actions you can take to improve your financial health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-6">
                  {data.recommendations.map((recommendation, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <PiggyBankIcon className="h-5 w-5 text-emerald-500" />
                          <Badge variant="outline" className="capitalize">
                            {recommendation.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="mt-2">{recommendation.action}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { instance } from "@/services/httpService";
import { useEffect, useState } from "react";
import KpiCards from "./KpiCards";
import OrdersTrend from "./OrdersTrend";
import RecentOrdersTable from "./RecentOrdersTable";
import StatusBreakdown from "./StatusBreakdown";

export default function Dashboard() {
  const [data, setData] = useState(null);
  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [startDate, setStartDate] = useState(formatDate(sevenDaysAgo));
  const [endDate, setEndDate] = useState(formatDate(today));

useEffect(() => {
  if (!startDate || !endDate) return;
  if (new Date(startDate) > new Date(endDate)) return;

  instance
    .get(`/dashboard?startDate=${startDate}&endDate=${endDate}`)
    .then((res) => {
      setData(res.data);
    });
}, [startDate, endDate]);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl/ mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
        </div>

        <KpiCards data={data} />
        <OrdersTrend
          data={data.trend}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <StatusBreakdown data={data.statusBreakdown} />
        </div>

        <RecentOrdersTable data={data.recentOrders} />
      </div>
    </div>
  );
}

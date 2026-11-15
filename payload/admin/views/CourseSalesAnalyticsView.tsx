"use client"

import React, { useState, useEffect, useCallback } from "react"
import { CustomAdminViewWrapper } from "../components/CustomAdminViewWrapper"
import {
  TrendingUp,
  Package,
  Target,
  DollarSign,
  Calendar,
  Filter,
  CheckCircle2,
  RefreshCw,
  Search,
} from "lucide-react"

interface CourseSalesItem {
  id: string
  title: string
  slug: string
  price: number
  soldUnits: number
  targetUnits: number
  remainingTarget: number
  targetPercent: number
  revenue: number
  isTargetAchieved: boolean
}

interface AnalyticsData {
  summary: {
    totalCourses: number
    totalSoldUnits: number
    totalTargetUnits: number
    totalRemainingTarget: number
    totalRevenue: number
    overallTargetPercent: number
  }
  courses: CourseSalesItem[]
}

export function CourseSalesAnalyticsView() {
  const [period, setPeriod] = useState<"all" | "yearly" | "monthly">("all")
  const [targetPerCourse, setTargetPerCourse] = useState<number>(500)
  const [searchQuery, setSearchQuery] = useState("")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/admin/analytics/sales?period=${period}&target=${targetPerCourse}`
      )
      const json = await res.json()
      if (json.success) {
        setData(json)
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err)
    } finally {
      setLoading(false)
    }
  }, [period, targetPerCourse])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const filteredCourses = (data?.courses || []).filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const summary = data?.summary || {
    totalCourses: 0,
    totalSoldUnits: 0,
    totalTargetUnits: 0,
    totalRemainingTarget: 0,
    totalRevenue: 0,
    overallTargetPercent: 0,
  }

  return (
    <CustomAdminViewWrapper
      title="কোর্স সেলস ও টার্গেট অ্যানালিটিক্স"
      description="কোর্স বিক্রির পরিমাণ, লক্ষ্যমাত্রা (টার্গেট) এবং মাসিক/বার্ষিক রেভিনিউ রিপোর্ট।"
      badge="Analytics"
    >
      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "16px",
          borderRadius: "12px",
          background: "var(--theme-elevation-50, #f9fafb)",
          border: "1px solid var(--theme-elevation-150, #e5e7eb)",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
          {/* Period Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={16} color="var(--theme-elevation-500, #6b7280)" />
            <span style={{ fontSize: "12px", fontWeight: 600 }}>সময়কাল:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid var(--theme-elevation-200, #d1d5db)",
                background: "var(--theme-elevation-0, #fff)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <option value="all">সর্বমোট (All Time)</option>
              <option value="yearly">এই বছর (This Year)</option>
              <option value="monthly">এই মাস (This Month)</option>
            </select>
          </div>

          {/* Target Per Course */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Target size={16} color="var(--theme-elevation-500, #6b7280)" />
            <span style={{ fontSize: "12px", fontWeight: 600 }}>কোর্স প্রতি লক্ষ্যমাত্রা:</span>
            <select
              value={targetPerCourse}
              onChange={(e) => setTargetPerCourse(Number(e.target.value))}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid var(--theme-elevation-200, #d1d5db)",
                background: "var(--theme-elevation-0, #fff)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <option value={100}>১০০ পিস (100 units)</option>
              <option value={250}>২৫০ পিস (250 units)</option>
              <option value={500}>৫০০ পিস (500 units)</option>
              <option value={1000}>১,০০০ পিস (1,000 units)</option>
              <option value={2000}>২,০০০ পিস (2,000 units)</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            borderRadius: "8px",
            background: "var(--theme-elevation-0, #fff)",
            border: "1px solid var(--theme-elevation-200, #d1d5db)",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {/* Card 1: Units Sold */}
        <div
          style={{
            padding: "20px",
            borderRadius: "14px",
            background: "var(--theme-elevation-0, #fff)",
            border: "1px solid var(--theme-elevation-150, #e5e7eb)",
            borderLeft: "4px solid #10b981",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--theme-elevation-500, #6b7280)", fontWeight: 600 }}>
              মোট কোর্স বিক্রি হয়েছে
            </span>
            <Package size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "#10b981" }}>
            {summary.totalSoldUnits.toLocaleString()} <span style={{ fontSize: "14px", fontWeight: 500 }}>পিস</span>
          </div>
          <div style={{ fontSize: "11px", color: "var(--theme-elevation-400, #9ca3af)", marginTop: "4px" }}>
            {summary.totalCourses} টি কোর্সের সর্বমোট পরিসংখ্যান
          </div>
        </div>

        {/* Card 2: Remaining Target */}
        <div
          style={{
            padding: "20px",
            borderRadius: "14px",
            background: "var(--theme-elevation-0, #fff)",
            border: "1px solid var(--theme-elevation-150, #e5e7eb)",
            borderLeft: "4px solid #f59e0b",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--theme-elevation-500, #6b7280)", fontWeight: 600 }}>
              অবশিষ্ট লক্ষ্যমাত্রা (বাকি)
            </span>
            <Target size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "#f59e0b" }}>
            {summary.totalRemainingTarget.toLocaleString()} <span style={{ fontSize: "14px", fontWeight: 500 }}>পিস</span>
          </div>
          <div style={{ fontSize: "11px", color: "var(--theme-elevation-400, #9ca3af)", marginTop: "4px" }}>
            মোট টার্গেট: {summary.totalTargetUnits.toLocaleString()} পিস
          </div>
        </div>

        {/* Card 3: Target Completion % */}
        <div
          style={{
            padding: "20px",
            borderRadius: "14px",
            background: "var(--theme-elevation-0, #fff)",
            border: "1px solid var(--theme-elevation-150, #e5e7eb)",
            borderLeft: "4px solid #3b82f6",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--theme-elevation-500, #6b7280)", fontWeight: 600 }}>
              টার্গেট পূরণ হার
            </span>
            <TrendingUp size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "#3b82f6" }}>
            {summary.overallTargetPercent}%
          </div>
          <div
            style={{
              width: "100%",
              height: "6px",
              borderRadius: "999px",
              background: "var(--theme-elevation-100, #e5e7eb)",
              overflow: "hidden",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                width: `${summary.overallTargetPercent}%`,
                height: "100%",
                background: "#3b82f6",
                borderRadius: "999px",
              }}
            />
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div
          style={{
            padding: "20px",
            borderRadius: "14px",
            background: "var(--theme-elevation-0, #fff)",
            border: "1px solid var(--theme-elevation-150, #e5e7eb)",
            borderLeft: "4px solid #8b5cf6",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--theme-elevation-500, #6b7280)", fontWeight: 600 }}>
              মোট অর্জিত আয়
            </span>
            <DollarSign size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "#8b5cf6" }}>
            ৳{summary.totalRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "var(--theme-elevation-400, #9ca3af)", marginTop: "4px" }}>
            পেইড অর্ডার থেকে চূড়ান্ত সংগ্রহ
          </div>
        </div>
      </div>

      {/* Course Breakdown Table */}
      <div
        style={{
          borderRadius: "14px",
          background: "var(--theme-elevation-0, #fff)",
          border: "1px solid var(--theme-elevation-150, #e5e7eb)",
          overflow: "hidden",
        }}
      >
        {/* Table Header with Search */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--theme-elevation-150, #e5e7eb)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
              কোর্স-ভিত্তিক বিক্রয় ও লক্ষ্যমাত্রা অগ্রগতি
            </h3>
            <p style={{ fontSize: "12px", color: "var(--theme-elevation-500, #6b7280)", margin: "4px 0 0 0" }}>
              প্রতিটি কোর্সের পৃথক বিক্রি, অবশিষ্ট টার্গেট ও পূরণ হার।
            </p>
          </div>

          <div style={{ position: "relative", minWidth: "240px" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--theme-elevation-400, #9ca3af)",
              }}
            />
            <input
              type="text"
              placeholder="কোর্স খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 12px 6px 30px",
                borderRadius: "8px",
                border: "1px solid var(--theme-elevation-200, #d1d5db)",
                fontSize: "12px",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Table / List */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "var(--theme-elevation-50, #f9fafb)", borderBottom: "1px solid var(--theme-elevation-150, #e5e7eb)" }}>
                <th style={{ textAlign: "left", padding: "12px 20px", fontWeight: 600 }}>কোর্সের নাম</th>
                <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 600 }}>বিক্রি (পিস)</th>
                <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 600 }}>টার্গেট</th>
                <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 600 }}>বাকি (টার্গেট)</th>
                <th style={{ textAlign: "left", padding: "12px 20px", fontWeight: 600, minWidth: "180px" }}>অগ্রগতি</th>
                <th style={{ textAlign: "right", padding: "12px 20px", fontWeight: 600 }}>আয় (BDT)</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--theme-elevation-400, #9ca3af)" }}>
                    কোনো কোর্স পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => {
                  const isAchieved = c.isTargetAchieved
                  const barColor = isAchieved ? "#10b981" : c.targetPercent >= 50 ? "#3b82f6" : "#f59e0b"

                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: "1px solid var(--theme-elevation-100, #f3f4f6)",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ fontWeight: 600, color: "var(--theme-elevation-900, #111)" }}>
                          {c.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--theme-elevation-400, #9ca3af)", marginTop: "2px" }}>
                          কোর্স মূল্য: ৳{c.price}
                        </div>
                      </td>

                      <td style={{ textAlign: "center", padding: "14px 16px", fontWeight: 700, color: "#10b981" }}>
                        {c.soldUnits}
                      </td>

                      <td style={{ textAlign: "center", padding: "14px 16px", fontWeight: 600, color: "var(--theme-elevation-600, #4b5563)" }}>
                        {c.targetUnits}
                      </td>

                      <td style={{ textAlign: "center", padding: "14px 16px", fontWeight: 700, color: c.remainingTarget === 0 ? "#10b981" : "#f59e0b" }}>
                        {c.remainingTarget === 0 ? "০ (সম্পন্ন)" : `${c.remainingTarget} টি বাকি`}
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", marginBottom: "4px" }}>
                          <span style={{ fontWeight: 600, color: barColor }}>{c.targetPercent}% পূরণ</span>
                          {isAchieved && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", color: "#10b981", fontWeight: 600 }}>
                              <CheckCircle2 size={12} /> অর্জিত
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "6px",
                            borderRadius: "999px",
                            background: "var(--theme-elevation-100, #e5e7eb)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${c.targetPercent}%`,
                              height: "100%",
                              background: barColor,
                              borderRadius: "999px",
                            }}
                          />
                        </div>
                      </td>

                      <td style={{ textAlign: "right", padding: "14px 20px", fontWeight: 700, color: "var(--theme-elevation-900, #111)" }}>
                        ৳{c.revenue.toLocaleString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </CustomAdminViewWrapper>
  )
}


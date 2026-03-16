import {
    BarChart3,
    Briefcase,
    Calendar,
    ClipboardCheck,
    Download,
    FileText,
    TrendingUp,
    Users,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface ReportCard {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    generatedOn: string;
    type: "Financial" | "Operations" | "HR" | "Client";
}

const mockReports: ReportCard[] = [
    {
        id: "RPT001",
        title: "Monthly Revenue Summary",
        description:
            "Breakdown of income, expenses, and net profit for the current month with comparison to the previous period.",
        icon: TrendingUp,
        generatedOn: "01/03/2026",
        type: "Financial",
    },
    {
        id: "RPT002",
        title: "Service Request Completion",
        description:
            "Analysis of service request volumes, average completion time, and department-wise performance metrics.",
        icon: ClipboardCheck,
        generatedOn: "01/03/2026",
        type: "Operations",
    },
    {
        id: "RPT003",
        title: "Employee Performance",
        description:
            "Individual and team performance based on completed tasks, client ratings, and attendance records.",
        icon: Users,
        generatedOn: "28/02/2026",
        type: "HR",
    },
    {
        id: "RPT004",
        title: "Client Satisfaction Index",
        description:
            "Aggregated client feedback scores, NPS rating, and trends over the past quarter with sentiment analysis.",
        icon: BarChart3,
        generatedOn: "28/02/2026",
        type: "Client",
    },
    {
        id: "RPT005",
        title: "Outstanding Invoices Aging",
        description:
            "Detailed aging report of unpaid invoices categorized by 30, 60, and 90+ day buckets with client breakdown.",
        icon: FileText,
        generatedOn: "25/02/2026",
        type: "Financial",
    },
    {
        id: "RPT006",
        title: "Contract Renewal Forecast",
        description:
            "Upcoming contract expirations in the next 90 days with renewal likelihood and estimated revenue impact.",
        icon: Briefcase,
        generatedOn: "20/02/2026",
        type: "Operations",
    },
];

interface KPICard {
    label: string;
    value: string;
    change: string;
    positive: boolean;
    icon: React.ElementType;
}

const mockKPIs: KPICard[] = [
    {
        label: "Avg. Resolution Time",
        value: "2.4 days",
        change: "−0.3 from last month",
        positive: true,
        icon: ClipboardCheck,
    },
    {
        label: "Client Retention Rate",
        value: "92%",
        change: "+4% vs last quarter",
        positive: true,
        icon: Users,
    },
    {
        label: "Service Requests / Week",
        value: "22",
        change: "+3 from last month",
        positive: true,
        icon: Briefcase,
    },
    {
        label: "Revenue per Employee",
        value: "Ksh 248K",
        change: "+12% from last quarter",
        positive: true,
        icon: TrendingUp,
    },
];

interface ReportsProps {
    onLogout?: () => void;
}

export default function Reports({ onLogout }: ReportsProps) {
    const getTypeClass = (type: ReportCard["type"]) => {
        switch (type) {
            case "Financial":
                return "report-type-financial";
            case "Operations":
                return "report-type-operations";
            case "HR":
                return "report-type-hr";
            case "Client":
                return "report-type-client";
            default:
                return "";
        }
    };

    return (
        <main className="dashboard-page">
            <Sidebar onLogout={onLogout} activeItem="Reports" />

            <section className="dashboard-main">
                <Topbar title="Reports" />

                <div className="dashboard-content">
                    {/* Period Selector */}
                    <div className="reports-header">
                        <h2>Performance Overview</h2>
                        <div className="reports-period">
                            <Calendar size={16} />
                            <select defaultValue="this-month">
                                <option value="this-week">This Week</option>
                                <option value="this-month">This Month</option>
                                <option value="this-quarter">This Quarter</option>
                                <option value="this-year">This Year</option>
                            </select>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="reports-kpi-grid">
                        {mockKPIs.map((kpi) => (
                            <div key={kpi.label} className="report-kpi-card">
                                <div className="report-kpi-icon">
                                    <kpi.icon size={20} />
                                </div>
                                <div className="report-kpi-body">
                                    <div className="report-kpi-label">{kpi.label}</div>
                                    <div className="report-kpi-value">{kpi.value}</div>
                                    <div
                                        className={`report-kpi-change ${kpi.positive ? "positive" : "negative"}`}
                                    >
                                        {kpi.change}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Available Reports */}
                    <div className="reports-section">
                        <div className="reports-section-head">
                            <h3>Available Reports</h3>
                            <div className="reports-section-tabs">
                                <button type="button" className="report-tab is-active">All</button>
                                <button type="button" className="report-tab">Financial</button>
                                <button type="button" className="report-tab">Operations</button>
                                <button type="button" className="report-tab">HR</button>
                                <button type="button" className="report-tab">Client</button>
                            </div>
                        </div>

                        <div className="reports-card-grid">
                            {mockReports.map((report) => (
                                <div key={report.id} className="report-card">
                                    <div className="report-card-top">
                                        <div className={`report-card-icon ${getTypeClass(report.type)}`}>
                                            <report.icon size={20} />
                                        </div>
                                        <span className={`report-type-tag ${getTypeClass(report.type)}`}>
                                            {report.type}
                                        </span>
                                    </div>
                                    <h4 className="report-card-title">{report.title}</h4>
                                    <p className="report-card-desc">{report.description}</p>
                                    <div className="report-card-footer">
                                        <span className="report-card-date">
                                            Generated: {report.generatedOn}
                                        </span>
                                        <button type="button" className="report-card-download">
                                            <Download size={15} />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

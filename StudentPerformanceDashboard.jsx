import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Search, UserCircle2, Moon, Sun, ChevronUp, ChevronDown, Filter, Github, ExternalLink, RefreshCcw } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { Switch } from "@/components/ui/switch";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Switch } from "./components/ui/switch";
// ---------- Mock Data ---------- //
const MOCK_STUDENTS = [
  { id: 1, name: "Dheena", grade: "A", score: 92, subject: "Mathematics" },
  { id: 2, name: "Dhayalan", grade: "B", score: 78, subject: "Science" },
  { id: 3, name: "Vijay", grade: "A", score: 88, subject: "English" },
  { id: 4, name: "ragul", grade: "C", score: 67, subject: "Mathematics" },
  { id: 5, name: "siva", grade: "B", score: 81, subject: "History" },
  { id: 6, name: "rathna", grade: "A", score: 94, subject: "Science" },
  { id: 7, name: "sabi", grade: "B", score: 76, subject: "English" },
  { id: 8, name: "Selva", grade: "A", score: 90, subject: "Computer Science" },
  { id: 9, name: "sabari", grade: "C", score: 65, subject: "History" },
  { id: 10, name: "shyam", grade: "B", score: 82, subject: "Mathematics" },
  { id: 11, name: "Arun", grade: "A", score: 96, subject: "Computer Science" },
  { id: 12, name: "Dinesh", grade: "D", score: 55, subject: "Science" },
];

// ---------- Utilities ---------- //
const LS_KEYS = {
  THEME: "sp_dashboard_theme",
  FILTERS: "sp_dashboard_filters",
};

const gradeOrder = { A: 4, B: 3, C: 2, D: 1, E: 0 };

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

export default function StudentPerformanceDashboard() {
  // Theme
  const [dark, setDark] = useLocalStorage(LS_KEYS.THEME, false);

  // Filters & query
  const [filters, setFilters] = useLocalStorage(LS_KEYS.FILTERS, {
    subject: "all",
    grade: "all",
    query: "",
  });

  // Sort
  const [sort, setSort] = useState({ key: "name", dir: "asc" });

  // Modal state
  const [selected, setSelected] = useState(null);

  // Derived lists for dropdowns
  const subjects = useMemo(() => {
    return [
      "all",
      ...Array.from(new Set(MOCK_STUDENTS.map((s) => s.subject))).sort((a, b) => a.localeCompare(b)),
    ];
  }, []);
  const grades = ["all", "A", "B", "C", "D"];

  // Filter + search
  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return MOCK_STUDENTS.filter((s) => {
      const bySubject = filters.subject === "all" || s.subject === filters.subject;
      const byGrade = filters.grade === "all" || s.grade === filters.grade;
      const byQuery = !q || s.name.toLowerCase().includes(q);
      return bySubject && byGrade && byQuery;
    });
  }, [filters]);

  // Sorter
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const { key, dir } = sort;
      let cmp = 0;
      if (key === "name" || key === "subject") {
        cmp = a[key].localeCompare(b[key]);
      } else if (key === "score") {
        cmp = a.score - b.score;
      } else if (key === "grade") {
        cmp = gradeOrder[a.grade] - gradeOrder[b.grade];
      }
      return dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sort]);

  // Chart data: average score per subject
  const chartData = useMemo(() => {
    const map = new Map();
    filtered.forEach((s) => {
      const entry = map.get(s.subject) || { subject: s.subject, total: 0, count: 0 };
      entry.total += s.score;
      entry.count += 1;
      map.set(s.subject, entry);
    });
    return Array.from(map.values()).map((e) => ({ subject: e.subject, avg: Math.round(e.total / e.count) }));
  }, [filtered]);

  // Apply dark theme to document body
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key === key) {
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { key, dir: "asc" };
    });
  };

  const resetFilters = () => setFilters({ subject: "all", grade: "all", query: "" });

  return (
    <div className={"min-h-screen w-full "+(dark?"bg-gray-950 text-gray-100":"bg-gray-50 text-gray-900")}> 
      {/* Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className={"p-4 md:min-h-screen border-b md:border-b-0 md:border-r "+(dark?"border-gray-800":"border-gray-200")}> 
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500" />
            <div>
              <p className="text-lg font-semibold">Academia</p>
              <p className={"text-xs "+(dark?"text-gray-400":"text-gray-500")}>Analytics Suite</p>
            </div>
          </div>

          <nav className="space-y-2">
            <a className="block px-3 py-2 rounded-xl hover:bg-indigo-500/10">Dashboard</a>
            <a className="block px-3 py-2 rounded-xl hover:bg-indigo-500/10">Reports</a>
            <a className="block px-3 py-2 rounded-xl hover:bg-indigo-500/10">Students</a>
            <a className="block px-3 py-2 rounded-xl hover:bg-indigo-500/10">Settings</a>
          </nav>

          <div className="mt-8 p-3 rounded-2xl shadow-sm border "
               style={{ borderColor: dark?"#1f2937":"#e5e7eb" }}>
            <p className="text-sm font-medium mb-2">Theme</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {dark ? <Moon size={18}/> : <Sun size={18}/>} 
                <span className="text-sm">{dark ? "Dark" : "Light"} mode</span>
              </div>
              <Switch checked={dark} onCheckedChange={setDark} aria-label="Toggle theme" />
            </div>
          </div>

          <div className="hidden md:block mt-8 text-xs opacity-70">
            <p>Preferences are saved in your browser.</p>
          </div>
        </aside>

        {/* Main */}
        <main className="p-4 md:p-8">
          {/* Header */}
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Student Performance Dashboard</h1>
              <p className={"text-sm mt-1 "+(dark?"text-gray-400":"text-gray-600")}>Filter, sort, and visualize student results.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-2xl" onClick={resetFilters}>
                <RefreshCcw className="h-4 w-4 mr-2"/> Reset
              </Button>
              <div className="flex items-center gap-3 px-3 py-2 rounded-2xl border"
                   style={{ borderColor: dark?"#1f2937":"#e5e7eb" }}>
                <span className="text-sm hidden sm:inline">Dheena</span>
                <UserCircle2/>
              </div>
            </div>
          </header>

          {/* Controls */}
          <Card className="mb-6 rounded-2xl">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Search */}
                <div className="col-span-1 md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60"/>
                    <Input
                      value={filters.query}
                      onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                      placeholder="Search by student name..."
                      className="pl-9 rounded-2xl"
                    />
                  </div>
                </div>

                {/* Subject Filter */}
                <div>
                  <Select value={filters.subject} onValueChange={(v) => setFilters({ ...filters, subject: v })}>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s} value={s}>{s === "all" ? "All Subjects" : s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Grade Filter */}
                <div>
                  <Select value={filters.grade} onValueChange={(v) => setFilters({ ...filters, grade: v })}>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((g) => (
                        <SelectItem key={g} value={g}>{g === "all" ? "All Grades" : g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="mb-6 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5"/> Average Score by Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg" name="Average Score" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle>Students ({sorted.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b" style={{ borderColor: dark?"#1f2937":"#e5e7eb" }}>
                    <SortableTh label="Name" sortKey="name" sort={sort} onToggle={toggleSort} />
                    <th className="py-3 pr-4">Subject</th>
                    <SortableTh label="Grade" sortKey="grade" sort={sort} onToggle={toggleSort} />
                    <SortableTh label="Score" sortKey="score" sort={sort} onToggle={toggleSort} align="right" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-indigo-500/5 cursor-pointer"
                        style={{ borderColor: dark?"#1f2937":"#e5e7eb" }}
                        onClick={() => setSelected(s)}>
                      <td className="py-3 pr-4 font-medium">{s.name}</td>
                      <td className="py-3 pr-4">{s.subject}</td>
                      <td className="py-3 pr-4">
                        <span className={"px-2.5 py-1 rounded-full text-xs font-semibold "+
                          (s.grade === 'A' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                           s.grade === 'B' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                           s.grade === 'C' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                           'bg-rose-500/10 text-rose-600 dark:text-rose-400')
                        }>{s.grade}</span>
                      </td>
                      <td className="py-3 pr-4 text-right">{s.score}</td>
                    </tr>
                  ))}
                  {sorted.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 opacity-70">No students match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-6 text-sm opacity-80">
            {/* <p>
              Built with React + Tailwind + Recharts. Preferences saved to localStorage.
            </p> */}
            {/* <div className="flex items-center gap-3">
              <a className="inline-flex items-center gap-1 hover:underline" href="#" onClick={(e)=>e.preventDefault()}>
                <Github size={16}/> GitHub Repo
              </a>
              <a className="inline-flex items-center gap-1 hover:underline" href="#" onClick={(e)=>e.preventDefault()}>
                <ExternalLink size={16}/> Live Demo
              </a>
            </div> */}
          </div>
        </main>
      </div>

      {/* Details Modal */}
      <Dialog open={!!selected} onOpenChange={(open)=>{ if(!open) setSelected(null); }}>
        <DialogContent className="rounded-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Student details and performance</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Info label="ID" value={selected.id} />
                <Info label="Subject" value={selected.subject} />
                <Info label="Grade" value={selected.grade} />
                <Info label="Score" value={selected.score} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SortableTh({ label, sortKey, sort, onToggle, align = "left" }) {
  const active = sort.key === sortKey;
  const DirIcon = sort.dir === "asc" ? ChevronUp : ChevronDown;
  return (
    <th className={`py-3 pr-4 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button onClick={() => onToggle(sortKey)} className="inline-flex items-center gap-1 font-semibold">
        {label} {active && <DirIcon className="h-4 w-4"/>}
      </button>
    </th>
  );
}

function Info({ label, value }) {
  return (
    <div className="p-3 rounded-xl border">
      <p className="text-xs opacity-70">{label}</p>
      <p className="font-medium mt-1">{String(value)}</p>
    </div>
  );
}

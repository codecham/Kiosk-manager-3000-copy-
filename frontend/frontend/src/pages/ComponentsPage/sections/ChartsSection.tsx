import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import ComponentBlock from '../ComponentBlock';
import SectionWrapper from '../SectionWrapper';

const CPU_DATA = [
  { time: '00:00', cpu: 20, ram: 45 },
  { time: '04:00', cpu: 15, ram: 42 },
  { time: '08:00', cpu: 68, ram: 61 },
  { time: '12:00', cpu: 75, ram: 72 },
  { time: '16:00', cpu: 82, ram: 78 },
  { time: '20:00', cpu: 55, ram: 65 },
  { time: '24:00', cpu: 30, ram: 50 },
];

const PLAYBOOK_DATA = [
  { name: 'Lun', succès: 12, erreurs: 1 },
  { name: 'Mar', succès: 19, erreurs: 0 },
  { name: 'Mer', succès: 8, erreurs: 3 },
  { name: 'Jeu', succès: 15, erreurs: 1 },
  { name: 'Ven', succès: 22, erreurs: 2 },
  { name: 'Sam', succès: 5, erreurs: 0 },
  { name: 'Dim', succès: 3, erreurs: 0 },
];

const OS_DATA = [
  { name: 'Ubuntu 22.04', value: 14, color: 'var(--chart-1)' },
  { name: 'Debian 12', value: 8, color: 'var(--chart-2)' },
  { name: 'CentOS 9', value: 5, color: 'var(--chart-3)' },
  { name: 'Autre', value: 3, color: 'var(--chart-4)' },
];

const RADAR_DATA = [
  { metric: 'CPU', value: 68 },
  { metric: 'RAM', value: 45 },
  { metric: 'Disque', value: 72 },
  { metric: 'Réseau', value: 55 },
  { metric: 'I/O', value: 38 },
  { metric: 'Charge', value: 60 },
];

const RADIAL_DATA = [
  { name: 'CPU', value: 68, fill: 'var(--chart-1)' },
  { name: 'RAM', value: 45, fill: 'var(--chart-2)' },
  { name: 'Disque', value: 72, fill: 'var(--chart-3)' },
];

const CHART_STYLE = { fontSize: 11 };

const ChartsSection = () => (
  <SectionWrapper id="charts" title="Charts" description="Visualisations de données avec Recharts.">
    <ComponentBlock title="AreaChart — CPU & RAM dans le temps" vertical>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 192 }}>
          <AreaChart data={CPU_DATA}>
            <defs>
              <linearGradient id="gradCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="time" tick={CHART_STYLE} stroke="var(--muted-foreground)" />
            <YAxis tick={CHART_STYLE} stroke="var(--muted-foreground)" unit="%" />
            <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
            <Legend wrapperStyle={CHART_STYLE} />
            <Area type="monotone" dataKey="cpu" name="CPU" stroke="var(--chart-1)" fill="url(#gradCpu)" strokeWidth={2} />
            <Area type="monotone" dataKey="ram" name="RAM" stroke="var(--chart-2)" fill="url(#gradRam)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ComponentBlock>

    <ComponentBlock title="BarChart — Executions Ansible par jour" vertical>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 192 }}>
          <BarChart data={PLAYBOOK_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={CHART_STYLE} stroke="var(--muted-foreground)" />
            <YAxis tick={CHART_STYLE} stroke="var(--muted-foreground)" />
            <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
            <Legend wrapperStyle={CHART_STYLE} />
            <Bar dataKey="succès" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="erreurs" fill="var(--chart-5)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ComponentBlock>

    <ComponentBlock title="LineChart — Charge réseau" vertical>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 192 }}>
          <LineChart data={CPU_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="time" tick={CHART_STYLE} stroke="var(--muted-foreground)" />
            <YAxis tick={CHART_STYLE} stroke="var(--muted-foreground)" unit="%" />
            <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
            <Legend wrapperStyle={CHART_STYLE} />
            <Line type="monotone" dataKey="cpu" name="CPU" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ram" name="RAM" stroke="var(--chart-3)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ComponentBlock>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ComponentBlock title="PieChart — Répartition OS" vertical>
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 192 }}>
            <PieChart>
              <Pie data={OS_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                {OS_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
              <Legend wrapperStyle={CHART_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ComponentBlock>

      <ComponentBlock title="RadarChart — Ressources système" vertical>
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 192 }}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="metric" tick={CHART_STYLE} />
              <Radar name="Usage" dataKey="value" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.3} />
              <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </ComponentBlock>

      <ComponentBlock title="RadialBarChart — Utilisation" vertical>
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 192 }}>
            <RadialBarChart cx="50%" cy="50%" innerRadius={20} outerRadius={80} data={RADIAL_DATA}>
              <RadialBar dataKey="value" cornerRadius={4} label={{ position: 'insideStart', fill: 'var(--foreground)', fontSize: 10 }} />
              <Legend wrapperStyle={CHART_STYLE} />
              <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </ComponentBlock>
    </div>
  </SectionWrapper>
);

export default ChartsSection;

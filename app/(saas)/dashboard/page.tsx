import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Users, MessageSquare, TrendingUp, Clock } from 'lucide-react';

async function getLeads(agencyId: string) {
  try {
    const apiKey  = process.env.AIRTABLE_API_KEY!;
    const baseId  = process.env.AIRTABLE_BASE_ID!;
    const url     = `https://api.airtable.com/v0/${baseId}/Leads?maxRecords=50&sort[0][field]=Created&sort[0][direction]=desc`;
    const res     = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.records?.map((r: any) => ({
      id:        r.id,
      name:      r.fields['Name']       || 'Unknown',
      phone:     r.fields['Phone']      || '',
      status:    r.fields['Status']     || 'new',
      budget:    r.fields['Budget']     || '',
      project:   r.fields['Project Interest'] || '',
      language:  r.fields['Language']   || '',
      created:   r.fields['Created']    || r.createdTime,
      summary:   r.fields['Conversation Summary'] || '',
    })) || [];
  } catch {
    return [];
  }
}

const statusColor: Record<string, string> = {
  new:       'bg-blue-50 text-blue-700',
  qualified: 'bg-green-50 text-green-700',
  hot:       'bg-orange-50 text-orange-700',
  closed:    'bg-gray-100 text-gray-500',
  lost:      'bg-red-50 text-red-500',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const user  = session.user as any;
  const leads = await getLeads(user.agencyId);

  const stats = {
    total:     leads.length,
    hot:       leads.filter((l: any) => l.status === 'hot').length,
    qualified: leads.filter((l: any) => l.status === 'qualified').length,
    new:       leads.filter((l: any) => l.status === 'new').length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total leads',    value: stats.total,     icon: Users,          color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { label: 'Hot leads',      value: stats.hot,       icon: TrendingUp,     color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Qualified',      value: stats.qualified, icon: MessageSquare,  color: 'text-green-600',  bg: 'bg-green-50'  },
          { label: 'New today',      value: stats.new,       icon: Clock,          color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{s.label}</span>
              <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
                <s.icon size={15} className={s.color} />
              </div>
            </div>
            <p className="text-3xl font-bold text-navy-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Leads table */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-navy-900">Recent leads</h2>
          <span className="text-xs text-gray-400">{leads.length} total</span>
        </div>

        {leads.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm">No leads yet. SARA will populate this once conversations start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name', 'Phone', 'Status', 'Budget', 'Project', 'Language', 'Date'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead: any) => (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-navy-900">{lead.name}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{lead.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColor[lead.status] || 'bg-gray-100 text-gray-500'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{lead.budget || '—'}</td>
                    <td className="px-6 py-4 text-gray-500 truncate max-w-32">{lead.project || '—'}</td>
                    <td className="px-6 py-4 text-gray-500 uppercase text-xs">{lead.language || '—'}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(lead.created).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

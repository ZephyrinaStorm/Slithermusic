import { useEffect } from 'react';
import { useGetBotStatus } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { Server, RefreshCw, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import { Layout } from '@/components/layout';

function pulse(online: boolean) {
  return online
    ? 'bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]'
    : 'bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.4)]';
}

function latencyColor(ms: number | null) {
  if (ms === null) return 'text-muted-foreground';
  if (ms < 80) return 'text-emerald-400';
  if (ms < 200) return 'text-yellow-400';
  return 'text-red-400';
}

function latencyLabel(ms: number | null) {
  if (ms === null) return '— ms';
  if (ms < 80) return `${ms}ms (excellent)`;
  if (ms < 200) return `${ms}ms (good)`;
  return `${ms}ms (degraded)`;
}

export default function StatusPage() {
  const { data, isLoading, error, refetch, isFetching } = useGetBotStatus();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const id = setInterval(() => { refetch(); }, 30_000);
    return () => clearInterval(id);
  }, [refetch]);

  const allOnline = data?.nodes.every((n) => n.online) ?? false;
  const anyOnline = data?.nodes.some((n) => n.online) ?? false;

  const systemStatus = isLoading || isFetching
    ? { label: 'Checking…', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' }
    : error
    ? { label: 'Error fetching status', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' }
    : allOnline
    ? { label: 'All systems operational', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' }
    : anyOnline
    ? { label: 'Partial outage — some nodes offline', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' }
    : { label: 'All nodes offline', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' };

  return (
    <Layout>
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-3">System Status</h1>
              <p className="text-muted-foreground text-lg">Live health of Slither Music infrastructure</p>
            </motion.div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Overall banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl border mb-10 ${systemStatus.bg}`}
          >
            {allOnline ? (
              <CheckCircle className={`w-5 h-5 ${systemStatus.color}`} />
            ) : (
              <XCircle className={`w-5 h-5 ${systemStatus.color}`} />
            )}
            <span className={`font-semibold ${systemStatus.color}`}>{systemStatus.label}</span>
            {data?.checkedAt && (
              <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Checked {new Date(data.checkedAt).toLocaleTimeString()}
              </span>
            )}
          </motion.div>

          {/* Node cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
            {isLoading
              ? [1, 2].map((i) => (
                  <div key={i} className="h-52 bg-card border border-white/5 animate-pulse rounded-2xl" />
                ))
              : data?.nodes.map((node, i) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12 }}
                    className="bg-card border border-white/5 rounded-2xl p-7 relative overflow-hidden hover:border-primary/30 transition-colors group"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-gradient-to-b from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <Server className="w-5 h-5 text-muted-foreground" />
                        <span className="font-display font-bold text-lg capitalize">{node.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${pulse(node.online)}`} />
                        <span className={`text-sm font-semibold ${node.online ? 'text-emerald-400' : 'text-red-400'}`}>
                          {node.online ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Host</span>
                        <span className="font-mono text-white">{node.host}</span>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Latency</span>
                        <span className={`font-mono font-semibold ${latencyColor(node.latencyMs)}`}>
                          {latencyLabel(node.latencyMs)}
                        </span>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Version</span>
                        <span className="font-mono text-white">{node.version || 'Unknown'}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
          </div>

          {/* Bot stats */}
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-white/5 rounded-2xl p-8"
            >
              <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Bot Details
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: 'Bot Name', value: data.botName },
                  { label: 'Total Commands', value: String(data.commandCount) },
                  { label: 'Active Nodes', value: `${data.nodes.filter((n) => n.online).length} / ${data.nodes.length}` },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-xl font-display font-bold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Legend */}
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Excellent &lt; 80ms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>Good 80–200ms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span>Degraded &gt; 200ms</span>
            </div>
            <p className="ml-auto">Auto-refreshes every 30 seconds</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

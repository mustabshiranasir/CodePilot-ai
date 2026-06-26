import { supabase } from '../supabase';
import type { SecurityReport } from '../../types';

const mapReport = (d: any): SecurityReport => ({
  id: d.id,
  scanId: d.scan_id,
  totalVulnerabilities: d.total_vulnerabilities,
  criticalCount: d.critical_count,
  highCount: d.high_count,
  mediumCount: d.medium_count,
  lowCount: d.low_count,
  exposedKeys: d.exposed_keys,
  sqlInjections: d.sql_injections,
  authBypass: d.auth_bypass,
  insecureJwt: d.insecure_jwt,
  missingValidation: d.missing_validation,
  createdAt: d.created_at,
});

export const securityReportService = {
  getAll: async () => {
    const { data, error } = await supabase.from('security_reports').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapReport);
  },
  getByScanId: async (scanId: string) => {
    const { data, error } = await supabase.from('security_reports').select('*').eq('scan_id', scanId).maybeSingle();
    if (error) throw error;
    return data ? mapReport(data) : null;
  },
  create: async (report: Omit<SecurityReport, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('security_reports').insert({
      scan_id: report.scanId, total_vulnerabilities: report.totalVulnerabilities,
      critical_count: report.criticalCount, high_count: report.highCount,
      medium_count: report.mediumCount, low_count: report.lowCount,
      exposed_keys: report.exposedKeys, sql_injections: report.sqlInjections,
      auth_bypass: report.authBypass, insecure_jwt: report.insecureJwt,
      missing_validation: report.missingValidation,
    }).select().single();
    if (error) throw error;
    return mapReport(data);
  },
};

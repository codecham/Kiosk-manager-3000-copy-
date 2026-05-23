export type TerminalStatus = 'online' | 'offline' | 'unknown';
export type RunStatus = 'success' | 'failed' | 'running' | 'pending';

export interface Terminal {
  id: string;
  name: string;
  hostname: string;
  port: number;
  username: string;
  status: TerminalStatus;
  groups: string[];
  os_version?: string;
  mac_address?: string;
  serial_number?: string;
  description?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  terminal_count: number;
  terminals: Terminal[];
}

export interface PlaybookRun {
  id: string;
  name: string;
  playbook_path: string;
  status: RunStatus;
  target_groups: string[];
  target_hosts: string[];
  output?: string;
  created_at: string;
}

export interface SystemInfo {
  hostname: string;
  os: string;
  kernel: string;
  arch: string;
  cpu_model: string;
  cpu_cores: number;
  load_avg: string;
  uptime: string;
  last_boot: string;
  ram_used_mb: number;
  ram_total_mb: number;
  disk_used: string;
  disk_total: string;
  disk_percent: string;
}

export interface EnrollToken {
  token: string;
  expires_at: string;
  command: string;
}

export interface PermanentKey {
  key: string;
  command: string;
}

export interface CreateTerminalPayload {
  name: string;
  hostname: string;
  port?: number;
  username?: string;
  ssh_key: string;
}

export interface LaunchPlaybookPayload {
  name?: string;
  playbook_path: string;
  target_groups: string[];
  target_hosts?: string[];
}

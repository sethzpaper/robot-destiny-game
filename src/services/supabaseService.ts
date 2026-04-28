// Frontend service: ยิง HTTP ไป Express backend (/api/*) เท่านั้น
// ใช้ Supabase Auth JWT ส่งใน Authorization header → RLS ทำงานต่อ user

const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour
const CACHEABLE_TABLES = ['categories', 'profiles', 'teachers'];
const TOKEN_KEY = 'spk_token';

const TABLE_MAP: Record<string, string> = {
  Devices: 'devices',
  Categories: 'categories',
  Users: 'profiles',
  StudentsM4: 'students',
  StudentsM5: 'students',
  StudentsM6: 'students',
  Teachers: 'teachers',
  serviceLogs: 'service_logs',
  Service: 'service_reports',
  Logs: 'activity_logs',
  Transactions: 'transactions',
};

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

async function api(path: string, body: any): Promise<any> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const tok = getToken();
    if (tok) headers.Authorization = `Bearer ${tok}`;
    const r = await fetch(`/api/${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (r.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      return { success: false, message: 'Session expired, please login again' };
    }
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e: any) {
    return { success: false, message: e.message, error: e.message };
  }
}

function currentUserName(): string {
  try {
    const u = JSON.parse(localStorage.getItem('spk_user') || '{}');
    return u.users || 'System';
  } catch {
    return 'System';
  }
}

export const supabaseService = {
  async read(tableName: string, options: any = {}): Promise<any> {
    const target = TABLE_MAP[tableName] || tableName.toLowerCase();
    const cacheKey = `spk_cache_read_${target}`;
    if (CACHEABLE_TABLES.includes(target) && !options.searchTerm) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          return { success: true, items: cachedData, fromCache: true };
        }
      }
    }
    const res = await api('read', { table: tableName, options });
    if (res.success && CACHEABLE_TABLES.includes(target) && !options.searchTerm) {
      localStorage.setItem(cacheKey, JSON.stringify({ data: res.items, timestamp: Date.now() }));
    }
    return res;
  },

  async login(username: string, password: string) {
    const res = await api('login', { username, password });
    if (res.success && res.token) {
      localStorage.setItem(TOKEN_KEY, res.token);
      if (res.refresh_token) localStorage.setItem('spk_refresh', res.refresh_token);
    }
    return res;
  },

  async logout() {
    await api('logout', {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('spk_refresh');
    localStorage.removeItem('spk_user');
  },

  async create(tableName: string, data: any) {
    const target = TABLE_MAP[tableName] || tableName.toLowerCase();
    const res = await api('create', { table: tableName, data, user: currentUserName() });
    if (res.success) localStorage.removeItem(`spk_cache_read_${target}`);
    return res;
  },

  async update(tableName: string, id: string, data: any) {
    const target = TABLE_MAP[tableName] || tableName.toLowerCase();
    const res = await api('update', { table: tableName, id, data, user: currentUserName() });
    if (res.success) localStorage.removeItem(`spk_cache_read_${target}`);
    return res;
  },

  async delete(tableName: string, id: string) {
    const target = TABLE_MAP[tableName] || tableName.toLowerCase();
    const res = await api('delete', { table: tableName, id, user: currentUserName() });
    if (res.success) localStorage.removeItem(`spk_cache_read_${target}`);
    return res;
  },

  borrowDevice(studentId: string, serialNumber: string, recorder: string) {
    return api('borrow', { studentId, serialNumber, recorder, user: currentUserName() });
  },

  returnDevice(studentId: string, serialNumber: string, recorder: string) {
    return api('return', { studentId, serialNumber, recorder, user: currentUserName() });
  },

  reportService(data: any) {
    return api('report-service', { data, user: currentUserName() });
  },

  logActivity(action: string, details: string) {
    return api('log', { user: currentUserName(), action, details });
  },

  async handleAction(action: string, sheetName: string | null, data?: any): Promise<any> {
    if (action === 'read') return this.read(sheetName || '', data);
    if (action === 'login') return this.login(data.users, data.password);
    if (action.startsWith('delete')) return this.delete(action.replace('delete', ''), data.id);
    if (action.startsWith('add')) return this.create(action.replace('add', ''), data);
    if (action.startsWith('update')) return this.update(action.replace('update', ''), data.id, data);
    return { success: false, message: `Unknown action: ${action}` };
  },
};

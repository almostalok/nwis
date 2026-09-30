import {
  AuditLogRecord,
  CreateOperationalEventDto,
  CreateWellDto,
  DataQualityReport,
  DepthEventsQueryDto,
  DrillingParameterSample,
  FormationInterval,
  IngestionJob,
  IngestionResult,
  LoginResponse,
  MudSample,
  NearDepthQueryDto,
  NearbyWellResult,
  NearbyWellsQueryDto,
  OperationalEvent,
  UserRecord,
  Well,
  WellTrajectoryPoint,
} from '@nwis/types';

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => string | null;
}

export class NwisApiClient {
  private baseUrl: string;
  private getToken?: () => string | null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.getToken = config.getToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = new Headers(options.headers || {});

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const token = this.getToken ? this.getToken() : null;
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.error || JSON.stringify(errorJson);
      } catch {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // --- Auth API ---
  readonly auth = {
    login: (credentials: { email: string; password: string }): Promise<LoginResponse> =>
      this.request<LoginResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    me: (): Promise<UserRecord> => this.request<UserRecord>('/api/v1/auth/me'),
    users: (): Promise<UserRecord[]> => this.request<UserRecord[]>('/api/v1/auth/users'),
  };

  // --- Wells API ---
  readonly wells = {
    list: (params?: { field?: string; status?: string; wellType?: string; search?: string; limit?: number; offset?: number }): Promise<Well[]> => {
      const searchParams = new URLSearchParams();
      if (params?.field) searchParams.append('field', params.field);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.wellType) searchParams.append('wellType', params.wellType);
      if (params?.search) searchParams.append('search', params.search);
      if (params?.limit) searchParams.append('limit', String(params.limit));
      if (params?.offset) searchParams.append('offset', String(params.offset));
      const qs = searchParams.toString();
      return this.request<Well[]>(`/api/v1/wells${qs ? `?${qs}` : ''}`);
    },

    getById: (id: string): Promise<Well & { formations?: FormationInterval[]; trajectoryPoints?: WellTrajectoryPoint[]; events?: OperationalEvent[]; documents?: any[] }> =>
      this.request(`/api/v1/wells/${id}`),

    create: (data: CreateWellDto): Promise<Well> =>
      this.request<Well>('/api/v1/wells', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getTrajectory: (id: string): Promise<WellTrajectoryPoint[]> =>
      this.request<WellTrajectoryPoint[]>(`/api/v1/wells/${id}/trajectory`),

    getFormations: (id: string): Promise<FormationInterval[]> =>
      this.request<FormationInterval[]>(`/api/v1/wells/${id}/formations`),

    getParameters: (id: string, limit?: number): Promise<DrillingParameterSample[]> =>
      this.request<DrillingParameterSample[]>(`/api/v1/wells/${id}/parameters${limit ? `?limit=${limit}` : ''}`),

    getMud: (id: string, limit?: number): Promise<MudSample[]> =>
      this.request<MudSample[]>(`/api/v1/wells/${id}/mud${limit ? `?limit=${limit}` : ''}`),

    getEvents: (id: string): Promise<OperationalEvent[]> =>
      this.request<OperationalEvent[]>(`/api/v1/wells/${id}/events`),

    getDocuments: (id: string): Promise<any[]> =>
      this.request<any[]>(`/api/v1/wells/${id}/documents`),

    getNearby: (query: NearbyWellsQueryDto): Promise<NearbyWellResult[]> => {
      const searchParams = new URLSearchParams({
        latitude: String(query.latitude),
        longitude: String(query.longitude),
        radiusKm: String(query.radiusKm),
      });
      if (query.formation) searchParams.append('formation', query.formation);
      if (query.status) searchParams.append('status', query.status);
      if (query.wellType) searchParams.append('wellType', query.wellType);
      if (query.limit) searchParams.append('limit', String(query.limit));
      return this.request<NearbyWellResult[]>(`/api/v1/wells/nearby?${searchParams.toString()}`);
    },
  };

  // --- Formations API ---
  readonly formations = {
    list: (formationName?: string): Promise<FormationInterval[]> =>
      this.request<FormationInterval[]>(`/api/v1/formations${formationName ? `?formationName=${encodeURIComponent(formationName)}` : ''}`),
  };

  // --- Events API ---
  readonly events = {
    list: (query?: DepthEventsQueryDto): Promise<OperationalEvent[]> => {
      const sp = new URLSearchParams();
      if (query?.formation) sp.append('formation', query.formation);
      if (query?.minDepth !== undefined) sp.append('minDepth', String(query.minDepth));
      if (query?.maxDepth !== undefined) sp.append('maxDepth', String(query.maxDepth));
      if (query?.eventType) sp.append('eventType', query.eventType);
      if (query?.severity) sp.append('severity', query.severity);
      if (query?.limit) sp.append('limit', String(query.limit));
      if (query?.offset) sp.append('offset', String(query.offset));
      const qs = sp.toString();
      return this.request<OperationalEvent[]>(`/api/v1/events${qs ? `?${qs}` : ''}`);
    },

    getNearDepth: (query: NearDepthQueryDto): Promise<OperationalEvent[]> => {
      const sp = new URLSearchParams({
        targetDepth: String(query.targetDepth),
      });
      if (query.toleranceMeters) sp.append('toleranceMeters', String(query.toleranceMeters));
      if (query.formation) sp.append('formation', query.formation);
      if (query.eventType) sp.append('eventType', query.eventType);
      if (query.excludeWellId) sp.append('excludeWellId', query.excludeWellId);
      return this.request<OperationalEvent[]>(`/api/v1/events/near-depth?${sp.toString()}`);
    },

    create: (data: CreateOperationalEventDto): Promise<OperationalEvent> =>
      this.request<OperationalEvent>('/api/v1/events', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getById: (id: string): Promise<OperationalEvent> =>
      this.request<OperationalEvent>(`/api/v1/events/${id}`),
  };

  // --- Data Ingestion & Quality ---
  readonly ingestion = {
    import: (body: { sourceName: string; sourceType: string; entityType: string; payload: any }): Promise<IngestionResult> =>
      this.request<IngestionResult>('/api/v1/ingestion/import', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getJobs: (): Promise<IngestionJob[]> => this.request<IngestionJob[]>('/api/v1/ingestion/jobs'),
  };

  readonly dataQuality = {
    getReport: (): Promise<DataQualityReport> => this.request<DataQualityReport>('/api/v1/data-quality'),
  };

  readonly audit = {
    list: (limit?: number): Promise<AuditLogRecord[]> =>
      this.request<AuditLogRecord[]>(`/api/v1/audit-logs${limit ? `?limit=${limit}` : ''}`),
  };

  // --- Stage 02: Knowledge & Document Intelligence ---
  readonly knowledge = {
    listDocuments: (wellId?: string): Promise<any[]> =>
      this.request<any[]>(`/api/v1/knowledge/documents${wellId ? `?wellId=${wellId}` : ''}`),
    getDocument: (id: string): Promise<any> =>
      this.request<any>(`/api/v1/knowledge/documents/${id}`),
    processAll: (): Promise<any> =>
      this.request<any>('/api/v1/knowledge/process-all', { method: 'POST' }),
    processDocument: (id: string): Promise<any> =>
      this.request<any>(`/api/v1/knowledge/process/${id}`, { method: 'POST' }),
    getQueueStatus: (): Promise<any> =>
      this.request<any>('/api/v1/knowledge/queue/status'),
    verifyEntity: (id: string, options?: { value?: string; confidence?: number; notes?: string }): Promise<any> => {
      const searchParams = new URLSearchParams();
      if (options?.value) searchParams.append('value', options.value);
      if (options?.confidence !== undefined) searchParams.append('confidence', String(options.confidence));
      if (options?.notes) searchParams.append('notes', options.notes);
      const qs = searchParams.toString();
      return this.request<any>(`/api/v1/knowledge/entities/${id}/verify${qs ? `?${qs}` : ''}`, { method: 'POST' });
    },
  };

  // --- Stage 02: Drilling Intelligence & Precedents ---
  readonly intelligence = {
    search: (query: any): Promise<any> =>
      this.request<any>('/api/v1/intelligence/search', {
        method: 'POST',
        body: JSON.stringify(query),
      }),
    precedents: (query: any): Promise<any> =>
      this.request<any>('/api/v1/intelligence/precedents', {
        method: 'POST',
        body: JSON.stringify(query),
      }),
    ask: (query: any): Promise<any> =>
      this.request<any>('/api/v1/intelligence/ask', {
        method: 'POST',
        body: JSON.stringify(query),
      }),
    getSummary: (wellId: string): Promise<any> =>
      this.request<any>(`/api/v1/intelligence/wells/${wellId}/summary`),
    getNearby: (wellId: string, limit?: number): Promise<any[]> =>
      this.request<any[]>(`/api/v1/intelligence/wells/${wellId}/nearby${limit ? `?limit=${limit}` : ''}`),
    getTimeline: (wellId: string): Promise<any> =>
      this.request<any>(`/api/v1/intelligence/wells/${wellId}/timeline`),
    compare: (wellA: string, wellB: string): Promise<any> =>
      this.request<any>(`/api/v1/intelligence/compare?wellA=${encodeURIComponent(wellA)}&wellB=${encodeURIComponent(wellB)}`),
  };

  // --- Stage 03: Real-Time Drilling Intelligence & Simulation ---
  readonly realtime = {
    getLatestSample: (wellId: string): Promise<any> =>
      this.request<any>(`/api/v1/realtime/wells/${wellId}/latest`),
    getHistory: (wellId: string, limit?: number): Promise<any[]> =>
      this.request<any[]>(`/api/v1/realtime/wells/${wellId}/history${limit ? `?limit=${limit}` : ''}`),
    getFeatures: (wellId: string): Promise<any[]> =>
      this.request<any[]>(`/api/v1/realtime/wells/${wellId}/features`),
    getAnomalies: (wellId: string): Promise<any[]> =>
      this.request<any[]>(`/api/v1/realtime/wells/${wellId}/anomalies`),
    getRisks: (wellId: string): Promise<any[]> =>
      this.request<any[]>(`/api/v1/realtime/wells/${wellId}/risks`),
    getCurrentWellContext: (wellId: string): Promise<any> =>
      this.request<any>(`/api/v1/realtime/wells/${wellId}/context`),
    getSensorHealth: (wellId: string): Promise<any[]> =>
      this.request<any[]>(`/api/v1/realtime/wells/${wellId}/sensor-health`),
    startSimulation: (body: {
      wellId: string;
      scenario?: string;
      speedMultiplier?: number;
      startDepth?: number;
      endDepth?: number;
    }): Promise<any> =>
      this.request<any>('/api/v1/realtime/simulator/start', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    stopSimulation: (wellId: string): Promise<any> =>
      this.request<any>('/api/v1/realtime/simulator/stop', {
        method: 'POST',
        body: JSON.stringify({ wellId }),
      }),
    pauseSimulation: (wellId: string): Promise<any> =>
      this.request<any>('/api/v1/realtime/simulator/pause', {
        method: 'POST',
        body: JSON.stringify({ wellId }),
      }),
    resumeSimulation: (wellId: string): Promise<any> =>
      this.request<any>('/api/v1/realtime/simulator/resume', {
        method: 'POST',
        body: JSON.stringify({ wellId }),
      }),
    runHackathonDemo: (): Promise<any> =>
      this.request<any>('/api/v1/realtime/simulator/demo', {
        method: 'POST',
      }),
    getSimulatorStatus: (): Promise<any> =>
      this.request<any>('/api/v1/realtime/simulator/status'),
    resetSimulation: (): Promise<any> =>
      this.request<any>('/api/v1/realtime/simulator/reset', {
        method: 'POST',
      }),
  };

  // --- Stage 03: Alert Lifecycle Management ---
  readonly alerts = {
    list: (params?: {
      wellId?: string;
      riskType?: string;
      severity?: string;
      status?: string;
      limit?: number;
    }): Promise<any[]> => {
      const searchParams = new URLSearchParams();
      if (params?.wellId) searchParams.append('wellId', params.wellId);
      if (params?.riskType) searchParams.append('riskType', params.riskType);
      if (params?.severity) searchParams.append('severity', params.severity);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.limit) searchParams.append('limit', String(params.limit));
      const qs = searchParams.toString();
      return this.request<any[]>(`/api/v1/alerts${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string): Promise<any> =>
      this.request<any>(`/api/v1/alerts/${id}`),
    acknowledge: (id: string, actor?: string, note?: string): Promise<any> =>
      this.request<any>(`/api/v1/alerts/${id}/acknowledge`, {
        method: 'POST',
        body: JSON.stringify({ actor, note }),
      }),
    resolve: (id: string, actor?: string, note?: string): Promise<any> =>
      this.request<any>(`/api/v1/alerts/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ actor, note }),
      }),
    dismiss: (id: string, reason: string, actor?: string): Promise<any> =>
      this.request<any>(`/api/v1/alerts/${id}/dismiss`, {
        method: 'POST',
        body: JSON.stringify({ reason, actor }),
      }),
  };

  // --- Stage 04: Health, Model Registry & Executive Reports ---
  readonly health = {
    check: (): Promise<any> => this.request<any>('/health'),
    live: (): Promise<any> => this.request<any>('/health/live'),
    ready: (): Promise<any> => this.request<any>('/health/ready'),
    dependencies: (): Promise<any> => this.request<any>('/health/dependencies'),
  };

  readonly models = {
    list: (): Promise<any[]> => this.request<any[]>('/api/v1/models'),
    getById: (id: string): Promise<any> => this.request<any>(`/api/v1/models/${id}`),
  };

  readonly reports = {
    getWellReport: (wellId: string): Promise<any> =>
      this.request<any>(`/api/v1/reports/well/${wellId}`),
    getAlertReport: (alertId: string): Promise<any> =>
      this.request<any>(`/api/v1/reports/alert/${alertId}`),
    getDailyReport: (): Promise<any> =>
      this.request<any>('/api/v1/reports/daily'),
  };
}


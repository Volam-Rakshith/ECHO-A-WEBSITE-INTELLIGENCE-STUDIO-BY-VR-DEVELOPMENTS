import { VaultProject, AnalysisResult } from '../types';

const DB_NAME = 'ECHO_PROJECT_VAULT_DB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

function openVaultDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('domain', 'domain', { unique: false });
        store.createIndex('starred', 'starred', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

export async function saveAnalysisToVault(analysis: AnalysisResult, customName?: string): Promise<VaultProject> {
  const db = await openVaultDatabase();
  const domain = analysis.metadata.domain || 'localhost';
  const name = customName || analysis.metadata.title || `Scan of ${domain}`;

  const project: VaultProject = {
    id: analysis.id || `proj-${Date.now()}`,
    name,
    domain,
    url: analysis.targetUrl,
    favicon: analysis.metadata.favicon,
    createdAt: analysis.timestamp || Date.now(),
    updatedAt: Date.now(),
    starred: false,
    tags: [domain, analysis.stats.primaryStrategy.split(' ')[0]],
    summary: {
      title: analysis.metadata.title,
      resourceCount: analysis.resources.length,
      colorCount: analysis.colors.length,
      wordCount: analysis.content.wordCount,
      primaryStrategy: analysis.stats.primaryStrategy,
    },
    data: analysis,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(project);

    req.onsuccess = () => resolve(project);
    req.onerror = () => reject(req.error || new Error('Failed to save project to IndexedDB'));
  });
}

export async function getAllVaultProjects(): Promise<VaultProject[]> {
  try {
    const db = await openVaultDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result as VaultProject[];
        results.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function getVaultProjectById(id: string): Promise<VaultProject | null> {
  const db = await openVaultDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);

    req.onsuccess = () => resolve((req.result as VaultProject) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteVaultProject(id: string): Promise<void> {
  const db = await openVaultDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function renameVaultProject(id: string, newName: string): Promise<void> {
  const db = await openVaultDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const proj = getReq.result as VaultProject;
      if (!proj) {
        reject(new Error('Project not found'));
        return;
      }
      proj.name = newName;
      proj.updatedAt = Date.now();
      const putReq = store.put(proj);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function toggleStarProject(id: string): Promise<boolean> {
  const db = await openVaultDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const proj = getReq.result as VaultProject;
      if (!proj) {
        reject(new Error('Project not found'));
        return;
      }
      proj.starred = !proj.starred;
      proj.updatedAt = Date.now();
      const putReq = store.put(proj);
      putReq.onsuccess = () => resolve(proj.starred);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function exportVaultBackupJSON(): Promise<string> {
  const projects = await getAllVaultProjects();
  const backup = {
    app: 'ECHO — Website Intelligence by VR DEVELOPMENTS',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    count: projects.length,
    projects,
  };
  return JSON.stringify(backup, null, 2);
}

export async function importVaultBackupJSON(jsonStr: string): Promise<number> {
  const parsed = JSON.parse(jsonStr);
  if (!parsed.projects || !Array.isArray(parsed.projects)) {
    throw new Error('Invalid ECHO Vault backup format');
  }

  const db = await openVaultDatabase();
  let count = 0;

  for (const proj of parsed.projects) {
    if (proj.id && proj.data) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(proj);
        req.onsuccess = () => {
          count++;
          resolve();
        };
        req.onerror = () => reject(req.error);
      });
    }
  }

  return count;
}

export async function getStorageEstimate(): Promise<{ usedBytes: number; quotaBytes: number; percent: number }> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 1024 * 1024 * 100;
      const percent = Math.min(100, Math.round((used / quota) * 100));
      return { usedBytes: used, quotaBytes: quota, percent };
    } catch {
      // fallback
    }
  }
  return { usedBytes: 0, quotaBytes: 1024 * 1024 * 50, percent: 0 };
}

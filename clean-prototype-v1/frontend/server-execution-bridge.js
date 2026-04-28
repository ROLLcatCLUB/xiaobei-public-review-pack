(function(){
  const SERVER_BASE = 'https://47.102.219.247';

  function rootBase(){
    return window.location.protocol === 'file:' ? SERVER_BASE : '';
  }

  function cleanPath(path){
    return String(path || '').replace(/^\/+/, '');
  }

  function legacyHref(path){
    if (!path) return rootBase() || '/';
    if (/^https?:\/\//i.test(path)) return path;
    return `${rootBase()}/${cleanPath(path)}`;
  }

  function apiUrl(path){
    if (/^https?:\/\//i.test(path)) return path;
    const suffix = String(path || '').startsWith('/') ? path : `/${path}`;
    return `${rootBase()}${suffix}`;
  }

  async function fetchJson(path, options){
    const controller = new AbortController();
    const timeoutMs = options?.timeoutMs || 12000;
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(apiUrl(path), {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
        ...(options || {})
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        data = { raw: text };
      }
      if (!response.ok) {
        throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
      }
      return data;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function parseWorkName(name){
    const basename = String(name || '').split('/').pop() || '';
    const rawName = basename.replace(/\.[a-z0-9]+$/i, '');
    const parts = rawName.split('_');
    const recordMatch = rawName.match(/(rec[a-zA-Z0-9]+)/);
    return {
      className: parts[0] || '',
      studentName: parts[1] || '',
      topicName: parts[2] || '',
      reviewStatus: parts[3] || '',
      recordId: recordMatch ? recordMatch[1] : ''
    };
  }

  function normalizeWork(file){
    const parsed = parseWorkName(file?.name);
    const url = file?.url || (file?.name ? `/uploads/${file.name}` : '');
    return {
      ...(file || {}),
      ...parsed,
      absoluteUrl: url ? legacyHref(url) : ''
    };
  }

  function listTeacherClasses(teacherName){
    const name = teacherName || '徐涛';
    return fetchJson(`/api/submission/teacher_classes?teacher_name=${encodeURIComponent(name)}`);
  }

  function listClassSummaries(){
    return fetchJson('/api/class/list');
  }

  async function listWorks(params){
    const query = new URLSearchParams();
    const folder = params?.folder || '';
    const status = params?.status || '';
    if (folder) query.set('folder', folder);
    if (status) query.set('status', status);
    const data = await fetchJson(`/api/list${query.toString() ? `?${query.toString()}` : ''}`);
    return {
      ...data,
      files: Array.isArray(data?.files) ? data.files.map(normalizeWork) : []
    };
  }

  function listXiaopingQueue(status){
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return fetchJson(`/api/xiaoping/queue${query}`);
  }

  window.XIAOBEI_SERVER_EXECUTION_BRIDGE_V1 = {
    serverBase: SERVER_BASE,
    rootBase,
    legacyHref,
    apiUrl,
    fetchJson,
    parseWorkName,
    normalizeWork,
    listTeacherClasses,
    listClassSummaries,
    listWorks,
    listXiaopingQueue
  };
})();

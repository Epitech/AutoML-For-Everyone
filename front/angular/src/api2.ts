const URL = 'http://localhost:5000';

type OptionsType = {
  method: 'GET' | 'POST' | 'PUT';
  body?: any;
  headers?: HeadersInit;
};

const api = (url: string, options?: OptionsType, no_json?: boolean) =>
  fetch(URL + url, options).then((res) => (no_json ? res : res.json()));

// DATASETS

export const get_datasets = () => api('/dataset');

export const get_dataset = (id: string) => api(`/dataset/${id}`);
export const post_dataset = (file: File) => {
  const formData: FormData = new FormData();
  formData.append('file', file, file.name);
  return api('/dataset', { method: 'POST', body: formData }, true);
};

// CONFIG

export const post_config = (id: string, config: any) =>
  api(
    `/dataset/${id}/config`,
    {
      method: 'POST',
      body: JSON.stringify(config),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    },
    true
  );

export const get_config = (id: string) => api(`/config/${id}`);

export const get_lint = (id: string) =>
  api(`/config/${id}/lint`, { method: 'POST' });

export const get_sweetviz = (id: string) => api(`/config/${id}/sweetviz`);

// MODEL

export const post_model = (id: string) =>
  api(`/config/${id}/model`, { method: 'POST' }, true);

export const get_model = (id: string) => api(`/model/${id}`);

export const post_train = (id: string) =>
  api(`/model/${id}/train`, { method: 'POST' }, true);

export const get_status = (id: string) => api(`/model/${id}/status`);

export const get_export = (id: string) => api(`/model/${id}/export`);

export const get_predict = (id: string) =>
  api(`/model/${id}/predict`, { method: 'POST' });

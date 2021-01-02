const URL = 'http://localhost:5000/dataset';

export const get_datasets = async () => {
  const res = await fetch(URL);

  return res.json();
};

export const get_config = async (id: string) => {
  const res = await fetch(URL + `/${id}/config`);

  return res.json();
};

export const put_config = async (id: string, config: any) => {
  console.log('putting config', id, config);

  return fetch(URL + `/${id}/config`, {
    method: 'PUT',
    body: JSON.stringify(config),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });
};

export const post_predict = async (id: string, data: any) => {
  console.log('posting train', id, data);

  return fetch(URL + `/${id}/predict`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });
};

export const launch_train = async (id: string) => {
  console.log('lauching train for', id);

  const res = await fetch(URL + `/${id}/train`, {
    method: 'POST',
  });

  return res;
};

export const launch_export = (id: string) => {
  window.open(URL + `/${id}/export`, '_blank');
};

export const get_sweetviz = (id: string) => {
  return URL + `/${id}/sweetviz`;
};

export const upload_dataset = (file: File) => {
  if (!file) return;
  const formData: FormData = new FormData();
  formData.append('file', file, file.name);
  fetch(URL, { method: 'POST', body: formData });
};

// type config = {};//key:boolean

// type Dataset = {
//   label: 'label_column';
//   configs: config[];
// };

// type Datasets = Dataset[];

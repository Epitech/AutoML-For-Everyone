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
  });
};

export const launch_train = async (id: string) => {
  console.log('lauching train for', id);

  const res = await fetch(URL + `/${id}/train`, {
    method: 'POST',
  });

  return res;
};

// type config = {};//key:boolean

// type Dataset = {
//   label: 'label_column';
//   configs: config[];
// };

// type Datasets = Dataset[];

const csv1 = [
  { name: 'Ugo', age: 20, id: 1, grade: 17.3, graduated: true },
  { name: 'Toto', age: 25, id: 2, grade: 5.5, graduated: false },
];

const csv2 = [
  { name: 'Ugo2', age: 120, id: 1, grade: 17.3, graduated: true },
  { name: 'Toto2', age: 125, id: 2, grade: 5.5, graduated: false },
];

const fake_model_config = { label: 'label_colum' };

const fake_weight1 = {
  name: 0.0,
  age: 0.5,
  id: 0.0,
  grade: 0.75,
  graduated: 1.0,
};
const fake_weight2 = {
  name: 1.0,
  age: 0.25,
  id: 0.6,
  grade: 0.12,
  graduated: 0.0,
};

const DATASETS = [
  {
    id: 'id1',
    values: csv1,
    model_config: fake_model_config,
    weights: [fake_weight1, fake_weight2],
  },
  {
    id: 'id2',
    values: csv2,
    model_config: fake_model_config,
    weights: [fake_weight1, fake_weight2],
  },
];

export const get_datasets = async () => DATASETS.map((e) => e.id);

export const get_dataset = async (id: string) => {
  const d = DATASETS.find((e) => e.id === id);
  return {
    values: d?.values,
    configs: d?.weights,
  };
};

export const get_config = async (id: string) =>
  DATASETS.find((e) => e.id === id)?.model_config;

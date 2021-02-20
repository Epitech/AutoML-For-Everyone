const URL = 'http://localhost:5000';

type OptionsType =
  | {
      method: 'GET' | 'POST' | 'DELETE';
      body?: any;
    }
  | { method: 'POST'; body: any; headers: HeadersInit };

const api = (url: string, options?: OptionsType, no_json?: boolean) =>
  fetch(URL + url, options).then((res) => (no_json ? res : res.json()));

const with_body = (body: any): OptionsType => ({
  method: 'POST',
  body: JSON.stringify(body),
  headers: new Headers({ 'Content-Type': 'application/json' }),
});

// DATASETS

export const get_datasets = (): Promise<string[]> => api('/dataset');

export type DatasetType = {
  columns: string[];
  configs: [];
  name: string;
  size?: number;
};

export const get_dataset = (id: string): Promise<DatasetType> =>
  api(`/dataset/${id}`);

export const post_dataset = (file: File) => {
  const formData: FormData = new FormData();
  formData.append('file', file, file.name);
  return api('/dataset', { method: 'POST', body: formData }, true);
};

// CONFIG

export type NewConfigType = {
  columns: { [key: string]: boolean };
  label: string;
  model_type: 'classification' | 'regression';
};

export const post_config = (id: string, config: any) =>
  api(`/dataset/${id}/config`, with_body(config));

export const delete_dataset = (id: string) =>
  api(`/dataset/${id}`, { method: 'DELETE' });

export const delete_config = (id: string) =>
  api(`/config/${id}`, { method: 'DELETE' });

export const delete_model = (id: string) =>
  api(`/model/${id}`, { method: 'DELETE' });

export type LintType = [string, string, boolean][];
export type ColumnLintType = { [key: string]: LintType };
export type PostLintType = {
  lints: ColumnLintType;
};

export const post_lint = (id: string, config: any): Promise<PostLintType> =>
  api(`/dataset/${id}/config/lint`, with_body(config));

export const get_config = (id?: string) => api(`/config/${id}`);

export const get_lint = (id: string) => api(`/config/${id}/lint`);

export const get_dataset_sweetviz_url = (id: string) =>
  `${URL}/dataset/${id}/sweetviz`;
export const get_config_sweetviz_url = (id: string) =>
  `${URL}/config/${id}/sweetviz`;

// MODEL

export const scoring_classification = [
  'accuracy',
  'adjusted_rand_score',
  'average_precision',
  'balanced_accuracy',
  'f1',
  'f1_macro',
  'f1_micro',
  'f1_samples',
  'f1_weighted',
  'neg_log_loss',
  'precision',
  'precision_macro',
  'precision_micro',
  'precision_samples',
  'precision_weighted',
  'recall',
  'recall_macro',
  'recall_micro',
  'recall_samples',
  'recall_weighted',
  'jaccard',
  'jaccard_macro',
  'jaccard_micro',
  'jaccard_samples',
  'jaccard_weighted',
  'roc_auc',
  'roc_auc_ovr',
  'roc_auc_ovo',
  'roc_auc_ovr_weighted',
  'roc_auc_ovo_weighted',
];

export const scoring_regression = [
  'neg_median_absolute_error',
  'neg_mean_absolute_error',
  'neg_mean_squared_error',
  'r2',
];

export const configDict = ['TPOT light', 'TPOT MDR', 'TPOT sparse'];

export type ModelType = {
  [key: string]: string | number | undefined;
  generations: number;
  population_size: number;
  offspring_size: number;
  mutation_rate: number;
  crossover_rate: number;
  subsample: number;
  early_stop: number;
  scoring:
    | typeof scoring_classification[number]
    | typeof scoring_regression[number];
  config_dict?: typeof configDict[number];
};

export const post_model = (id: string, config: ModelType) =>
  api(`/config/${id}/model`, with_body(config));

export const get_model = (id: string) => api(`/model/${id}`);

export const post_train = (id: string) =>
  api(`/model/${id}/train`, { method: 'POST' }, true);

export const get_status = (id: string) => api(`/model/${id}/status`);

export const get_export = (id: string) =>
  window.open(URL + `/model/${id}/export`);

export const get_predict = (id: string, data: any) =>
  api(`/model/${id}/predict`, with_body(data));

export const get_matrix = (id: string) =>
  api(`/model/${id}/confusion_matrix`, { method: 'GET' }, true);

export const get_shap = (id: string) =>
  api(`/model/${id}/shap_value`, { method: 'GET' }, true);

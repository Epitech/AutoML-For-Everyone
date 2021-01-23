const URL = 'http://localhost:5000/dataset';

// export const get_lint = async (id: string) => {
//   const res = await fetch(URL + `/${id}/config/lint`, {
//     method: 'POST',
//   });

//   return res.json();
// };

// export const post_predict = async (id: string, data: any) => {
//   console.log('posting train', id, data);

//   const res = await fetch(URL + `/${id}/predict`, {
//     method: 'POST',
//     body: JSON.stringify(data),
//     headers: new Headers({
//       'Content-Type': 'application/json',
//     }),
//   });

//   return res.json();
// };

export const launch_export = (id: string) => {
  window.open(URL + `/${id}/export`, '_blank');
};

const baseUrl = 'https://livejs-api.hexschool.io';
const apiPath = 'nocab77142024';

const customerApi = `${baseUrl}/api/livejs/v1/customer/${apiPath}`;
const adminApi = `${baseUrl}/api/livejs/v1/admin/${apiPath}`;

const token = 'Llf4Pz85PWNdD2HZA1dnFzpjNkg1';

// Custom instance defaults
// axios 建立實體用於 admin
const adminInstance = axios.create({
  baseURL: adminApi,
  headers: {
    authorization: token,
  },
});

// sweetalert2 toast 基礎設定
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export default {
  baseUrl,
  apiPath,
  customerApi,
  adminApi,
  token,
  Toast,
  adminInstance,
};

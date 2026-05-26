// Utility functions shared across pages
export const utils = {
  formatNumber(num) {
    return new Intl.NumberFormat("ko-KR").format(num);
  },
  formatDate(dateStr, opts = { year: "numeric", month: "2-digit", day: "2-digit" }) {
    return new Date(dateStr).toLocaleDateString("ko-KR", opts);
  },
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
};

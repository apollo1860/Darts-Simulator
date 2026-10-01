// Nachrichten-Feed
export function addNews(state, type, title, text = '') {
  state.news.unshift({ year: state.date.year, week: state.date.week, type, title, text, read: false });
  if (state.news.length > 200) state.news.length = 200;
}
export const unreadCount = state => state.news.filter(n => !n.read).length;
export const markAllRead = state => state.news.forEach(n => { n.read = true; });

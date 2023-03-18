export const checkApiKey = () => {
  const chatgptApiKey = window.localStorage.getItem('chatgptApiKey');

  if (!chatgptApiKey) {
    const value = window.prompt('请输入 Api Key');
    if (!value) return;

    window.localStorage.setItem('chatgptApiKey', value);
  }
};

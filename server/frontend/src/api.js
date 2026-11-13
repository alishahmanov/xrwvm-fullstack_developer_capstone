export async function api(path, data) {
  const token = document.cookie.match(/(?:^|; )csrftoken=([^;]+)/)?.[1];
  const response = await fetch('/djangoapp/' + path, data === undefined ? {} : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': token || '' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request could not be completed.');
  return result;
}

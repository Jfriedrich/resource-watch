import 'isomorphic-fetch';
import queryString from 'query-string';
import { createAction, createThunkAction } from 'redux-tools';
import WRISerializer from 'wri-json-api-serializer';

// Actions
export const setTopics = createAction('TOPICS_GET');
export const setLoading = createAction('TOPICS_LOADING');
export const setFilters = createAction('TOPICS_SET-FILTERS');
export const setError = createAction('TOPICS_ERROR');

// Async actions
export const fetchTopics = createThunkAction('TOPICS_FETCH_DATA', (payload = {}) => (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  const qParams = queryString.stringify({
    sort: 'name',
    ...payload.filters
  });

  return fetch(new Request(`${process.env.WRI_API_URL}/topic?${qParams}`))
    .then(response => response.json())
    .then(({ data }) => {
      dispatch(setLoading(false));
      dispatch(setError(null));
      dispatch(setTopics(data.map(d =>
        ({ id: d.id, ...d.attributes }))));
    })
    .catch((err) => {
      dispatch(setLoading(false));
      dispatch(setError(err));
    });
});

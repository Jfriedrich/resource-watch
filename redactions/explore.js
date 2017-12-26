/* global config */
import 'isomorphic-fetch';
import { Router } from 'routes';
import { toastr } from 'react-redux-toastr';

// Services
import UserService from 'services/UserService';
import GraphService from 'services/GraphService';

import { BASEMAPS } from 'components/widgets/editor/map/constants';

/**
 * CONSTANTS
*/
const GET_DATASETS_SUCCESS = 'explore/GET_DATASETS_SUCCESS';
const GET_DATASETS_ERROR = 'explore/GET_DATASETS_ERROR';
const GET_DATASETS_LOADING = 'explore/GET_DATASETS_LOADING';

const GET_FAVORITES_SUCCESS = 'explore/GET_FAVORITES_SUCCESS';
const GET_FAVORITES_ERROR = 'explore/GET_FAVORITES_ERROR';
const GET_FAVORITES_LOADING = 'explore/GET_FAVORITES_LOADING';

const SET_DATASETS_PAGE = 'explore/SET_DATASETS_PAGE';
const SET_DATASETS_SEARCH_FILTER = 'explore/SET_DATASETS_SEARCH_FILTER';
const SET_DATASET_FILTER = 'explore/SET_DATASET_FILTER';
const SET_FILTERS_LOADING = 'explore/SET_FILTERS_LOADING';

const SET_SORTING_ORDER = 'explore/SET_SORTING_ORDER';
const SET_SORTING_DATASETS = 'explore/SET_SORTING_DATASETS';
const SET_SORTING_LOADING = 'explore/SET_SORTING_LOADING';

const SET_DATASETS_FILTERED_BY_CONCEPTS = 'explore/SET_DATASETS_FILTERED_BY_CONCEPTS';
const SET_DATASETS_FILTERS = 'explore/SET_DATASETS_FILTERS';

const SET_DATASETS_MODE = 'explore/SET_DATASETS_MODE';

const SET_LAYERGROUP_TOGGLE = 'explore/SET_LAYERGROUP_TOGGLE';
const SET_LAYERGROUP_VISIBILITY = 'explore/SET_LAYERGROUP_VISIBILITY';
const SET_LAYERGROUP_ACTIVE_LAYER = 'explore/SET_LAYERGROUP_ACTIVE_LAYER';
const SET_LAYERGROUP_ORDER = 'explore/SET_LAYERGROUP_ORDER';
const SET_LAYERGROUP_OPACITY = 'explore/SET_LAYERGROUP_OPACITY';
const SET_LAYERGROUPS = 'explore/SET_LAYERGROUPS';

const SET_SIDEBAR = 'explore/SET_SIDEBAR';

const SET_TOPICS_TREE = 'explore/SET_TOPICS_TREE';
const SET_DATA_TYPE_TREE = 'explore/SET_DATA_TYPE_TREE';
const SET_GEOGRAPHIES_TREE = 'explore/SET_GEOGRAPHIES_TREE';

const SET_ZOOM = 'explore/SET_ZOOM';
const SET_LATLNG = 'explore/SET_LATLNG';
const SET_BASEMAP = 'explore/SET_BASEMAP';
const SET_LABELS = 'explore/SET_LABELS';

/**
 * Layer
 * @typedef {Object} Layer
 * @property {string} id - ID of the associated layer
 * @property {boolean} active - If the layer is the one to be displayed
 */

/**
 * Group of layers
 * @typedef {Object} LayerGroup
 * @property {string} dataset - ID of the associated dataset
 * @property {boolean} visible - Indicates whether the group is visible
 * @property {Layer[]} layers - Actual list of layers
 */

/**
 * REDUCER
*/
const initialState = {
  datasets: {
    list: [],
    loading: false,
    error: false,
    page: 1,
    limit: 9,
    mode: 'grid' // 'grid' or 'list'
  },
  // List of layers (corresponding to the datasets
  // set as active)
  //
  // NOTES:
  //  * If a layer is removed from the map, it is removed
  // from this list
  //  * This list does not contain the attributes of the
  // layers, just the information necessary to retrieve
  // the layers in the list of datasets
  //  * The groups are sorted according to the order the
  // user has set in the legend
  /** @type {LayerGroup[]} */
  layers: [],
  filters: {
    search: null,
    datasetsFilteredByConcepts: [],
    loading: false
  },
  sidebar: {
    open: true,
    width: 0
  },
  zoom: 3,
  latLng: { lat: 0, lng: 0 },
  basemap: BASEMAPS.dark,
  basemapControl: {
    basemaps: BASEMAPS
  },
  geographiesTree: null,
  topicsTree: null,
  dataTypeTree: null,
  labels: false,
  sorting: {
    /** @type {'modified'|'viewed'|'favourited'} order */
    order: 'modified',
    // The list of datasets below is not the actual list of sorted
    // datasets, it is the list of the sorted ids
    /** @type {string[]} */
    datasets: [],
    loading: false
  }
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_DATASETS_SUCCESS: {
      const datasets = Object.assign({}, state.datasets, {
        list: action.payload,
        loading: false,
        error: false
      });
      return Object.assign({}, state, { datasets });
    }

    case GET_DATASETS_ERROR: {
      const datasets = Object.assign({}, state.datasets, {
        loading: false,
        error: true
      });
      return Object.assign({}, state, { datasets });
    }

    case GET_DATASETS_LOADING: {
      const datasets = Object.assign({}, state.datasets, {
        loading: true,
        error: false
      });
      return Object.assign({}, state, { datasets });
    }

    case SET_LAYERGROUP_TOGGLE: {
      if (action.payload.add) { // We add a layer group
        const dataset = state.datasets.list.find(d => d.id === action.payload.dataset);
        if (!dataset) return state;
        const layers = [...state.layers];
        layers.unshift({
          dataset: dataset.id,
          visible: true,
          layers: dataset.attributes.layer.map((l, index) => ({ id: l.id, active: index === 0 }))
        });
        return Object.assign({}, state, { layers });
      // eslint-disable-next-line no-else-return
      } else { // We remove a layer group
        const layers = state.layers.filter(l => l.dataset !== action.payload.dataset);
        return Object.assign({}, state, { layers });
      }
    }

    case SET_LAYERGROUP_VISIBILITY: {
      const layers = state.layers.map((l) => {
        if (l.dataset !== action.payload.dataset) return l;
        const datasetLayers = l.layers.map(lay => Object.assign({}, lay, { opacity: 1 }));
        return Object.assign({}, l, { visible: action.payload.visible, layers: datasetLayers });
      });
      return Object.assign({}, state, { layers });
    }

    case SET_LAYERGROUP_ACTIVE_LAYER: {
      const layerGroups = state.layers.map((l) => {
        if (l.dataset !== action.payload.dataset) return l;
        const layers = l.layers.map((la) => { // eslint-disable-line arrow-body-style
          return Object.assign({}, la, { active: la.id === action.payload.layer, opacity: 1 });
        });
        return Object.assign({}, l, { layers });
      });
      return Object.assign({}, state, { layers: layerGroups });
    }

    case SET_LAYERGROUP_ORDER: {
      const layers = action.payload.map(d => state.layers.find(l => l.dataset === d));
      return Object.assign({}, state, { layers });
    }

    case SET_LAYERGROUP_OPACITY: {
      const layerGroups = state.layers.map((l) => {
        if (l.dataset !== action.payload.dataset) return l;
        const layers = l.layers.map((la) => { // eslint-disable-line arrow-body-style
          return Object.assign({}, la, { opacity: action.payload.opacity });
        });
        return Object.assign({}, l, { layers });
      });
      return Object.assign({}, state, { opacity: action.payload.opacity, layers: layerGroups });
    }

    case SET_LAYERGROUPS: {
      return Object.assign({}, state, { layers: action.payload });
    }

    case SET_DATASETS_PAGE: {
      const datasets = Object.assign({}, state.datasets, {
        page: action.payload
      });
      return Object.assign({}, state, { datasets });
    }

    case SET_DATASETS_MODE: {
      const datasets = Object.assign({}, state.datasets, {
        mode: action.payload
      });
      return Object.assign({}, state, { datasets });
    }

    case SET_DATASETS_SEARCH_FILTER: {
      const filters = Object.assign({}, state.filters, {
        search: action.payload
      });
      return Object.assign({}, state, { filters });
    }

    case SET_DATASET_FILTER: {
      console.log('state', state);
      const list = state.list.slice(0);
      let filteredList = [];
      const filtersChosen = Object.assign({}, state.filters);

      if (action.payload.filter) {
        if (filtersChosen[action.payload.filter]) {
          const index = filtersChosen[action.payload.filter].indexOf(action.payload.tag);
          if (index > -1) {
            filtersChosen[action.payload.filter].splice(index, 1);
          } else {
            filtersChosen[action.payload.filter].push(action.payload.tag);
          }
        } else {
          filtersChosen[action.payload.filter] = [action.payload.tag];
        }
      }

      if (list && list.length) {
        const andFilters = Object.keys(filtersChosen);
        filteredList = list.filter((item) => {
          for (let i = andFilters.length - 1; i >= 0; i--) {
            const tags = filtersChosen[andFilters[i]];
            let itemTags = [];
            if (item.vocabulary[0]) {
              itemTags = item.vocabulary[0].attributes.tags || [];
            }
            let j = tags.length - 1;
            for (j; j >= 0; j--) {
              if (itemTags.indexOf(tags[j]) > -1) {
                break;
              }
            }
            if (tags.length > 0 && j < 0) {
              if (item.active === true) {
                item.active = false; // eslint-disable-line no-param-reassign
              }
              return false;
            }
          }
          return true;
        });
      }

      return Object.assign({}, state, { filteredList, filters: filtersChosen });
    }

    case SET_FILTERS_LOADING: {
      const filters = Object.assign({}, state.filters, {
        loading: action.payload
      });
      return Object.assign({}, state, { filters });
    }

    case SET_DATASETS_FILTERED_BY_CONCEPTS: {
      const filters = Object.assign({}, state.filters, {
        datasetsFilteredByConcepts: action.payload
      });
      return Object.assign({}, state, { filters });
    }

    case SET_SIDEBAR: {
      return Object.assign({}, state, {
        sidebar: Object.assign({}, state.sidebar, action.payload)
      });
    }

    case SET_GEOGRAPHIES_TREE: {
      return Object.assign({}, state, {
        geographiesTree: action.payload
      });
    }

    case SET_DATA_TYPE_TREE: {
      return Object.assign({}, state, {
        dataTypeTree: action.payload
      });
    }

    case SET_TOPICS_TREE: {
      return Object.assign({}, state, {
        topicsTree: action.payload
      });
    }

    case SET_BASEMAP: {
      return Object.assign({}, state, {
        basemap: action.payload
      });
    }

    case SET_LABELS: {
      return Object.assign({}, state, {
        labels: action.payload
      });
    }

    case SET_ZOOM: {
      return Object.assign({}, state, {
        zoom: action.payload
      });
    }

    case SET_LATLNG: {
      return Object.assign({}, state, {
        latLng: action.payload
      });
    }

    case SET_SORTING_ORDER: {
      return Object.assign({}, state, {
        sorting: Object.assign({}, state.sorting, { order: action.payload })
      });
    }

    case SET_SORTING_DATASETS: {
      return Object.assign({}, state, {
        sorting: Object.assign({}, state.sorting, { datasets: action.payload })
      });
    }

    case SET_SORTING_LOADING: {
      return Object.assign({}, state, {
        sorting: Object.assign({}, state.sorting, { loading: action.payload })
      });
    }

    default:
      return state;
  }
}

// Let's use {replace} instead of {push}, that's how we will allow users to
// go away from the current page
export function setUrlParams() {
  return (dispatch, getState) => {
    const { explore, exploreDatasetFilters } = getState();
    const layerGroups = explore.layers;
    const { zoom, latLng, sorting } = explore;
    const { page } = explore.datasets;
    const { search } = explore.filters;
    const { topics, dataTypes, geographies } = exploreDatasetFilters.filters;

    const query = { page };

    if (layerGroups.length) {
      query.layers = encodeURIComponent(JSON.stringify(layerGroups));
    }

    if (search && search.value) {
      query.search = search.value;
    }

    if (topics) {
      if (topics.length > 0) {
        query.topics = JSON.stringify(topics);
      } else {
        delete query.topics;
      }
    }

    if (dataTypes) {
      if (dataTypes.length > 0) {
        query.dataTypes = JSON.stringify(dataTypes);
      } else {
        delete query.dataType;
      }
    }

    if (geographies) {
      if (geographies.length > 0) {
        query.geographies = JSON.stringify(geographies);
      } else {
        delete query.geographies;
      }
    }

    if (zoom) {
      query.zoom = zoom;
    }

    if (latLng) {
      query.latLng = JSON.stringify(latLng);
    }

    if (sorting) {
      query.sort = sorting.order;
    }

    Router.replaceRoute('explore', query);
  };
}

export function getFavoriteDatasets(token) {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_FAVORITES_LOADING });

    const userService = new UserService({ apiURL: process.env.WRI_API_URL });

    return userService.getFavouriteDatasets(token)
      .then((response) => {
        dispatch({
          type: GET_FAVORITES_SUCCESS,
          payload: response
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_FAVORITES_ERROR,
          payload: err.message
        });
      });
  };
}

export function getDatasets({ pageNumber, pageSize }) {
  console.log('asldkfjalskdf');
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_DATASETS_LOADING });

    console.log('aksdjflkasdj');

    return fetch(new Request(`${process.env.WRI_API_URL}/dataset?application=${[process.env.APPLICATIONS]}&status=saved&published=true&includes=widget,layer,metadata,vocabulary&page[size]=${pageSize || 999}&page[number]=${pageNumber || 1}&sort=-updatedAt`))
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((response) => {
        // TODO: We should check which app do we want here
        // Filtering datasets that have widget or layer
        // and only belong to RW app
        const datasets = response.data;
        console.log('datasets', datasets);
        dispatch({
          type: GET_DATASETS_SUCCESS,
          payload: datasets
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_DATASETS_ERROR,
          payload: err.message
        });
      });
  };
}

export function setDatasetsPage(page) {
  return (dispatch) => {
    dispatch({
      type: SET_DATASETS_PAGE,
      payload: page
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

/**
 * Add or remove a layer group from the map and legend
 * @export
 * @param {string} dataset - ID of the dataset
 * @param {boolean} addLayer - Whether to add the group or remove it
 */
export function toggleLayerGroup(dataset, addLayer) {
  return (dispatch) => {
    dispatch({
      type: SET_LAYERGROUP_TOGGLE,
      payload: { dataset, [addLayer ? 'add' : 'remove']: true }
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

/**
 * Show or hide a layer group on the map
 * @export
 * @param {string} dataset - ID of the dataset
 * @param {boolean} visible - Whether to show the group or hide it
 */
export function toggleLayerGroupVisibility(dataset, visible) {
  return (dispatch) => {
    dispatch({
      type: SET_LAYERGROUP_VISIBILITY,
      payload: { dataset, visible }
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

/**
 * Set which of the layer group's layers is the active one
 * (the one to be displayed)
 * @export
 * @param {string} dataset - ID of the dataset
 * @param {string} layer - ID of the layer
 */
export function setLayerGroupActiveLayer(dataset, layer) {
  return (dispatch) => {
    dispatch({
      type: SET_LAYERGROUP_ACTIVE_LAYER,
      payload: { dataset, layer }
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

/**
 * Change the order of the layer groups according to the
 * order of the dataset IDs
 * @export
 * @param {string[]} datasets - List of dataset IDs
 */
export function setLayerGroupsOrder(datasets) {
  return (dispatch) => {
    dispatch({
      type: SET_LAYERGROUP_ORDER,
      payload: datasets
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

/**
 * Set which of the layer group's layers is the active one
 * (the one to be displayed)
 * @export
 * @param {string} dataset - ID of the dataset
 * @param {number} opacity - opacity
 */
export function setLayerGroupOpacity(dataset, opacity, updateUrl = false) {
  return (dispatch) => {
    dispatch({
      type: SET_LAYERGROUP_OPACITY,
      payload: { dataset, opacity }
    });

    // We also update the URL
    if (typeof window !== 'undefined' && updateUrl) dispatch(setUrlParams());
  };
}

/**
 * Set the layer attribute of the store
 * This method is used when the layer groups are retrieved
 * from the URL to restore the state
 * @export
 * @param {LayerGroup[]} layerGroups
 */
export function setLayerGroups(layerGroups) {
  return (dispatch) => {
    dispatch({
      type: SET_LAYERGROUPS,
      payload: layerGroups
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

export function setSidebar(options) {
  return {
    type: SET_SIDEBAR,
    payload: options
  };
}

export function setDatasetsSearchFilter(search) {
  return (dispatch) => {
    dispatch({
      type: SET_DATASETS_SEARCH_FILTER,
      payload: search
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

export function setDatasetsTagFilter(filter, tag) {
  return {
    type: SET_DATASET_FILTER,
    payload: {
      filter,
      tag
    }
  };
}

export function setDatasetsFilteredByConcepts(datasetList) {
  return (dispatch) => {
    dispatch({
      type: SET_DATASETS_FILTERED_BY_CONCEPTS,
      payload: datasetList
    });
  };
}

export function setFiltersLoading(loading) {
  return {
    type: SET_FILTERS_LOADING,
    payload: loading
  };
}

export function setDatasetsMode(mode) {
  return {
    type: SET_DATASETS_MODE,
    payload: mode
  };
}

/**
 * Set the sorting order of the datasets
 * @param {'modified'|'viewed'|'favourited'} sorting
 */
export function setDatasetsSorting(sorting) {
  return (dispatch) => {
    const graphService = new GraphService({ apiURL: process.env.WRI_API_URL });

    let promise = null;
    switch (sorting) {
      case 'viewed':
        promise = graphService.getMostViewedDatasets();
        break;

      case 'favourited':
        promise = graphService.getMostFavoritedDatasets();
        break;

      default:
        break;
    }

    if (!promise) {
      dispatch({ type: SET_SORTING_ORDER, payload: sorting });
      dispatch({ type: SET_SORTING_DATASETS, payload: [] });
    } else {
      dispatch({ type: SET_SORTING_LOADING, payload: true });
      dispatch({ type: SET_SORTING_ORDER, payload: sorting });

      promise
        .then(datasets => dispatch({ type: SET_SORTING_DATASETS, payload: datasets }))
        .catch((err) => {
          toastr.error('Dataset sorting', 'The datasets couldn\'t be sorted properly');
          console.error(err);
        })
        .then(() => dispatch({ type: SET_SORTING_LOADING, payload: false }));
    }

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

export function setTopicsTree(tree) {
  return {
    type: SET_TOPICS_TREE,
    payload: tree
  };
}

export function setDataTypeTree(tree) {
  return {
    type: SET_DATA_TYPE_TREE,
    payload: tree
  };
}

export function setGeographiesTree(tree) {
  return {
    type: SET_GEOGRAPHIES_TREE,
    payload: tree
  };
}

export function setBasemap(basemap) {
  return {
    type: SET_BASEMAP,
    payload: basemap
  };
}

export function setLabels(labelEnabled) {
  return {
    type: SET_LABELS,
    payload: labelEnabled
  };
}


export function setZoom(zoom, updateUrl = true) {
  return (dispatch) => {
    dispatch({ type: SET_ZOOM, payload: zoom });

    // We also update the URL
    if (updateUrl && typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

export function setLatLng(latLng, updateUrl = true) {
  return (dispatch) => {
    dispatch({ type: SET_LATLNG, payload: latLng });

    // We also update the URL
    if (updateUrl && typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

export function setDatasetsFilters(filters) {
  return (dispatch) => {
    dispatch({
      type: SET_DATASETS_FILTERS,
      payload: filters
    });

    // We also update the URL
    if (typeof window !== 'undefined') dispatch(setUrlParams());
  };
}

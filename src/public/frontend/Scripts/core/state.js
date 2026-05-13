// #region ===================== STATE =========================================
/** @type {string} Base URL for all local API calls */
const API_BASE = '/api';

let currentBucket = '';
let currentSubdir = '';
let currentFiles = [];  // now array of { _id, name } objects
let currentIndex = 0;
let csrfToken = '';
let isDirty = false;
let _iframeObserver = null;
let selectedFile = null;
// #endregion ------------------------------------------------------------------

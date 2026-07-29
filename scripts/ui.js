/**
 * 畫面與互動：DOM、訊息、分頁預覽、事件綁定
 */

import { downloadFile } from './utils.js';
import { processWorkbook } from './core.js';
import { readWorkbookFromFile, fetchWorkbookFromUrl } from './services.js';

const DEMO_GOOGLE_SHEET_URL =
    'https://docs.google.com/spreadsheets/d/1dOFyNqpjL5K7k-26K-C5wfArAruiYoXcyuXYCkTpbbc/edit?usp=sharing';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const urlInput = document.getElementById('url-input');
const fetchUrlBtn = document.getElementById('fetch-url-btn');
const loadDemoBtn = document.getElementById('load-demo-btn');
const resultsSection = document.getElementById('results-section');
const tabsContainer = document.getElementById('tabs-container');
const yamlPreview = document.getElementById('yaml-preview');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const downloadAllBtn = document.getElementById('download-all-btn');
const messageBox = document.getElementById('message-box');

let currentResults = [];
let activeTabIndex = 0;
let copyResetTimer = null;

function t(key) {
    return window.I18n ? window.I18n.t(key) : key;
}

function showMessage(msg, type = 'info') {
    messageBox.textContent = msg;
    messageBox.classList.remove(
        'hidden',
        'bg-blue-100', 'text-blue-700',
        'bg-red-100', 'text-red-700',
        'bg-green-100', 'text-green-700'
    );

    if (type === 'error') {
        messageBox.classList.add('bg-red-100', 'text-red-700');
    } else if (type === 'success') {
        messageBox.classList.add('bg-green-100', 'text-green-700');
        setTimeout(() => { messageBox.classList.add('hidden'); }, 3000);
    } else {
        messageBox.classList.add('bg-blue-100', 'text-blue-700');
    }
}

function selectTab(index) {
    activeTabIndex = index;
    const data = currentResults[index];
    yamlPreview.value = data.yamlStr;

    Array.from(tabsContainer.children).forEach((btn, i) => {
        if (i === index) {
            btn.className = 'text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal truncate bg-blue-100 text-blue-700 border border-blue-200 shadow-sm';
        } else {
            btn.className = 'text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal truncate text-slate-600 hover:bg-slate-200 border border-transparent';
        }
    });
}

function renderUI() {
    resultsSection.classList.remove('hidden');
    tabsContainer.innerHTML = '';

    if (currentResults.length > 1) {
        downloadAllBtn.classList.remove('hidden');
    } else {
        downloadAllBtn.classList.add('hidden');
    }

    currentResults.forEach((result, index) => {
        const btn = document.createElement('button');
        btn.className = `text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal truncate ${
            index === 0
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-200 border border-transparent'
        }`;
        btn.textContent = result.sheetName;
        btn.onclick = () => selectTab(index);
        tabsContainer.appendChild(btn);
    });

    selectTab(0);
}

function applyWorkbook(workbook, filename) {
    currentResults = processWorkbook(workbook, filename);
    if (currentResults.length > 0) {
        renderUI();
        return true;
    }
    showMessage(t('msg.noData'), 'error');
    return false;
}

function translateError(error) {
    const code = error && error.message;
    const key = code ? `msg.${code}` : '';
    const translated = key ? t(key) : '';
    if (translated && translated !== key) {
        return translated;
    }
    return t('msg.parseFailed');
}

async function handleFile(file) {
    showMessage(t('msg.processing'), 'info');
    try {
        const workbook = await readWorkbookFromFile(file);
        if (applyWorkbook(workbook, file.name)) {
            showMessage(t('msg.success'), 'success');
        }
    } catch (error) {
        console.error(error);
        showMessage(translateError(error), 'error');
    }
}

export function initUI() {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    async function loadFromUrl(url) {
        const trimmed = (url || '').trim();
        if (!trimmed) return showMessage(t('msg.invalidUrl'), 'error');

        showMessage(t('msg.downloading'), 'info');
        try {
            const { workbook, filename } = await fetchWorkbookFromUrl(trimmed);
            if (applyWorkbook(workbook, filename)) {
                showMessage(t('msg.parseSuccess'), 'success');
            }
        } catch (error) {
            console.error(error);
            showMessage(t('msg.fetchFailed'), 'error');
        }
    }

    fetchUrlBtn.addEventListener('click', () => {
        loadFromUrl(urlInput.value);
    });

    loadDemoBtn.addEventListener('click', () => {
        urlInput.value = DEMO_GOOGLE_SHEET_URL;
        loadFromUrl(DEMO_GOOGLE_SHEET_URL);
    });

    copyBtn.addEventListener('click', () => {
        if (!currentResults[activeTabIndex]) return;

        yamlPreview.select();
        document.execCommand('copy');

        if (copyResetTimer) clearTimeout(copyResetTimer);
        copyBtn.textContent = t('copy.done');
        copyBtn.classList.add('text-green-600', 'border-green-600');
        copyResetTimer = setTimeout(() => {
            copyBtn.textContent = t('copy');
            copyBtn.classList.remove('text-green-600', 'border-green-600');
            copyResetTimer = null;
        }, 2000);
    });

    downloadBtn.addEventListener('click', () => {
        if (!currentResults[activeTabIndex]) return;
        const data = currentResults[activeTabIndex];
        downloadFile(data.yamlStr, data.filename);
    });

    downloadAllBtn.addEventListener('click', () => {
        currentResults.forEach((data, i) => {
            setTimeout(() => {
                downloadFile(data.yamlStr, data.filename);
            }, i * 300);
        });
    });

    if (window.I18n) {
        window.I18n.onLanguageChange(() => {
            if (copyResetTimer) {
                clearTimeout(copyResetTimer);
                copyResetTimer = null;
                copyBtn.classList.remove('text-green-600', 'border-green-600');
            }
        });
    }
}

(function (root) {
  'use strict';
  const KEY = 'contador-questoes:v1';
  function valid(value) {
    return value && value.version === 1 && Array.isArray(value.history) &&
      value.history.every(item => typeof item === 'boolean');
  }
  function createCounter(storage) {
    let history = [];
    let saved = true;
    try {
      const raw = storage.getItem(KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (!valid(parsed)) throw new Error('Dados inválidos');
        history = parsed.history.slice();
      }
    } catch (_) { saved = false; }
    function snapshot() {
      const correct = history.reduce((sum, item) => sum + Number(item), 0);
      return { total: history.length, correct, incorrect: history.length - correct, saved };
    }
    function persist() {
      try {
        storage.setItem(KEY, JSON.stringify({ version: 1, history }));
        saved = true;
      } catch (_) { saved = false; }
      return snapshot();
    }
    return {
      snapshot,
      register(correct) {
        if (typeof correct !== 'boolean') throw new TypeError('Resultado inválido');
        history.push(correct);
        return persist();
      },
      undo() { if (history.length) { history.pop(); return persist(); } return snapshot(); },
      reset() { history = []; return persist(); }
    };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { createCounter, KEY };
  else root.QuestionCounter = { createCounter };
})(typeof globalThis === 'undefined' ? this : globalThis);

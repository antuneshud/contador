'use strict';
// Access to localStorage itself may fail in restricted browser environments.
let storage;
try { storage = window.localStorage; } catch (_) { storage = null; }
const counter = QuestionCounter.createCounter(storage);
const byId = id => document.getElementById(id);
const dialog = byId('reset-dialog');
const format = new Intl.NumberFormat('pt-BR');
function render(message) {
  const state = counter.snapshot();
  byId('total').textContent = format.format(state.total);
  byId('correct').textContent = format.format(state.correct);
  byId('incorrect').textContent = format.format(state.incorrect);
  byId('undo').disabled = byId('reset').disabled = state.total === 0;
  byId('storage-note').textContent = state.saved ? 'Seu progresso fica salvo neste aparelho.' :
    'Não foi possível recuperar ou salvar a contagem. Ao fechar, ela pode ser perdida.';
  if (message) byId('announcement').textContent = `${message} Total: ${state.total}. Certas: ${state.correct}. Erradas: ${state.incorrect}.`;
}
function register(correct) { counter.register(correct); render(correct ? 'Certa registrada.' : 'Errada registrada.'); }
function undo() { if (!counter.snapshot().total) return; counter.undo(); render('Último registro desfeito.'); }
byId('add-correct').addEventListener('click', () => register(true));
byId('add-incorrect').addEventListener('click', () => register(false));
byId('undo').addEventListener('click', undo);
byId('reset').addEventListener('click', () => { dialog.returnValue = ''; dialog.showModal(); });
dialog.addEventListener('close', () => {
  if (dialog.returnValue === 'reset') { counter.reset(); render('Contagem zerada.'); byId('add-correct').focus(); }
});
document.addEventListener('keydown', event => {
  if (dialog.open || event.repeat || event.isComposing || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable) return;
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && key === 'z') { event.preventDefault(); undo(); }
  else if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
    if (key === 'c') { event.preventDefault(); register(true); }
    if (key === 'e') { event.preventDefault(); register(false); }
  }
});
render();
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('./sw.js').then(async registration => {
    await navigator.serviceWorker.ready;
    byId('offline-note').textContent = 'Pronto para usar também sem internet.';
  }).catch(() => {
    byId('offline-note').textContent = 'Modo offline indisponível. Você pode continuar usando online.';
  });
}

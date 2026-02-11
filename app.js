class Parser {
  constructor() {
    this.metadataPrefixes = [
      'Конфигурация.', 'ОбщийМодуль.', 'Документ.', 'Справочник.', 'Обработка.', 'Отчет.',
      'ВнешняяОбработка.', 'ВнешнийОтчет.', 'РегистрСведений.', 'РегистрНакопления.',
      'РегистрБухгалтерии.', 'РегистрРасчета.', 'Подсистема.', 'Команда.', 'Роль.',
      'ПланВидовХарактеристик.', 'ПланСчетов.', 'ПланВидовРасчета.', 'ПланОбмена.',
      'Перечисление.', 'Константа.'
    ];
    const escaped = this.metadataPrefixes.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    this.pathRegex = new RegExp(`(${escaped.join('|')})[\\wА-Яа-яЁё]+(?:\\.[\\wА-Яа-яЁё]+)*`);
    this.serviceLineRegex = /(условные обозначения|объект присутствует только|сравнение конфигураций|легенда|обозначения)/i;
    this.referenceRegex = /(справочн|help|описани|подсказк|комментар)/i;
  }

  parse(txt) {
    const lines = txt.replace(/\r/g, '').split('\n');
    const objects = [];
    let current = null;

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      const header = this.extractObjectHeader(line);
      if (header) {
        if (current) {
          this.finishObject(current);
          objects.push(current);
        }
        current = {
          id: `obj_${objects.length + 1}`,
          path: header.path,
          section: header.section,
          metadataType: header.metadataType,
          objectName: header.objectName,
          changeType: header.changeType,
          rawLines: [],
          diffs: [],
          objectComment: '',
          risk: 'Низкий',
          strategy: 'можно принять',
          isReferenceOnly: false
        };
        continue;
      }
      if (current && !this.serviceLineRegex.test(line)) {
        current.rawLines.push(line);
      }
    }

    if (current) {
      this.finishObject(current);
      objects.push(current);
    }

    return objects;
  }

  extractObjectHeader(line) {
    const cleanLine = (line || '').trim();
    const pathMatch = cleanLine.match(this.pathRegex);
    if (!pathMatch) return null;

    const marker = cleanLine.includes('-->')
      ? 'Только в основной'
      : (cleanLine.includes('<---') || cleanLine.includes('<--'))
        ? 'Только в файле'
        : cleanLine.includes('***')
          ? 'Изменён'
          : null;

    if (!marker) return null;

    const path = pathMatch[0];
    const [metadataType, objectName = ''] = path.split('.', 2);
    return { path, section: this.mapSection(metadataType), metadataType, objectName, changeType: marker };
  }

  mapSection(metadataType) {
    const map = {
      Документ: 'Документы', Справочник: 'Справочники', ОбщийМодуль: 'Общие модули', Конфигурация: 'Конфигурация',
      Обработка: 'Обработки', Отчет: 'Отчеты', ВнешняяОбработка: 'Внешние обработки', ВнешнийОтчет: 'Внешние отчеты',
      РегистрСведений: 'Регистры сведений', РегистрНакопления: 'Регистры накопления', РегистрБухгалтерии: 'Регистры бухгалтерии',
      РегистрРасчета: 'Регистры расчета', Подсистема: 'Подсистемы', Команда: 'Команды', Роль: 'Роли',
      ПланВидовХарактеристик: 'Планы видов характеристик', ПланСчетов: 'Планы счетов', ПланВидовРасчета: 'Планы видов расчета',
      ПланОбмена: 'Планы обмена', Перечисление: 'Перечисления', Константа: 'Константы'
    };
    return map[metadataType] || metadataType;
  }

  finishObject(object) {
    this.collectDiffs(object);
    this.assignRiskAndStrategy(object);
    object.isReferenceOnly = object.diffs.length > 0 && object.diffs.every((d) => this.isReferenceDiff(d));
    delete object.rawLines;
  }

  collectDiffs(object) {
    const diffs = [];
    let before = [];
    let after = [];
    let contextStack = [];
    let currentModule = '';
    let currentRoutine = '';
    let currentBlockLabel = '';

    const flush = () => {
      if (!before.length && !after.length) return;
      const context = contextStack.join(' / ');
      const kind = currentModule || this.looksLikeCode(before, after) ? 'code' : 'metadata';
      diffs.push({
        id: `${object.id}_d${diffs.length + 1}`,
        kind,
        context: context || (kind === 'code' ? 'Код' : 'Свойства'),
        module: currentModule,
        routine: currentRoutine || 'Вне функции/процедуры',
        blockLabel: currentBlockLabel,
        before: before.join('\n').trim(),
        after: after.join('\n').trim(),
        comment: '',
        lineCount: before.length + after.length
      });
      before = [];
      after = [];
    };

    for (const lineRaw of object.rawLines) {
      const line = lineRaw.trim();
      if (!line) {
        flush();
        continue;
      }

      const changeBlockMatch = line.match(/^Изменено:\s*\d+\s*-\s*\d+/i);
      if (changeBlockMatch) {
        flush();
        currentBlockLabel = changeBlockMatch[0];
        continue;
      }

      if (this.serviceLineRegex.test(line)) continue;

      if (/\bМодуль\b/i.test(line)) {
        flush();
        currentModule = line;
        contextStack = ['Код'];
        continue;
      }

      const contextMatch = line.match(/(Реквизиты|Табличные части|Формы|Команды|Макеты|Свойства|Права|Параметры)/i);
      if (contextMatch) {
        flush();
        currentModule = '';
        contextStack = [contextMatch[1]];
        continue;
      }

      if (/^[-*•]/.test(line) && !/^[-*•]\s*[<>]/.test(line)) {
        const cleaned = line.replace(/^[-*•]+\s*/, '');
        if (cleaned) {
          flush();
          contextStack = [...contextStack.slice(0, 1), cleaned];
          continue;
        }
      }

      const routineProbe = line.replace(/^[<>]+\s?/, '').replace(/^"|"$/g, '');
      const routineStart = routineProbe.match(/^\s*(Процедура|Функция)\s+([\wА-Яа-яЁё]+)/i);
      if (routineStart) currentRoutine = `${routineStart[1]} ${routineStart[2]}`;
      if (/^\s*Конец(Процедуры|Функции)/i.test(routineProbe)) currentRoutine = '';

      if (line.startsWith('<')) {
        before.push(this.cleanDiffPayload(line.replace(/^<+\s?/, '')));
      } else if (line.startsWith('>')) {
        after.push(this.cleanDiffPayload(line.replace(/^>+\s?/, '')));
      } else if (line.startsWith('"') && (object.changeType === 'Только в основной' || object.changeType === 'Только в файле')) {
        const text = this.cleanDiffPayload(line);
        if (object.changeType === 'Только в основной') before.push(text);
        else after.push(text);
      } else {
        flush();
      }
    }
    flush();
    object.diffs = diffs;
  }

  cleanDiffPayload(value) {
    return (value || '')
      .replace(/^"|"$/g, '')
      .replace(/\\n/g, '\n')
      .replace(/·/g, ' ')
      .trim();
  }


  looksLikeCode(before, after) {
    return [...before, ...after].some((line) => /(Если|Тогда|КонецЕсли|Процедура|Функция|Возврат|Запрос|Для|Пока|Попытка)/i.test(line));
  }

  isReferenceDiff(diff) {
    return this.referenceRegex.test(`${diff.context} ${diff.before} ${diff.after}`);
  }

  assignRiskAndStrategy(object) {
    const total = object.diffs.reduce((sum, d) => sum + d.lineCount, 0);
    const corpus = `${object.path} ${object.diffs.map((d) => `${d.context} ${d.before} ${d.after}`).join(' ')}`;
    const hasRights = /\b(разрешено|запрещено|права|роль)\b/i.test(corpus) || object.metadataType === 'Роль';

    if (object.changeType === 'Только в основной') {
      object.risk = 'Высокий';
      object.strategy = 'вручную';
      return;
    }
    if (hasRights || total >= 80) object.risk = 'Высокий';
    else if (total >= 20) object.risk = 'Средний';
    else object.risk = 'Низкий';

    object.strategy = object.risk === 'Высокий' ? 'вручную' : object.risk === 'Средний' ? 'выборочно' : 'можно принять';
  }
}

class SessionStore {
  constructor(key = 'mergeReportSession') {
    this.key = key;
    this.fallbackKey = `${key}:fallbackComments`;
  }

  save(state) {
    const payload = JSON.stringify(state);
    try {
      localStorage.setItem(this.key, payload);
      localStorage.removeItem(this.fallbackKey);
      return { mode: 'full' };
    } catch (error) {
      if (!isQuotaExceededError(error)) throw error;
      const fallback = this.buildFallbackState(state);
      try {
        localStorage.setItem(this.fallbackKey, JSON.stringify(fallback));
        localStorage.removeItem(this.key);
        return { mode: 'fallback' };
      } catch {
        return { mode: 'none' };
      }
    }
  }

  load() {
    const raw = localStorage.getItem(this.key);
    if (raw) {
      try { return { mode: 'full', state: JSON.parse(raw) }; } catch { /* ignore */ }
    }

    const fallbackRaw = localStorage.getItem(this.fallbackKey);
    if (!fallbackRaw) return null;
    try {
      return { mode: 'fallback', state: JSON.parse(fallbackRaw) };
    } catch {
      return null;
    }
  }

  buildFallbackState(state) {
    return {
      version: 1,
      activeTab: state.activeTab,
      selectedId: state.selectedId,
      comments: (state.objects || []).map((obj) => ({
        path: obj.path,
        objectComment: obj.objectComment || '',
        diffComments: (obj.diffs || []).map((diff) => ({ id: diff.id, comment: diff.comment || '' })).filter((d) => d.comment)
      })).filter((obj) => obj.objectComment || obj.diffComments.length)
    };
  }

  download(state) {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json;charset=utf-8' });
    this.downloadBlob(blob, `merge-session-${Date.now()}.json`);
  }

  downloadBlob(blob, fileName) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

class ObjectCard {
  constructor(root, onCommentChange) {
    this.root = root;
    this.onCommentChange = onCommentChange;
    this.activeInnerTab = 'meta';
  }

  render(object) {
    if (!object) {
      this.root.className = 'card empty';
      this.root.textContent = 'Выберите объект в дереве.';
      return;
    }

    this.root.className = 'card';

    if (!['meta', 'code'].includes(this.activeInnerTab)) {
      this.activeInnerTab = 'meta';
    }

    const metadataDiffs = object.diffs.filter((d) => d.kind === 'metadata');
    const codeDiffs = object.diffs.filter((d) => d.kind === 'code');
    const metaRows = metadataDiffs.map((d) => {
      const parts = d.context.split('/').map((x) => x.trim()).filter(Boolean);
      const group = parts[0] || 'Свойства';
      const item = parts[1] || object.objectName;
      const property = parts.slice(2).join(' / ') || 'Значение';
      const cellDiff = renderInlineDiff(d.before || '-', d.after || '-');
      return `
      <tr>
        <td>${escapeHtml(group)}</td>
        <td>${escapeHtml(item)}</td>
        <td>${escapeHtml(property)}</td>
        <td class="old-value">${cellDiff.beforeHtml}</td>
        <td class="new-value">${cellDiff.afterHtml}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="5">Нет блоков метаданных</td></tr>';

    const codeBlocks = codeDiffs.map((d) => {
      const codeDiff = renderInlineDiff(d.before || '', d.after || '');
      return `
      <details class="code-hunk-wrap">
        <summary class="code-hunk-head" role="button">
          <strong>${escapeHtml(d.module || 'Модуль не определён')}</strong>
          <small>${escapeHtml(d.routine || 'Вне функции/процедуры')}</small>
          <small>${escapeHtml(d.blockLabel || 'Блок кода')}</small>
        </summary>
        <div class="code-hunk">
          <div class="diff-pane diff-before">
            <div class="pane-title">Было</div>
            <pre>${codeDiff.beforeHtml}</pre>
          </div>
          <div class="diff-pane diff-after">
            <div class="pane-title">Стало</div>
            <pre>${codeDiff.afterHtml}</pre>
          </div>
        </div>
        <div class="comment-box module-note">
          <label><strong>Заметка к модулю</strong>${d.blockLabel ? ` · ${escapeHtml(d.blockLabel)}` : ''}</label>
          <textarea data-diff-id="${d.id}" data-comment-type="diff" placeholder="Комментарий по этому блоку кода">${escapeHtml(d.comment || '')}</textarea>
        </div>
      </details>
    `;
    }).join('') || '<p>Нет блоков кода</p>';

    this.root.innerHTML = `
      <div class="card-header">
        <div>
          <h2>${escapeHtml(object.path)}</h2>
          <p>${escapeHtml(object.changeType)} · Риск: <span class="risk-pill risk-${object.risk}">${object.risk}</span> · Стратегия: ${object.strategy}</p>
        </div>
      </div>

      <div class="comment-box object-note">
        <label><strong>Заметка к объекту</strong></label>
        <textarea data-comment-type="object" placeholder="Общий комментарий к объекту">${escapeHtml(object.objectComment || '')}</textarea>
      </div>

      <div class="inner-tabs">
        <button class="inner-tab ${this.activeInnerTab === 'meta' ? 'active' : ''}" data-inner-tab="meta">Свойства метаданных</button>
        <button class="inner-tab ${this.activeInnerTab === 'code' ? 'active' : ''}" data-inner-tab="code">Код (блоки)</button>
      </div>

      <section class="inner-panel ${this.activeInnerTab === 'meta' ? 'active' : ''}" data-panel="meta">
        <table class="meta-table">
          <thead><tr><th>Раздел</th><th>Элемент</th><th>Свойство</th><th>Старое значение</th><th>Новое значение</th></tr></thead>
          <tbody>${metaRows}</tbody>
        </table>
      </section>

      <section class="inner-panel ${this.activeInnerTab === 'code' ? 'active' : ''}" data-panel="code">
        ${codeBlocks}
      </section>
    `;

    this.root.querySelectorAll('.inner-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeInnerTab = btn.dataset.innerTab;
        this.render(object);
      });
    });

    this.root.querySelectorAll('textarea').forEach((area) => {
      area.addEventListener('input', () => {
        this.onCommentChange({
          type: area.dataset.commentType,
          diffId: area.dataset.diffId,
          value: area.value
        });
      });
    });
  }
}


class App {
  constructor() {
    this.parser = new Parser();
    this.store = new SessionStore();
    this.objects = [];
    this.activeTab = 'main';
    this.selectedId = '';
    this.sidebarOpen = false;
    this.pendingComments = [];

    this.el = {
      txtInput: document.getElementById('txtInput'),
      sessionInput: document.getElementById('sessionInput'),
      tree: document.getElementById('tree'),
      card: document.getElementById('card'),
      tabs: [...document.querySelectorAll('.tab')],
      search: document.getElementById('searchInput'),
      sectionFilter: document.getElementById('sectionFilter'),
      riskFilter: document.getElementById('riskFilter'),
      saveSessionBtn: document.getElementById('saveSessionBtn'),
      exportMainCsv: document.getElementById('exportMainCsv'),
      exportRefCsv: document.getElementById('exportRefCsv'),
      menuButton: document.getElementById('menuButton'),
      sidebar: document.getElementById('sidebar')
    };

    this.card = new ObjectCard(this.el.card, (payload) => this.updateComment(payload));
    this.bind();
    this.restoreFromCache();
  }

  bind() {
    this.el.txtInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      this.objects = this.parser.parse(text);
      this.selectedId = this.objects[0]?.id || '';
      this.applyPendingComments();
      this.persist();
      this.render();
    });

    this.el.sessionInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const state = JSON.parse(await file.text());
      this.applyState(state);
      this.pendingComments = [];
      this.persist();
      this.render();
    });

    this.el.tabs.forEach((tab) => tab.addEventListener('click', () => {
      this.activeTab = tab.dataset.tab;
      this.el.tabs.forEach((t) => t.classList.toggle('active', t === tab));
      this.selectedId = this.filteredObjects()[0]?.id || '';
      this.render();
    }));

    ['input', 'change'].forEach((evt) => {
      this.el.search.addEventListener(evt, () => this.render());
      this.el.sectionFilter.addEventListener(evt, () => this.render());
      this.el.riskFilter.addEventListener(evt, () => this.render());
    });

    this.el.saveSessionBtn.addEventListener('click', () => this.store.download(this.state()));
    this.el.exportMainCsv.addEventListener('click', () => this.exportCsv('main'));
    this.el.exportRefCsv.addEventListener('click', () => this.exportCsv('ref'));

    this.el.menuButton.addEventListener('click', () => {
      this.sidebarOpen = !this.sidebarOpen;
      this.el.sidebar.classList.toggle('open', this.sidebarOpen);
    });
  }

  filteredObjects() {
    const search = this.el.search.value.toLowerCase().trim();
    const section = this.el.sectionFilter.value;
    const risk = this.el.riskFilter.value;

    return this.objects.filter((obj) => {
      if (this.activeTab === 'main' && obj.isReferenceOnly) return false;
      if (this.activeTab === 'ref' && !obj.isReferenceOnly) return false;
      if (section && obj.section !== section) return false;
      if (risk && obj.risk !== risk) return false;
      if (!search) return true;

      const haystack = [
        obj.path, obj.section, obj.objectComment,
        ...obj.diffs.map((d) => `${d.context} ${d.module} ${d.routine} ${d.before} ${d.after} ${d.comment}`)
      ].join(' ').toLowerCase();
      return haystack.includes(search);
    });
  }

  render() {
    const list = this.filteredObjects();
    if (!list.some((x) => x.id === this.selectedId)) this.selectedId = list[0]?.id || '';
    this.renderSectionFilter();
    this.renderTree(list);
    this.card.render(this.objects.find((obj) => obj.id === this.selectedId));
  }

  renderSectionFilter() {
    const current = this.el.sectionFilter.value;
    const set = new Set(this.filteredObjects().map((o) => o.section));
    this.el.sectionFilter.innerHTML = '<option value="">Все разделы</option>' + [...set].sort().map((s) => `<option ${s === current ? 'selected' : ''} value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  }

  renderTree(list) {
    const grouped = new Map();
    list.forEach((obj) => {
      if (!grouped.has(obj.section)) grouped.set(obj.section, new Map());
      const byType = grouped.get(obj.section);
      if (!byType.has(obj.metadataType)) byType.set(obj.metadataType, []);
      byType.get(obj.metadataType).push(obj);
    });

    this.el.tree.innerHTML = '';
    for (const [section, typeMap] of grouped.entries()) {
      const sec = document.createElement('div');
      sec.className = 'section-group';
      sec.innerHTML = `<button class="section-title" type="button">${escapeHtml(section)}</button>`;

      for (const [type, objects] of typeMap.entries()) {
        const typeEl = document.createElement('div');
        typeEl.className = 'type-group';
        typeEl.innerHTML = `<div class="type-title">${escapeHtml(type)}</div>`;

        objects.forEach((obj) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `object-item ${obj.id === this.selectedId ? 'active' : ''}`;
          btn.innerHTML = `${escapeHtml(obj.path)} <span class="risk-pill risk-${obj.risk}">${obj.risk}</span>`;
          btn.addEventListener('click', () => {
            this.selectedId = obj.id;
            this.sidebarOpen = false;
            this.el.sidebar.classList.remove('open');
            this.render();
          });
          typeEl.appendChild(btn);
        });
        sec.appendChild(typeEl);
      }
      this.el.tree.appendChild(sec);
    }
  }

  updateComment({ type, diffId, value }) {
    const obj = this.objects.find((o) => o.id === this.selectedId);
    if (!obj) return;
    if (type === 'object') obj.objectComment = value;
    if (type === 'diff') {
      const diff = obj.diffs.find((d) => d.id === diffId);
      if (diff) diff.comment = value;
    }
    this.persist();
  }

  exportCsv(tab) {
    const rows = [];
    const target = this.objects.filter((obj) => (tab === 'main' ? !obj.isReferenceOnly : obj.isReferenceOnly));

    rows.push(['Объект', 'Риск', 'Стратегия', 'Контекст', 'Модуль', 'Процедура/Функция', 'Было', 'Стало', 'Комментарий объекта', 'Комментарий отличия']);
    target.forEach((obj) => {
      obj.diffs.forEach((d) => {
        rows.push([
          obj.path, obj.risk, obj.strategy, d.context, d.module, d.routine, d.before, d.after, obj.objectComment || '', d.comment || ''
        ]);
      });
    });

    const csv = rows.map((r) => r.map(csvCell).join(';')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    this.store.downloadBlob(blob, `merge-${tab}-${Date.now()}.csv`);
  }

  state() {
    return { objects: this.objects, activeTab: this.activeTab, selectedId: this.selectedId };
  }

  applyState(state) {
    this.objects = state.objects || [];
    this.activeTab = state.activeTab || 'main';
    this.selectedId = state.selectedId || this.objects[0]?.id || '';
    this.el.tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === this.activeTab));
  }

  applyPendingComments() {
    if (!this.pendingComments.length) return;
    const byPath = new Map(this.pendingComments.map((entry) => [entry.path, entry]));
    this.objects.forEach((obj) => {
      const cached = byPath.get(obj.path);
      if (!cached) return;
      if (cached.objectComment) obj.objectComment = cached.objectComment;
      const diffMap = new Map((cached.diffComments || []).map((d) => [d.id, d.comment]));
      obj.diffs.forEach((diff) => {
        if (diffMap.has(diff.id)) diff.comment = diffMap.get(diff.id);
      });
    });
    this.pendingComments = [];
  }

  restoreFromCache() {
    const cached = this.store.load();
    if (!cached) return;

    if (cached.mode === 'full') {
      this.applyState(cached.state);
      this.render();
      return;
    }

    this.activeTab = cached.state.activeTab || 'main';
    this.selectedId = cached.state.selectedId || '';
    this.pendingComments = cached.state.comments || [];
    this.el.tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === this.activeTab));
    this.render();
  }

  persist() {
    try {
      const result = this.store.save(this.state());
      if (result?.mode === 'fallback') {
        console.warn('Локальный кэш переполнен: сохранены только комментарии. Для полного восстановления используйте «Сохранить сессию».');
      }
    } catch (error) {
      console.error('Не удалось сохранить локальный кэш сессии', error);
    }
  }
}

function isQuotaExceededError(error) {
  return error && (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014);
}

function csvCell(value) {
  const text = (value ?? '').toString();
  return `"${text.replace(/"/g, '""')}"`;
}

function escapeHtml(value) {
  return (value ?? '').toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInlineDiff(beforeText, afterText) {
  const beforeLines = (beforeText || '').split('\n');
  const afterLines = (afterText || '').split('\n');
  const maxLines = Math.max(beforeLines.length, afterLines.length);
  const beforeRendered = [];
  const afterRendered = [];

  for (let i = 0; i < maxLines; i += 1) {
    const left = beforeLines[i] ?? '';
    const right = afterLines[i] ?? '';
    const pair = highlightLineDifference(left, right);
    beforeRendered.push(pair.beforeHtml);
    afterRendered.push(pair.afterHtml);
  }

  return {
    beforeHtml: beforeRendered.join('\n'),
    afterHtml: afterRendered.join('\n')
  };
}

function highlightLineDifference(beforeLine, afterLine) {
  if (beforeLine === afterLine) {
    const safe = escapeHtml(beforeLine);
    return { beforeHtml: safe, afterHtml: safe };
  }

  if (!beforeLine) {
    return {
      beforeHtml: '',
      afterHtml: `<span class="diff-added">${escapeHtml(afterLine)}</span>`
    };
  }

  if (!afterLine) {
    return {
      beforeHtml: `<span class="diff-removed">${escapeHtml(beforeLine)}</span>`,
      afterHtml: ''
    };
  }

  let prefixLen = 0;
  const prefixLimit = Math.min(beforeLine.length, afterLine.length);
  while (prefixLen < prefixLimit && beforeLine[prefixLen] === afterLine[prefixLen]) {
    prefixLen += 1;
  }

  let suffixLen = 0;
  const beforeRest = beforeLine.length - prefixLen;
  const afterRest = afterLine.length - prefixLen;
  const suffixLimit = Math.min(beforeRest, afterRest);
  while (
    suffixLen < suffixLimit
    && beforeLine[beforeLine.length - 1 - suffixLen] === afterLine[afterLine.length - 1 - suffixLen]
  ) {
    suffixLen += 1;
  }

  const beforePrefix = beforeLine.slice(0, prefixLen);
  const afterPrefix = afterLine.slice(0, prefixLen);
  const beforeMiddle = beforeLine.slice(prefixLen, beforeLine.length - suffixLen || undefined);
  const afterMiddle = afterLine.slice(prefixLen, afterLine.length - suffixLen || undefined);
  const beforeSuffix = suffixLen ? beforeLine.slice(beforeLine.length - suffixLen) : '';
  const afterSuffix = suffixLen ? afterLine.slice(afterLine.length - suffixLen) : '';

  return {
    beforeHtml: `${escapeHtml(beforePrefix)}${beforeMiddle ? `<span class="diff-removed">${escapeHtml(beforeMiddle)}</span>` : ''}${escapeHtml(beforeSuffix)}`,
    afterHtml: `${escapeHtml(afterPrefix)}${afterMiddle ? `<span class="diff-added">${escapeHtml(afterMiddle)}</span>` : ''}${escapeHtml(afterSuffix)}`
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => new App());
}

if (typeof module !== 'undefined') {
  module.exports = { Parser, SessionStore };
}

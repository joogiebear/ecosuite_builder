import { useEffect, useMemo, useState } from 'react';
import {
  MENU_PRESETS,
  applyFill,
  buildSlotMap,
  createMenuPresetSlot,
  getBorderCells,
  getColumnCells,
  getMenuSlotFromMap,
  getPageCells,
  getRowCells,
  removeMenuSlot,
  sanitizeMenuSlots,
  stripMinecraftFormatting,
  upsertMenuSlot,
} from '../lib/menuSlots.js';
import { clampNumber } from '../lib/util.js';
import EffectsEditor from './EffectsEditor.jsx';
import FieldShell from './FieldShell.jsx';

export default function EcoMenusDesigner({ values, setValues }) {
  const rowCount = clampNumber(values.rows, 1, 6, 6);
  const pageCount = clampNumber(values.pageCount, 1, 9, 1);

  const slots = useMemo(
    () => sanitizeMenuSlots(values.slots, rowCount, pageCount),
    [values.slots, rowCount, pageCount],
  );

  const slotMap = useMemo(() => buildSlotMap(slots), [slots]);

  const [selectedPage, setSelectedPage] = useState(1);
  const [selectedCell, setSelectedCell] = useState({ row: 1, column: 1 });
  const [fillItem, setFillItem] = useState('');
  const [fillResult, setFillResult] = useState('');

  useEffect(() => {
    if (selectedPage > pageCount) {
      setSelectedPage(pageCount);
    }
  }, [selectedPage, pageCount]);

  useEffect(() => {
    if (selectedCell.row > rowCount) {
      setSelectedCell((current) => ({ ...current, row: rowCount }));
    }
  }, [rowCount, selectedCell.row]);

  useEffect(() => {
    setFillResult('');
  }, [selectedPage, selectedCell]);

  function updateValue(key, nextValue) {
    setValues((current) => ({
      ...current,
      [key]: nextValue,
    }));
  }

  function updateRows(nextValue) {
    const nextRows = clampNumber(nextValue, 1, 6, rowCount);

    setValues((current) => ({
      ...current,
      rows: nextRows,
      slots: sanitizeMenuSlots(
        (current.slots ?? []).filter((slot) => Number(slot.row || 1) <= nextRows),
        nextRows,
        clampNumber(current.pageCount, 1, 9, 1),
      ),
    }));
  }

  function updatePageCount(nextValue) {
    const nextPageCount = clampNumber(nextValue, 1, 9, pageCount);

    setValues((current) => ({
      ...current,
      pageCount: nextPageCount,
      slots: sanitizeMenuSlots(
        (current.slots ?? []).filter((slot) => Number(slot.page || 1) <= nextPageCount),
        clampNumber(current.rows, 1, 6, 6),
        nextPageCount,
      ),
    }));
  }

  function commitSlots(nextSlots) {
    setValues((current) => ({
      ...current,
      slots: sanitizeMenuSlots(nextSlots, rowCount, pageCount),
    }));
  }

  function applyPreset(presetId) {
    const nextSlot = createMenuPresetSlot(
      presetId,
      selectedCell.row,
      selectedCell.column,
      selectedPage,
    );

    commitSlots(upsertMenuSlot(slots, nextSlot, rowCount, pageCount));
  }

  function updateSelectedSlot(key, nextValue) {
    const currentSlot =
      getMenuSlotFromMap(slotMap, selectedCell.row, selectedCell.column, selectedPage) ??
      createMenuPresetSlot('blank', selectedCell.row, selectedCell.column, selectedPage);

    commitSlots(
      upsertMenuSlot(
        slots,
        {
          ...currentSlot,
          [key]: nextValue,
        },
        rowCount,
        pageCount,
      ),
    );
  }

  function deleteSelectedSlot() {
    commitSlots(
      removeMenuSlot(slots, selectedCell.row, selectedCell.column, selectedPage, rowCount, pageCount),
    );
  }

  function handleFill(cells) {
    const trimmed = fillItem.trim();
    if (!trimmed) return;
    const next = applyFill(slots, cells, selectedPage, trimmed, rowCount, pageCount);
    const filled = next.length - slots.length;
    commitSlots(next);
    setFillResult(filled === 0 ? 'No empty cells to fill' : `Filled ${filled} cell${filled === 1 ? '' : 's'}`);
  }

  const selectedSlot = getMenuSlotFromMap(slotMap, selectedCell.row, selectedCell.column, selectedPage);
  const activeActionType = selectedSlot?.clickActionType ?? 'none';

  const slotsOnPage = useMemo(() => {
    let count = 0;
    for (const slot of slots) {
      if (Number(slot.page || 1) === selectedPage) count += 1;
    }
    return count;
  }, [slots, selectedPage]);

  return (
    <div className="workspace-sections">
      <section className="workspace-section">
        <div className="section-heading compact-heading">
          <h3>Menu Shell</h3>
        </div>
        <div className="field-grid">
          <FieldShell field={{ label: 'Menu ID', width: 'half' }}>
            <input value={values.id ?? ''} onChange={(event) => updateValue('id', event.target.value)} />
          </FieldShell>
          <FieldShell field={{ label: 'Title', width: 'half' }}>
            <input value={values.title ?? ''} onChange={(event) => updateValue('title', event.target.value)} />
          </FieldShell>
          <FieldShell field={{ label: 'Command', width: 'half' }}>
            <input value={values.command ?? ''} onChange={(event) => updateValue('command', event.target.value)} />
          </FieldShell>
          <FieldShell field={{ label: 'Rows', width: 'half' }}>
            <input type="number" min="1" max="6" value={rowCount} onChange={(event) => updateRows(event.target.value)} />
          </FieldShell>
          <FieldShell field={{ label: 'Page count', width: 'half' }}>
            <input type="number" min="1" max="9" value={pageCount} onChange={(event) => updatePageCount(event.target.value)} />
          </FieldShell>
          <FieldShell field={{ label: 'Cannot-open messages', width: 'full' }}>
            <textarea
              rows={4}
              value={values.cannotOpenMessages ?? ''}
              onChange={(event) => updateValue('cannotOpenMessages', event.target.value)}
            />
          </FieldShell>
        </div>
      </section>

      <section className="workspace-section">
        <div className="section-heading compact-heading">
          <h3>Visual Layout</h3>
        </div>
        <div className="menu-studio">
          <div className="menu-canvas">
            <div className="menu-toolbar">
              <div className="page-tabs">
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`page-tab ${page === selectedPage ? 'active' : ''}`}
                    onClick={() => setSelectedPage(page)}
                  >
                    Page {page}
                  </button>
                ))}
              </div>
              <span className="menu-toolbar-note">{slotsOnPage} slots on this page</span>
            </div>
            <div className="fill-strip">
              <input
                aria-label="Fill item ID"
                className="fill-item-input"
                placeholder="Fill item (e.g. gray_stained_glass_pane)"
                value={fillItem}
                onChange={(event) => { setFillItem(event.target.value); setFillResult(''); }}
              />
              <div className="fill-buttons">
                <button
                  type="button"
                  className="fill-button"
                  disabled={!fillItem.trim()}
                  onClick={() => handleFill(getBorderCells(rowCount))}
                >
                  Border
                </button>
                <button
                  type="button"
                  className="fill-button"
                  disabled={!fillItem.trim()}
                  onClick={() => handleFill(getRowCells(selectedCell.row))}
                >
                  Row {selectedCell.row}
                </button>
                <button
                  type="button"
                  className="fill-button"
                  disabled={!fillItem.trim()}
                  onClick={() => handleFill(getColumnCells(selectedCell.column, rowCount))}
                >
                  Col {selectedCell.column}
                </button>
                <button
                  type="button"
                  className="fill-button"
                  disabled={!fillItem.trim()}
                  onClick={() => handleFill(getPageCells(rowCount))}
                >
                  Page
                </button>
              </div>
              <span className="fill-result" role="status" aria-live="polite">{fillResult}</span>
            </div>
            <div className="menu-grid">
              {Array.from({ length: rowCount * 9 }, (_, index) => {
                const row = Math.floor(index / 9) + 1;
                const column = (index % 9) + 1;
                const slot = getMenuSlotFromMap(slotMap, row, column, selectedPage);
                const isSelected = selectedCell.row === row && selectedCell.column === column;

                return (
                  <button
                    key={`${selectedPage}-${row}-${column}`}
                    type="button"
                    className={`menu-cell ${slot ? 'filled' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCell({ row, column })}
                  >
                    <span className="menu-cell-coord">
                      {row},{column}
                    </span>
                    <span className="menu-cell-label">
                      {slot ? stripMinecraftFormatting(slot.name || slot.item || 'Button') : 'Empty'}
                    </span>
                    <span className="menu-cell-meta">{slot ? (slot.clickActionType === 'none' ? 'button' : slot.clickActionType) : ''}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="menu-slot-panel">
            <div className="slot-panel-header">
              <div>
                <h4>
                  Slot {selectedCell.row},{selectedCell.column}
                </h4>
                <p>Page {selectedPage}</p>
              </div>
              {selectedSlot ? (
                <button type="button" className="ghost-button danger" onClick={deleteSelectedSlot}>
                  Remove slot
                </button>
              ) : null}
            </div>

            <div className="preset-grid">
              {MENU_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="preset-button"
                  onClick={() => applyPreset(preset.id)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {selectedSlot ? (
              <div className="field-grid">
                <FieldShell field={{ label: 'Item', width: 'full' }}>
                  <input value={selectedSlot.item ?? ''} onChange={(event) => updateSelectedSlot('item', event.target.value)} />
                </FieldShell>
                <FieldShell field={{ label: 'Name', width: 'full' }}>
                  <input value={selectedSlot.name ?? ''} onChange={(event) => updateSelectedSlot('name', event.target.value)} />
                </FieldShell>
                <FieldShell field={{ label: 'Lore', width: 'full' }}>
                  <textarea rows={4} value={selectedSlot.lore ?? ''} onChange={(event) => updateSelectedSlot('lore', event.target.value)} />
                </FieldShell>
                <FieldShell field={{ label: 'Click action', width: 'half' }}>
                  <select value={activeActionType} onChange={(event) => updateSelectedSlot('clickActionType', event.target.value)}>
                    <option value="none">none</option>
                    <option value="close_inventory">close_inventory</option>
                    <option value="run_command">run_command</option>
                    <option value="open_menu">open_menu</option>
                    <option value="send_message">send_message</option>
                  </select>
                </FieldShell>
                <FieldShell field={{ label: 'Action value', width: 'half' }}>
                  <input
                    value={selectedSlot.clickActionValue ?? ''}
                    onChange={(event) => updateSelectedSlot('clickActionValue', event.target.value)}
                    placeholder={
                      activeActionType === 'run_command'
                        ? 'say hello'
                        : activeActionType === 'open_menu'
                          ? 'other_menu'
                          : activeActionType === 'send_message'
                            ? '&aHello!'
                            : ''
                    }
                  />
                </FieldShell>
              </div>
            ) : (
              <div className="empty-state compact">This slot is empty. Pick a preset above to create a button here.</div>
            )}
          </div>
        </div>
      </section>

      <section className="workspace-section">
        <div className="section-heading compact-heading">
          <h3>Menu Logic</h3>
        </div>
        <div className="field-grid">
          <FieldShell field={{ label: 'Open effects', width: 'full', type: 'effects' }}>
            <EffectsEditor label="Open effects" value={values.openEffects} onChange={(nextValue) => updateValue('openEffects', nextValue)} />
          </FieldShell>
          <FieldShell field={{ label: 'Close effects', width: 'full', type: 'effects' }}>
            <EffectsEditor label="Close effects" value={values.closeEffects} onChange={(nextValue) => updateValue('closeEffects', nextValue)} />
          </FieldShell>
        </div>
      </section>
    </div>
  );
}

export type InsertResult = {
  value: string
  caret: number
}

export function insertAtCursor(
  value: string,
  code: string,
  selectionStart: number,
  selectionEnd: number = selectionStart,
): InsertResult {
  const start = Math.max(0, Math.min(value.length, selectionStart))
  const end = Math.max(start, Math.min(value.length, selectionEnd))
  const before = value.slice(0, start)
  const after = value.slice(end)
  const newValue = before + code + after
  const newCaret = before.length + code.length
  return { value: newValue, caret: newCaret }
}

export function wrapSelection(
  value: string,
  before: string,
  after: string,
  selectionStart: number,
  selectionEnd: number,
): InsertResult {
  const start = Math.max(0, Math.min(value.length, selectionStart))
  const end = Math.max(start, Math.min(value.length, selectionEnd))
  const head = value.slice(0, start)
  const middle = value.slice(start, end)
  const tail = value.slice(end)
  const newValue = head + before + middle + after + tail
  const newCaret = head.length + before.length + middle.length + after.length
  return { value: newValue, caret: newCaret }
}

// Run through use_figma. Scoped design foundations; based on the skill helpers.
const page = await figma.getNodeByIdAsync('0:1');
await figma.setCurrentPageAsync(page);
await Promise.all([
  { family: 'Inter', style: 'Regular' }, { family: 'Inter', style: 'Medium' },
  { family: 'Inter', style: 'Semi Bold' }, { family: 'Fraunces', style: 'Regular' },
].map(font => figma.loadFontAsync(font)));

async function createVariableCollection(name, modeNames) {
  const existing = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === name);
  const collection = existing ?? figma.variables.createVariableCollection(name);
  collection.renameMode(collection.modes[0].modeId, modeNames[0]);
  return { collection, modeIds: { [modeNames[0]]: collection.modes[0].modeId } };
}
const existingVariables = await figma.variables.getLocalVariablesAsync();
function token(collection, name, type, value, scopes, syntax) {
  const variable = existingVariables.find(v => v.variableCollectionId === collection.id && v.name === name)
    ?? figma.variables.createVariable(name, collection, type);
  variable.setValueForMode(collection.modes[0].modeId, value);
  variable.scopes = scopes;
  variable.setVariableCodeSyntax('WEB', `var(--mesa-${syntax})`);
  variable.setVariableCodeSyntax('ANDROID', `MesaTheme.${syntax.replaceAll('-', '_')}`);
  variable.setVariableCodeSyntax('iOS', `MesaTheme.${syntax.replaceAll('-', '_')}`);
  return variable;
}
function rgba(hex) {
  return { r: parseInt(hex.slice(1, 3), 16) / 255, g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255, a: 1 };
}
const primitives = (await createVariableCollection('MESA · Primitives', ['Value'])).collection;
const color = (await createVariableCollection('MESA · Color', ['Sobremesa'])).collection;
const size = (await createVariableCollection('MESA · Layout', ['Value'])).collection;
const colors = {};
for (const [name, hex] of Object.entries({
  background: '#FAF7F0', surface: '#FFFFFF', text: '#2D3025', secondary: '#6B6D60',
  action: '#A6412B', olive: '#526043', sage: '#E9EDDF', border: '#E3E1D7',
  peach: '#F3E1D5', sand: '#EFECE1', dark: '#342B24', cream: '#FFF8EC',
})) {
  const primitive = token(primitives, `palette/${name}`, 'COLOR', rgba(hex), [], `palette-${name}`);
  colors[name] = token(color, name, 'COLOR', { type: 'VARIABLE_ALIAS', id: primitive.id },
    ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR'], `color-${name}`).id;
}
const layout = {};
for (const number of [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56]) {
  const primitive = token(primitives, `unit/${number}`, 'FLOAT', number, [], `unit-${number}`);
  layout[number] = token(size, `space/${number}`, 'FLOAT', { type: 'VARIABLE_ALIAS', id: primitive.id },
    ['GAP', 'CORNER_RADIUS'], `space-${number}`).id;
}
const existingStyles = await figma.getLocalTextStylesAsync();
const styles = {};
for (const [name, family, weight, fontSize, line] of [
  ['Display', 'Fraunces', 'Regular', 34, 39], ['Heading', 'Fraunces', 'Regular', 25, 30],
  ['Title', 'Inter', 'Semi Bold', 17, 23], ['Body', 'Inter', 'Regular', 15, 22],
  ['Label', 'Inter', 'Semi Bold', 14, 20], ['Caption', 'Inter', 'Regular', 12, 17],
  ['Eyebrow', 'Inter', 'Semi Bold', 11, 16],
]) {
  const style = existingStyles.find(s => s.name === `MESA/${name}`) ?? figma.createTextStyle();
  style.name = `MESA/${name}`;
  style.fontName = { family, style: weight };
  style.fontSize = fontSize;
  style.lineHeight = { unit: 'PIXELS', value: line };
  styles[name] = style.id;
}
const libraryPage = figma.root.children.find(p => p.name === '02 · Componentes') ?? figma.createPage();
libraryPage.name = '02 · Componentes';
let board = page.children.find(n => n.name === 'MESA · Sobremesa · Review');
if (!board) {
  board = figma.createAutoLayout('VERTICAL');
  page.appendChild(board);
  board.name = 'MESA · Sobremesa · Review';
  board.resize(1430, 100);
  board.layoutSizingHorizontal = 'FIXED';
  board.x = 100; board.y = 100;
  board.paddingLeft = board.paddingRight = 50;
  board.paddingTop = board.paddingBottom = 40;
  board.itemSpacing = 28;
  board.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } },
    'color', await figma.variables.getVariableByIdAsync(colors.sand))];
}
const names = ['01 · Inicio', '02 · Grupo privado', '03 · Restaurante'];
let row = board.children.find(n => n.name === 'Recorrido principal');
if (!row) {
  row = figma.createAutoLayout('HORIZONTAL'); board.appendChild(row); row.name = 'Recorrido principal';
  row.fills = []; row.itemSpacing = 50;
}
const screens = names.map(name => {
  let screen = row.children.find(n => n.name === name);
  if (!screen) {
    screen = figma.createAutoLayout('VERTICAL'); row.appendChild(screen); screen.name = name;
    screen.resize(390, 844); screen.layoutSizingHorizontal = 'FIXED'; screen.layoutSizingVertical = 'FIXED';
    screen.primaryAxisSizingMode = 'FIXED'; screen.counterAxisSizingMode = 'FIXED';
    screen.cornerRadius = 28; screen.clipsContent = true; screen.itemSpacing = 0;
    screen.placeholder = true;
  }
  return { id: screen.id, name: screen.name, width: screen.width, height: screen.height };
});
return {
  pages: { design: page.id, library: libraryPage.id }, boardId: board.id, rowId: row.id,
  screens, colors, layout, styles,
  collections: [primitives.id, color.id, size.id],
  createdOrUpdatedNodeIds: [page.id, libraryPage.id, board.id, row.id, ...screens.map(s => s.id)],
  variableCount: (await figma.variables.getLocalVariablesAsync()).length, textStyleCount: Object.keys(styles).length,
};

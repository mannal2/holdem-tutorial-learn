const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 474, height: 884 } });
    await page.goto('http://127.0.0.1:5188/');
    await page.locator('#seat-0').click();
    await page.locator('#next').click();
    await page.waitForFunction(() => document.querySelector('#flying-card').getAnimations().length > 0);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(700);
    assert.match(await page.locator('#title').textContent(), /맞아요/);
    assert.equal(await page.locator('.card.back,.card.face').count(), 0, 'resize must restore the entry checkpoint');
    assert.equal(await page.locator('#next').isEnabled(), true);
    assert.equal(await page.locator('#flying-card').evaluate(el => el.getAnimations().length), 0);
    await page.locator('#next').click();
    await page.waitForFunction(() => document.querySelector('#title').textContent.includes('모두 한 장씩'));
    assert.equal(await page.locator('.card.back').count(), 6);
    console.log('PASS resize during card flight: canceled, checkpoint restored, replay completes');
    await page.evaluate(async () => {
      const [{ default: React }, { default: ReactDOM }, { default: Table }, { prototype }, { createLessonRuntime }] = await Promise.all([
        import('/node_modules/.vite/deps/react.js'), import('/node_modules/.vite/deps/react-dom_client.js'),
        import('/src/Table.jsx'), import('/src/lessons/prototype.js'), import('/src/lesson-runtime.mjs'),
      ]);
      const lesson = createLessonRuntime({ lesson: prototype, playEvent: async () => {} }).getState();
      lesson.table.smallBlindId = 2; lesson.table.bigBlindId = 3; lesson.table.buttonId = 1;
      lesson.table.board = [{id:'Qd',rank:12,suit:'d'},{id:'8c',rank:8,suit:'c'},{id:'2s',rank:2,suit:'s'}];
      lesson.table.boardCount = 3;
      lesson.table.seats[0].hole = [{id:'Kd',rank:13,suit:'d'},{id:'9c',rank:9,suit:'c'}];
      for (const seat of lesson.table.seats) { seat.dealtCount = 2; seat.revealed = true; }
      const host = document.createElement('div'); host.id = 'props-check'; document.body.append(host);
      ReactDOM.createRoot(host).render(React.createElement(Table, { lesson: { ...lesson, answer: () => {} }, elements: {current: {targets:[], sources:[], bets:[], effects:[]}} }));
    });
    const host = page.locator('#props-check');
    await host.locator('.seat-0 .card.face').first().waitFor();
    assert.deepEqual(await host.locator('.seat-0 .card.face').evaluateAll(cards => cards.map(c => c.getAttribute('aria-label'))), ['다이아몬드 K','클럽 9']);
    assert.equal(await host.locator('.seat-2 .position-badge').textContent(), 'SB');
    assert.equal(await host.locator('.seat-3 .position-badge.bb').textContent(), 'BB');
    assert.equal(await host.locator('.seat-1 .position-badge.btn').textContent(), 'BTN');
    assert.equal(await host.locator('.seat-0 .position-badge').count(), 0);
    assert.equal(await host.locator('.board .card.face').count(), 3);
    console.log('PASS Table props: actual cards, board, and moved roles render independently of step IDs');
    await page.evaluate(async () => {
      const [{default:React},{default:ReactDOM},{default:LessonPanel},{prototype},{createLessonRuntime}] = await Promise.all([
        import('/node_modules/.vite/deps/react.js'), import('/node_modules/.vite/deps/react-dom_client.js'),
        import('/src/LessonPanel.jsx'), import('/src/lessons/prototype.js'), import('/src/lesson-runtime.mjs'),
      ]);
      const lesson=createLessonRuntime({lesson:prototype,playEvent:async()=>{}}).getState();
      const host=document.createElement('div');host.id='label-check';document.body.append(host);
      ReactDOM.createRoot(host).render(React.createElement(LessonPanel,{lesson:{...lesson,lessonId:'03'},pickerOpen:false,onOpenPicker:()=>{}}));
    });
    await page.locator('#label-check #chapter-label').waitFor();
    assert.equal(await page.locator('#label-check #chapter-label').textContent(),'LESSON 03');
    console.log('PASS lesson label follows the selected lesson ID rather than its internal step');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

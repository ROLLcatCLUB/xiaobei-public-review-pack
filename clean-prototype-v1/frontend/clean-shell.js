(function(){
  const PROFILE_KEY = 'xiaobei_teacher_profile_v1';
  const ASSISTANT_KEY = 'xiaobei_assistant_profile_v1';

  function readJson(key){
    try{
      return JSON.parse(localStorage.getItem(key) || '{}');
    }catch(error){
      return {};
    }
  }

  function defaultProfile(){
    return {
      teacherName:'徐涛老师',
      subject:'美术',
      teachingGrades:'三年级、四年级',
      preferredGrade:'三年级',
      commonClasses:'三年级1-5班 · 四年级1-5班',
      scheduleSource:'教学档案维护',
      feishuImported:false,
      scheduleRows:[
        {className:'三（1）班', weekday:'周一', period:'第1节', note:'美术教室1'},
        {className:'三（2）班', weekday:'周一', period:'第3节', note:'美术教室1'},
        {className:'三（3）班', weekday:'周二', period:'第1节', note:'美术教室1'},
        {className:'三（4）班', weekday:'周二', period:'第3节', note:'美术教室1'},
        {className:'三（5）班', weekday:'周三', period:'第2节', note:'美术教室1'},
        {className:'四（1）班', weekday:'周三', period:'第4节', note:'美术教室2'},
        {className:'四（2）班', weekday:'周四', period:'第1节', note:'美术教室2'},
        {className:'四（3）班', weekday:'周四', period:'第3节', note:'美术教室2'},
        {className:'四（4）班', weekday:'周五', period:'第1节', note:'美术教室2'},
        {className:'四（5）班', weekday:'周五', period:'第3节', note:'美术教室2'}
      ]
    };
  }

  function ensureProfile(){
    const existing = readJson(PROFILE_KEY);
    const defaults = defaultProfile();
    const merged = Object.assign({}, defaults, existing || {});
    const shouldSeedDefaultTeacher = !existing || !existing.teacherName || existing.teacherName === '李老师';
    if (shouldSeedDefaultTeacher) {
      const seeded = Object.assign({}, merged, {
        teacherName: defaults.teacherName,
        teachingGrades: defaults.teachingGrades,
        preferredGrade: existing && existing.preferredGrade ? existing.preferredGrade : defaults.preferredGrade,
        commonClasses: defaults.commonClasses,
        scheduleSource: existing && existing.scheduleSource ? existing.scheduleSource : defaults.scheduleSource,
        feishuImported: existing && typeof existing.feishuImported === 'boolean' ? existing.feishuImported : defaults.feishuImported,
        scheduleRows: existing && Array.isArray(existing.scheduleRows) && existing.scheduleRows.length ? existing.scheduleRows : defaults.scheduleRows
      });
      localStorage.setItem(PROFILE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    if (!existing || !existing.teacherName) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
    }
    return merged;
  }

  function assistantCopy(mode){
    const map = {
      entry:{
        title:'助手',
        intro:'继续、快备、调整、查看',
        actions:[
          ['继续上次','直接回到最近保存的一节课'],
          ['今天快速备一节','先选课，再进快速版'],
          ['查看安排','回到学期教学安排']
        ]
      },
      calendar:{
        title:'排课助手',
        intro:'看安排、看变动、做调整',
        actions:[
          ['看本周','优先确认本周要上的课'],
          ['做顺延','只改未来，不改过去'],
          ['去选课','从安排进入正式选课']
        ]
      },
      picker:{
        title:'选课助手',
        intro:'先锁定当前课时',
        actions:[
          ['按周次缩小','先把列表缩到这周'],
          ['按班级缩小','先锁到当前班级'],
          ['进入简报','锁定后再看课前定向']
        ]
      },
      brief:{
        title:'简报助手',
        intro:'先抓、先防、先备',
        actions:[
          ['先抓什么','只看这节课的核心抓手'],
          ['先防什么','先避开最容易跑偏的地方'],
          ['推荐下一步','默认先去快速版']
        ]
      },
      draft:{
        title:'备课助手',
        intro:'先立一版主稿',
        actions:[
          ['补核心抓手','先把一版主稿立起来'],
          ['保存草稿','保存后下次继续编辑'],
          ['继续精修','需要时再进入精修页']
        ]
      },
      refine:{
        title:'精修助手',
        intro:'同一节课，继续深改',
        actions:[
          ['改公共主稿','先改全班共用内容'],
          ['改班级差异','再调某个班的差异'],
          ['保存继续','保存后继续回到这条稿链']
        ]
      },
      profile:{
        title:'档案助手',
        intro:'维护老师信息、课表和课表来源',
        actions:[
          ['改姓名与年级','保持基础信息准确'],
          ['维护课表','后面选课会默认带出'],
          ['导入飞书现有课','后面可用飞书课表覆盖当前表'],
          ['保存档案','学期排课会直接读取']
        ]
      },
      planner:{
        title:'排课向导助手',
        intro:'先起草，再确认',
        actions:[
          ['补基础信息','年级、学科、学期'],
          ['沿用教师课表','先读教学档案里的课表'],
          ['补课题清单','表格里加减即可'],
          ['生成草案','先出草案，再回学期安排']
        ]
      },
      assistant:{
        title:'助手设置',
        intro:'只改偏好，不改主线',
        actions:[
          ['说话长短','简洁或详细'],
          ['提醒方式','主动或少打扰'],
          ['默认建议','先建议还是先填稿']
        ]
      }
    };
    return map[mode] || map.entry;
  }

  function topNav(page){
    const items = [
      ['entry.html','备课入口','entry'],
      ['calendar.html','学期安排','calendar'],
      ['picker.html','正式选课','picker'],
      ['brief.html','课前简报','brief'],
      ['draft.html?entry=rapid','快速版','draft'],
      ['refine.html','精修页','refine'],
      ['profile.html','教学档案','profile']
    ];
    return items.map(([href,label,key]) =>
      `<a href="${href}" class="${page===key?'active':''}">${label}</a>`
    ).join('');
  }

  function createTopbar(page,title){
    const profile = ensureProfile();
    const wrap = document.createElement('div');
    wrap.className = 'shell-topbar';
    wrap.innerHTML = `
      <div class="shell-topbar-inner">
        <div class="brand">
          <img class="brand-mark" src="assets/dz-zhihui-logo.svg" alt="雕庄智绘教育">
          <div class="brand-copy">
            <strong>雕庄智绘教育</strong>
            <small>${title} · 已登录 · ${(profile.teachingGrades || profile.preferredGrade)}${profile.subject}</small>
          </div>
        </div>
        <div class="user-nav">
          <a class="btn soft" href="assistant.html">助手设置</a>
          <a class="user-chip" href="profile.html">
            <span class="user-avatar">${(profile.teacherName || '李').slice(0,1)}</span>
            <span class="user-text">
              <strong>${profile.teacherName}</strong>
              <small>${profile.commonClasses || `${profile.scheduleRows.length} 条课表`}</small>
            </span>
          </a>
        </div>
      </div>
      <nav class="shell-nav">${topNav(page)}</nav>
    `;
    return wrap;
  }

  function createAssistant(mode){
    const profile = ensureProfile();
    const prefs = Object.assign({assistantTone:'简洁', reminderStyle:'少打扰'}, readJson(ASSISTANT_KEY));
    const copy = assistantCopy(mode);
    const toggle = document.createElement('button');
    toggle.className = 'drawer-toggle';
    toggle.type = 'button';
    toggle.textContent = '助';

    const drawer = document.createElement('aside');
    drawer.className = 'drawer';
    drawer.innerHTML = `
      <div class="drawer-head">
        <h3>${copy.title}</h3>
        <button class="btn" type="button" id="drawerCloseBtn">收起</button>
      </div>
      <div class="card" style="padding:14px;margin-bottom:12px">
        <div class="muted tiny">当前老师</div>
        <strong>${profile.teacherName} · ${profile.preferredGrade}${profile.subject}</strong>
        <div class="muted" style="margin-top:6px">${copy.intro}</div>
      </div>
      <div class="quick-grid">
        ${copy.actions.map(([a,b])=>`<div class="quick-action"><strong>${a}</strong><div class="muted tiny">${b}</div></div>`).join('')}
      </div>
      <div class="card" style="padding:14px;margin-top:12px">
        <div class="muted tiny">当前偏好</div>
        <strong>${prefs.assistantTone} · ${prefs.reminderStyle}</strong>
      </div>
    `;

    toggle.onclick = () => drawer.classList.toggle('open');
    drawer.querySelector('#drawerCloseBtn').onclick = () => drawer.classList.remove('open');
    document.body.appendChild(toggle);
    document.body.appendChild(drawer);
  }

  function mount(options){
    const page = options.page || 'entry';
    const title = options.title || '备课原型';
    const mode = options.assistant || page;
    const shell = document.querySelector('.shell');
    if (!shell) return;
    shell.prepend(createTopbar(page,title));
    createAssistant(mode);
  }

  window.CLEAN_PROTO = {
    mount,
    ensureProfile,
    readJson
  };
})();

(function(){
  const PROFILE_KEY = 'xiaobei_teacher_profile_v1';
  const ASSISTANT_KEY = 'xiaobei_ai_assistant_profile_v1';

  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { return {}; }
  }

  function mergedProfile() {
    const teacher = readJson(PROFILE_KEY);
    const assistant = readJson(ASSISTANT_KEY);
    return {
      teacherName: teacher.teacherName || assistant.teacherName || '李老师',
      subject: teacher.subject || assistant.subject || '美术',
      preferredGrade: teacher.preferredGrade || assistant.preferredGrade || '三年级',
      commonClasses: teacher.commonClasses || assistant.commonClasses || '三（1）班、三（2）班',
      scheduleStyle: teacher.scheduleStyle || assistant.scheduleStyle || '正常排',
      outputStyle: assistant.outputStyle || '简洁',
      assistantBehavior: assistant.assistantBehavior || '先建议再生成',
      reminderStyle: assistant.reminderStyle || '按需提醒',
      scheduleRows: Array.isArray(teacher.scheduleRows) ? teacher.scheduleRows : []
    };
  }

  function pageMode() {
    const file = location.pathname.split('/').pop();
    const map = {
      'xiaobei_prepare_desktop_preview.html': 'home-entry',
      'xiaobei_teaching_calendar_preview.html': 'semester-calendar',
      'xiaobei_ai_semester_planner_preview.html': 'semester-planner',
      'xiaobei_formal_lesson_picker_preview.html': 'lesson-picker',
      'xiaobei_preclass_brief_preview.html': 'preclass-brief',
      'xiaobei_prepare_draft_preview.html': 'draft',
      'xiaobei_prepare_refine_preview.html': 'refine',
      'xiaobei_prepare_mobile_preview.html': 'lesson-flow',
      'xiaobei_lesson_workspace_preview.html': 'lesson-workspace',
      'xiaobei_user_profile_preview.html': 'user-profile'
    };
    return map[file] || 'general';
  }

  function modeCopy(mode) {
    return {
      'semester-planner': {
        title: '学期排课助手',
        hint: '可帮你收学期约束、估算容量、起草周历草稿',
        good: ['根据学期日期和课表起草安排', '提醒哪些周不宜排满', '建议留多少机动课时'],
        avoid: ['直接覆盖正式教学安排', '凭空猜老师课表']
      },
      'lesson-picker': {
        title: '选课助手',
        hint: '可帮你缩小筛选范围，确认今天要处理哪一节',
        good: ['按周次 / 班级 / 单元筛课', '解释为什么推荐某一条课时项'],
        avoid: ['跳过课时身份直接去备课', '替你生成教学设计']
      },
      'preclass-brief': {
        title: '课前定向助手',
        hint: '可帮你压重点、解释 5 张卡，但不替你写小教案',
        good: ['概括先抓什么', '解释哪一张卡最关键', '把重点压成 3 句'],
        avoid: ['直接展开完整课堂流程', '跳过 brief 去生成整课']
      },
      'draft': {
        title: '快速备课助手',
        hint: '可帮你补字段、改草稿，让你不是从零开始',
        good: ['补教学目标', '补任务要求', '改一段老师提示'],
        avoid: ['篡改事实层信息', '脱离 lesson context 瞎写']
      },
      'refine': {
        title: '精修协作助手',
        hint: '可帮你局部改写、做班级差异建议，但不替你整页重写',
        good: ['按班级做差异提醒', '重写一小段', '建议先改哪个模块'],
        avoid: ['自动给 8 个班全写满', '自动覆盖整页']
      },
      'semester-calendar': {
        title: '教学安排助手',
        hint: '可帮你看原计划与实际执行，但不直接替你重排正式表',
        good: ['解释顺延影响', '提示受影响课时项', '建议调整范围'],
        avoid: ['抹掉原计划', '回滚已完成课时']
      },
      'home-entry': {
        title: '备课入口助手',
        hint: '可帮你判断今天该走哪条路',
        good: ['建议继续上次备课还是快速备一节', '解释四个入口差别'],
        avoid: ['替你直接跳过选课身份']
      },
      'lesson-flow': {
        title: '单课流程助手',
        hint: '可帮你看当前课和下一步，但不直接接管流程',
        good: ['解释当前状态', '提示先看 brief 还是先进快速版'],
        avoid: ['跳过流程节点']
      },
      'lesson-workspace': {
        title: '本节课助手',
        hint: '可帮你理解当前课时与班级状态',
        good: ['解释课时锚点', '建议先看哪个入口'],
        avoid: ['绕过当前 lesson context']
      },
      'user-profile': {
        title: '账号助手',
        hint: '这里主要管理老师档案、教师课表和助手偏好',
        good: ['提醒先补课表', '说明这些资料会被哪些页面读取'],
        avoid: ['在这里直接做学期排课']
      },
      'general': {
        title: '通用助手',
        hint: '根据当前页面模式给出建议',
        good: ['解释当前页该做什么'],
        avoid: ['抢主页面']
      }
    }[mode] || null;
  }

  function injectStyle() {
    if (document.getElementById('proto-shell-style')) return;
    const style = document.createElement('style');
    style.id = 'proto-shell-style';
    style.textContent = `
      .proto-user-nav{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
      .proto-user-chip,.proto-user-link{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 14px;border-radius:14px;border:1px solid #dbe7df;background:rgba(255,255,255,.92);color:#44524a;font-weight:800;text-decoration:none}
      .proto-user-chip strong{display:block;font-size:14px;line-height:1.2}
      .proto-user-chip small{display:block;font-size:11px;color:#748179;font-weight:700;line-height:1.2}
      .proto-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#2f8b69,#5bbf92);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:900}
      .proto-shell-fab{position:fixed;right:22px;bottom:22px;width:62px;height:62px;border:none;border-radius:999px;background:linear-gradient(135deg,#2f8b69,#197450);box-shadow:0 18px 34px rgba(31,143,96,.28);color:#fff;font-weight:900;cursor:pointer;z-index:70}
      .proto-shell-drawer{position:fixed;right:22px;bottom:96px;width:min(390px,calc(100vw - 24px));max-height:calc(100vh - 128px);overflow:auto;border:1px solid #dbe7df;border-radius:24px;background:rgba(255,255,255,.98);box-shadow:0 24px 54px rgba(34,56,43,.16);padding:18px;z-index:80;display:none}
      .proto-shell-drawer.open{display:block}
      .proto-shell-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
      .proto-shell-head h3{margin:0;font-size:20px}
      .proto-shell-head p{margin:6px 0 0;color:#6b7a71;line-height:1.6;font-size:13px}
      .proto-shell-close{border:none;background:transparent;color:#617066;font-size:24px;cursor:pointer}
      .proto-shell-card{margin-top:14px;padding:14px;border:1px solid #e2ebe4;border-radius:18px;background:#fbfefd}
      .proto-shell-card h4{margin:0 0 8px;font-size:15px}
      .proto-shell-card p{margin:0;color:#65736b;line-height:1.65;font-size:13px}
      .proto-shell-list{margin:0;padding-left:18px;color:#65736b;line-height:1.7;font-size:13px}
      .proto-shell-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
      .proto-shell-action{padding:8px 12px;border-radius:999px;border:1px solid #dbe7df;background:#fff;color:#45534b;font-size:12px;font-weight:800;cursor:pointer}
      .proto-shell-messages{display:grid;gap:10px;margin-top:10px}
      .proto-msg{padding:10px 12px;border-radius:16px;font-size:13px;line-height:1.65}
      .proto-msg.user{background:#eef8f3;color:#2f6b53}
      .proto-msg.bot{background:#f6f8fb;color:#4b5a70}
      .proto-shell-input{width:100%;margin-top:10px;padding:11px 12px;border:1px solid #dbe7df;border-radius:14px;background:#fff;color:#334038}
      .proto-shell-footer{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:10px}
      .proto-shell-save{display:inline-flex;align-items:center;justify-content:center;padding:9px 14px;border:none;border-radius:999px;background:#2f8b69;color:#fff;font-weight:800;cursor:pointer}
      .proto-shell-link{font-size:12px;color:#607067}
      @media(max-width:720px){.proto-user-nav{width:100%;justify-content:flex-start}.proto-shell-fab{right:16px;bottom:16px}.proto-shell-drawer{right:8px;left:8px;width:auto;bottom:88px}}
    `;
    document.head.appendChild(style);
  }

  function injectUserNav() {
    if (document.querySelector('.proto-user-nav')) return;
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;
    const p = mergedProfile();
    const nav = document.createElement('div');
    nav.className = 'proto-user-nav';
    const classCount = p.scheduleRows.length ? `${p.scheduleRows.length} 条课表` : (p.commonClasses || '未设班级');
    nav.innerHTML = `
      <a class="proto-user-chip" href="xiaobei_user_profile_preview.html">
        <span class="proto-avatar">${(p.teacherName || '李').slice(0,1)}</span>
        <span>
          <strong>${p.teacherName}</strong>
          <small>${p.preferredGrade}${p.subject}｜${classCount}</small>
        </span>
      </a>
      <a class="proto-user-link" href="xiaobei_user_profile_preview.html">教学档案</a>
      <a class="proto-user-link" href="xiaobei_user_profile_preview.html#schedule">教师课表</a>
      <a class="proto-user-link" href="xiaobei_user_profile_preview.html#assistant">助手偏好</a>
    `;
    topbar.appendChild(nav);
  }

  function createDrawer() {
    if (document.getElementById('protoShellFab')) return;
    const mode = pageMode();
    const copy = modeCopy(mode);
    const p = mergedProfile();
    const fab = document.createElement('button');
    fab.id = 'protoShellFab';
    fab.className = 'proto-shell-fab';
    fab.type = 'button';
    fab.textContent = '助手';

    const drawer = document.createElement('aside');
    drawer.id = 'protoShellDrawer';
    drawer.className = 'proto-shell-drawer';
    drawer.innerHTML = `
      <div class="proto-shell-head">
        <div>
          <h3>${copy.title}</h3>
          <p>${copy.hint}</p>
        </div>
        <button class="proto-shell-close" type="button" aria-label="关闭">×</button>
      </div>
      <div class="proto-shell-card">
        <h4>当前账号上下文</h4>
        <p>${p.teacherName}｜${p.preferredGrade}${p.subject}｜排课偏好：${p.scheduleStyle}｜输出风格：${p.outputStyle}</p>
      </div>
      <div class="proto-shell-card">
        <h4>这页 AI 适合做什么</h4>
        <ul class="proto-shell-list">${copy.good.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
      <div class="proto-shell-card">
        <h4>这页 AI 不该做什么</h4>
        <ul class="proto-shell-list">${copy.avoid.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
      <div class="proto-shell-card">
        <h4>快捷动作</h4>
        <div class="proto-shell-actions">
          <button class="proto-shell-action" type="button" data-msg="先告诉我这页最该做的一件事">先告诉我这页最该做的一件事</button>
          <button class="proto-shell-action" type="button" data-msg="把当前页面信息压成 3 条重点">压成 3 条重点</button>
          <button class="proto-shell-action" type="button" data-msg="告诉我这页下一步应该点什么">告诉我下一步点什么</button>
        </div>
        <div class="proto-shell-messages" id="protoShellMessages">
          <div class="proto-msg bot">你好，我会根据当前页面模式给建议。现在这页适合先做：${copy.good[0]}。</div>
        </div>
        <input id="protoShellInput" class="proto-shell-input" placeholder="输入一句话，像客服一样问我..." />
        <div class="proto-shell-footer">
          <button id="protoShellSend" class="proto-shell-save" type="button">发送（预览）</button>
          <a class="proto-shell-link" href="xiaobei_user_profile_preview.html#assistant">去改助手偏好</a>
        </div>
      </div>
    `;
    document.body.appendChild(fab);
    document.body.appendChild(drawer);

    const close = drawer.querySelector('.proto-shell-close');
    const input = drawer.querySelector('#protoShellInput');
    const messages = drawer.querySelector('#protoShellMessages');
    const send = drawer.querySelector('#protoShellSend');

    function mockReply(text) {
      if (/课表|排课|学期/.test(text) && mode === 'semester-planner') return '我建议你先确认教师课表和活动周，再生成草稿。学期起止、节假日和课题清单定住后，AI 起草会更稳。';
      if (/重点|三条/.test(text)) return `这页先看三件事：1）当前身份是不是这节课；2）事实层有没有定住；3）再决定是否让 AI 起草。`;
      if (/下一步|点什么/.test(text)) return `当前这页建议的下一步是：${copy.good[0]}。先做这一件，再往下走会最稳。`;
      return `我会先基于这页模式来帮你，不会越级抢主页面。当前更适合做：${copy.good[0]}。`;
    }

    function pushMessage(role, text) {
      const div = document.createElement('div');
      div.className = `proto-msg ${role}`;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    fab.addEventListener('click', () => drawer.classList.toggle('open'));
    close.addEventListener('click', () => drawer.classList.remove('open'));
    send.addEventListener('click', () => {
      const text = input.value.trim();
      if (!text) return;
      pushMessage('user', text);
      pushMessage('bot', mockReply(text));
      input.value = '';
    });
    drawer.querySelectorAll('.proto-shell-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.msg;
        pushMessage('user', text);
        pushMessage('bot', mockReply(text));
      });
    });
  }

  function init() {
    injectStyle();
    injectUserNav();
    createDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

(function(){
  const PROFILE_KEY = 'xiaobei_teacher_profile_v1';
  const ASSISTANT_KEY = 'xiaobei_assistant_profile_v1';
  const KB_API_BASE_KEY = 'xiaobei_kb_api_base_v1';
  const ASSISTANT_ACTION_LOG_KEY = 'xiaobei_assistant_action_log_v1';
  function resolveApiBase(){
    if (window.XIAOBEI_LOCAL_API_BASE) {
      return String(window.XIAOBEI_LOCAL_API_BASE).replace(/\/$/, '');
    }
    const { protocol, hostname, origin } = window.location;
    const localHosts = new Set(['127.0.0.1', 'localhost']);
    if (protocol === 'file:' || localHosts.has(hostname)) {
      return 'http://127.0.0.1:18082';
    }
    if (protocol === 'http:' || protocol === 'https:') {
      return `${origin}/api`;
    }
    return 'http://127.0.0.1:18082';
  }
  const LOCAL_API_BASE = resolveApiBase();
  const API_BASE_CANDIDATES = (() => {
    const { protocol, hostname, origin } = window.location;
    const bases = [];
    if (protocol === 'file:' || hostname === '127.0.0.1' || hostname === 'localhost') {
      bases.push(LOCAL_API_BASE, 'http://127.0.0.1:18082', 'http://127.0.0.1:8082');
    } else if (protocol === 'http:' || protocol === 'https:') {
      bases.push(LOCAL_API_BASE, origin, `${origin}/api`);
    } else {
      bases.push(LOCAL_API_BASE);
    }
    return [...new Set(bases.map(base => String(base || '').replace(/\/api$/, '').replace(/\/$/, '')).filter(Boolean))];
  })();
  const REAL_BRIDGE = window.XIAOBEI_FEISHU_REAL_DATA_V1 || null;
  let designContextOutsideHandler = null;
  let assistantBridge = null;
  let assistantMode = 'entry';
  let assistantWorkMode = '';
  let assistantPromptPreset = 'default';
  let assistantDrawerRefs = null;
  let assistantConversation = [];
  let assistantConversationMode = '';
  let assistantUploads = [];
  let assistantInline = false;
  let assistantLastChoiceSet = null;
  let assistantPendingAction = null;
  let assistantActionLog = [];
  let assistantSelectionContext = null;
  let assistantSelectionListenerReady = false;

  function readJson(key){
    try{
      return JSON.parse(localStorage.getItem(key) || '{}');
    }catch(error){
      return {};
    }
  }

  function readJsonArray(key){
    try{
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    }catch(error){
      return [];
    }
  }

  assistantActionLog = readJsonArray(ASSISTANT_ACTION_LOG_KEY).slice(-80);

  function defaultProfile(){
    const realProfile = REAL_BRIDGE?.teacherProfile || {};
    return {
      teacherName: realProfile.teacherName || '徐涛老师',
      subject: realProfile.subject || '美术',
      teachingGrades: realProfile.teachingGrades || '三年级、四年级',
      preferredGrade: realProfile.preferredGrade || '三年级',
      commonClasses: realProfile.commonClasses || '三年级1-5班 · 四年级1-5班',
      scheduleSource: realProfile.scheduleSource || '教学档案维护',
      feishuImported: typeof realProfile.feishuImported === 'boolean' ? realProfile.feishuImported : false,
      gradeScheduleRows:Array.isArray(realProfile.gradeScheduleRows) && realProfile.gradeScheduleRows.length ? realProfile.gradeScheduleRows : [
        {grade:'三年级', classCount:'5', weeklyLessons:'2', weekdays:'周四、周五', note:'先按年级维护教学框架'},
        {grade:'四年级', classCount:'5', weeklyLessons:'2', weekdays:'周二、周三', note:'班级差异放到后续备课里调整'}
      ],
      scheduleRows:Array.isArray(realProfile.scheduleRows) && realProfile.scheduleRows.length ? realProfile.scheduleRows : [
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
        gradeScheduleRows: existing && Array.isArray(existing.gradeScheduleRows) && existing.gradeScheduleRows.length ? existing.gradeScheduleRows : defaults.gradeScheduleRows,
        scheduleRows: existing && Array.isArray(existing.scheduleRows) && existing.scheduleRows.length ? existing.scheduleRows : defaults.scheduleRows
      });
      localStorage.setItem(PROFILE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    if (!Array.isArray(merged.gradeScheduleRows) || !merged.gradeScheduleRows.length) {
      merged.gradeScheduleRows = defaults.gradeScheduleRows;
      localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
    }
    if (!existing || !existing.teacherName) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
    }
    return merged;
  }

  function assistantCopy(mode){
    const map = {
      entry:{
        title:'入口助手',
        intro:'快速备课归设计中心，课堂和作业评价归执行中心',
        actions:[
          ['快速备一节','进入教学设计中心的轻量备课入口'],
          ['进入执行中心','查看上课、收作业、评价和课堂记录'],
          ['整理设计内容','回到单元、课时和设计草稿']
        ]
      },
      design_center:{
        title:'设计助手',
        intro:'先看设计内容，再决定下一步动作',
        actions:[
          ['看设计总览','先确认有哪些单元和课时设计'],
          ['看单元母稿','先确认这一组课到底想教成什么'],
          ['看课时设计','再进入单节课的完整设计']
        ]
      },
      unit_design:{
        title:'单元设计助手',
        intro:'先立祖层，再拆课时',
        actions:[
          ['抓单元目标','先把核心素养目标和核心任务立住'],
          ['排课时地图','看这一单元每节课承担什么'],
          ['看资源总表','把 PPT、学习单、材料先收拢']
        ]
      },
      lesson_design:{
        title:'课时设计助手',
        intro:'先做完整设计，再决定何时执行',
        actions:[
          ['补课时字段','目标、内容、活动、作业和评价先收齐'],
          ['展开过程表','把步骤、话术、任务和 PPT 写清楚'],
          ['挂到安排','设计定稿后再挂回时间轴']
        ]
      },
      design_drafts:{
        title:'设计草稿助手',
        intro:'先找未完成稿，再决定继续哪一份',
        actions:[
          ['看最近修改','先从最近改过的稿子接着做'],
          ['区分单元和课时','不要把祖层和父层混在一起'],
          ['完成后再挂接','先把设计稿做完整']
        ]
      },
      design_attach:{
        title:'挂接助手',
        intro:'设计稿完成后，再挂回时间轴',
        actions:[
          ['看未挂接项','先找还没挂回安排的设计稿'],
          ['挂到安排','把设计稿挂到学期安排'],
          ['回执行中心','挂完再去按周次使用']
        ]
      },
      calendar:{
        title:'安排助手',
        intro:'只在需要调整学期节奏时打开',
        actions:[
          ['看本周','优先确认本周要备的课'],
          ['调整安排','顺延、替换、插入活动课'],
          ['去正式选课','从安排进入具体备课对象']
        ]
      },
      picker:{
        title:'选课助手',
        intro:'换课时才需要筛选',
        actions:[
          ['按周次缩小','先把列表缩到这周'],
          ['按班级缩小','先锁到当前班级'],
          ['就备这节','快速路径会直接进入快速版']
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
        title:'小备 AI 学期安排工作台',
        intro:'先读课表和教材，再生成可确认的学期安排',
        actions:[
          ['生成学期草案','按教师课表、课题清单和特殊安排起草周历'],
          ['整理教材目录','把粘贴或上传的目录拆成课题卡片'],
          ['调整排课口径','按保守、正常或紧凑节奏重算'],
          ['写入当前安排','老师确认后再进入安排页排课']
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
      },
      knowledge_base:{
        title:'知识库助手',
        intro:'先收资料，再接检索',
        actions:[
          ['上传教材','先把教材页和目录收进资料池'],
          ['补元数据','年级、单元、课题和权限要先标清'],
          ['导出清单','先形成可迁移的本地 JSON 清单'],
          ['接 AI 检索','后续再接上传、切片和向量索引']
        ]
      }
    };
    return map[mode] || map.entry;
  }

  function detectAssistantWorkMode(mode){
    if (['design_center','design_attach'].includes(mode)) return 'fast';
    if (mode === 'planner') return 'fast';
    if (['unit_design','lesson_design','design_drafts'].includes(mode)) return 'deep';
    return 'deep';
  }

  function modeMeta(mode){
    return mode === 'fast'
      ? {
          label:'速备模式',
          icon:'🚀',
          hint:'先快速生成一版底稿，再进入改写和确认。',
          placeholder:'直接说你的速备意图，比如：先为这一课生成 7 段底稿。'
        }
      : {
          label:'精备模式',
          icon:'🧠',
          hint:'先对话、再采纳、再回填，按你的教学意图慢慢打磨。',
          placeholder:'直接说你的精备意图，比如：帮我把导入改得更像信息化课。'
        };
  }

  function promptPresetOptions(){
    return [
      { value:'default', label:'常规备课' },
      { value:'semester', label:'学期安排' },
      { value:'curriculum', label:'课程标准' },
      { value:'public', label:'公开课打磨' },
      { value:'rewrite', label:'文字润色' },
      { value:'asset', label:'教材解读' }
    ];
  }

  function promptPresetLabel(value){
    return promptPresetOptions().find(item => item.value === value)?.label || '常规备课';
  }

  function globalAssistantActions(){
    return [
      normalizeAssistantActionContract({
        key:'kb_search',
        title:'查找知识库',
        helper:'按当前年级、学科、课题或老师输入的关键词检索本地知识库。',
        output:'返回命中的教材、课标、教案、资源或教师偏好资料，不直接改页面。',
        scope:'knowledge_base',
        risk:'read_only',
        confirm:'none',
        reads:['knowledge_base','page_context','teacher_query'],
        writes:[]
      })
    ];
  }

  function normalizeAssistantActionContract(action = {}){
    const risk = action.risk || action.writeRisk || 'draft';
    const confirm = action.confirm || action.confirmation || (['formal_write', 'destructive', 'external'].includes(risk) ? 'required' : 'none');
    const defaultPolicy = (() => {
      if (action.policy) return action.policy;
      if (risk === 'read_only') return 'read_only';
      if (risk === 'formal_write' || risk === 'destructive' || risk === 'external') return 'confirm_card';
      if (risk === 'draft_batch' || risk === 'draft_remove') return 'execution_card';
      if (risk === 'generate') return 'choice_card';
      return 'micro_edit';
    })();
    return Object.assign({}, action, {
      key: action.key || '',
      title: action.title || action.key || '页面动作',
      helper: action.helper || action.description || '',
      output: action.output || action.helper || '',
      scope: action.scope || 'current_page',
      risk,
      confirm,
      reads: Array.isArray(action.reads) ? action.reads : [],
      writes: Array.isArray(action.writes) ? action.writes : [],
      undoable: action.undoable !== false,
      toolType: action.toolType || 'page_action',
      policy: defaultPolicy
    });
  }

  function normalizeAssistantActions(copy, workbench){
    const baseActions = workbench?.actions?.length
      ? workbench.actions
      : (copy.actions || []).map(([title, helper], index) => ({
      key: `default_${index}`,
      title,
      helper,
      output: helper
    }));
    const normalizedBaseActions = [
      ...baseActions.map(normalizeAssistantActionContract),
      ...globalAssistantActions()
    ];
    if (assistantSelectionContext?.text) {
      return [
        normalizeAssistantActionContract({
          key:'selected_rewrite',
          title:'改写选中文本',
          helper:`围绕已选中的“${assistantSelectionContext.label || '当前字段'}”局部改写。`,
          output:'我会先给候选版本，确认后只替换你选中的那段。',
          scope:'selected_text',
          risk:'draft',
          confirm:'none',
          reads:['selected_text'],
          writes:['selected_text']
        }),
        ...normalizedBaseActions
      ];
    }
    return normalizedBaseActions;
  }

  function pickAssistantAction(actions, text){
    const query = String(text || '').trim();
    if (!query) return actions[0] || null;
    if (/(目录|教材|上传资料|上传的|图片|识别到的文字|AI 对话资料).*(整理|解析|导入|填|填到|放进|开启|打开|生成|转成|变成|读|读取|识别).*(课题卡片|课题|单元|单元题目|单元标题)/
      .test(query)
      || /(整理|解析|导入|填|填到|放进|开启|打开|生成|转成|变成|读|读取|识别).*(目录|教材|上传资料|上传的|图片|识别到的文字|AI 对话资料).*(课题卡片|课题|单元|单元题目|单元标题)/
        .test(query)
      || /(课题卡片).*(整理|解析|导入|填|填到|放进|开启|打开|生成|转成|变成)/.test(query)) {
      const parseAction = actions.find(action => /planner_parse_topics|parse.*topic|topic.*parse/.test(String(action.key || '')));
      if (parseAction) return parseAction;
    }
    if (/(保留|只留|留下|筛选|整理).*(大单元|单元标题|单元课题|单元卡片)/.test(query)
      || /(删除|取消|去掉).*(具体课时|课时课题|课时内容|小课题)/.test(query)) {
      const filterAction = actions.find(action => String(action.key || '').includes('filter_units'));
      if (filterAction) return filterAction;
    }
    const keywordMap = [
      ['这段', ['selected_rewrite']],
      ['选中', ['selected_rewrite']],
      ['所选', ['selected_rewrite']],
      ['润色', ['selected_rewrite']],
      ['改写', ['selected_rewrite']],
      ['评价维度', ['assignment']],
      ['维度', ['assignment']],
      ['作评', ['assignment']],
      ['量规', ['assignment']],
      ['导入', ['process']],
      ['目标', ['goal', 'goals']],
      ['过程', ['process']],
      ['环节', ['process']],
      ['信息化', ['digital']],
      ['AI', ['digital']],
      ['资源', ['resources', 'digital']],
      ['目录', ['topic', 'parse']],
      ['教材', ['topic', 'parse', 'asset']],
      ['图片', ['topic', 'parse', 'asset']],
      ['解析', ['topic', 'parse']],
      ['导入课题', ['topic', 'parse']],
      ['作业', ['assignment']],
      ['评价', ['assignment']],
      ['挂接', ['attach', 'ready']],
      ['执行', ['attach', 'ready']],
      ['课时', ['next', 'map', 'process']],
      ['单元', ['unit', 'gap']],
      ['学期', ['semester', 'planner', 'generate']],
      ['排课', ['schedule', 'planner', 'generate']],
      ['周历', ['calendar', 'planner', 'generate']],
      ['筛选', ['filter_units']],
      ['保留', ['filter_units']],
      ['只留', ['filter_units']],
      ['单元标题', ['filter_units']],
      ['查重', ['dedupe', 'duplicate']],
      ['去重', ['dedupe', 'duplicate']],
      ['重复', ['dedupe', 'duplicate']],
      ['多的', ['dedupe', 'duplicate']],
      ['删掉', ['dedupe', 'remove', 'delete']],
      ['删除', ['dedupe', 'remove', 'delete']],
      ['新增', ['add_topic', 'topic_add']],
      ['添加', ['add_topic', 'topic_add']],
      ['增加', ['add_topic', 'topic_add']],
      ['课题卡片', ['topic', 'parse', 'add_topic']],
      ['知识库', ['kb_search']],
      ['资料库', ['kb_search']],
      ['素材库', ['kb_search']],
      ['检索', ['kb_search']],
      ['查找', ['kb_search']],
      ['搜索', ['kb_search']],
      ['保存', ['save']],
      ['写入', ['apply', 'attach', 'ready']]
    ];
    for (const [keyword, hints] of keywordMap) {
      if (query.includes(keyword)) {
        const found = actions.find(action => hints.some(hint => String(action.key || '').includes(hint)));
        if (found) return found;
      }
    }
    return actions[0] || null;
  }

  function findAssistantActionByHint(actions, hints){
    return (actions || []).find(action => hints.some(hint => String(action.key || '').includes(hint))) || null;
  }

  function resolveAssistantAction(actions, text){
    const direct = pickAssistantAction(actions, text);
    if (!isAssistantConfirmOnly(text) && !isAssistantGenericExecutionOnly(text)) return direct;
    const recent = recentAssistantContextText(10);
    if (/(评价维度|维度|量规|构图|色彩|创意构思|线条表现)/.test(recent)) {
      return findAssistantActionByHint(actions, ['assignment']) || direct;
    }
    if (/(作业要求|作业任务|作业说明)/.test(recent)) {
      return findAssistantActionByHint(actions, ['assignment']) || direct;
    }
    if (/(教学导入|导入|教学过程|过程|环节)/.test(recent)) {
      return findAssistantActionByHint(actions, ['process']) || direct;
    }
      if (/(课时目标|本课目标|教学目标)/.test(recent)) {
        return findAssistantActionByHint(actions, ['goal', 'goals']) || direct;
      }
    if (/(刚上传|上传资料|上传的|AI 对话资料|资料文件|识别到的文字|图片|教材目录).*(整理|生成|导入|解析|填|填到|放进|开启|打开|转成|变成|读取|识别).*(课题卡片|教材目录|课题|单元)/.test(recent + '\n' + text)
      || /(整理|生成|导入|解析|填|填到|放进|开启|打开|转成|变成|读取|识别).*(刚上传|上传资料|上传的|AI 对话资料|资料文件|识别到的文字|图片|教材目录).*(课题卡片|教材目录|课题|单元)/.test(recent + '\n' + text)) {
      return findAssistantActionByHint(actions, ['parse', 'topic']) || direct;
    }
    if (/(保留.*大单元|只留.*大单元|单元标题|具体课时|课时课题|单元课题卡)/.test(recent)) {
      return findAssistantActionByHint(actions, ['filter_units']) || direct;
    }
    if (/(课题卡片|重复卡片|重复课题|查重|去重|确认删除重复|删除重复)/.test(recent)) {
      return findAssistantActionByHint(actions, ['dedupe', 'duplicate']) || direct;
    }
    return direct;
  }

  function assistantModel(mode){
    const profile = ensureProfile();
    const prefs = Object.assign({ assistantTone:'简洁', reminderStyle:'少打扰', defaultAction:'先建议' }, readJson(ASSISTANT_KEY));
    const copy = assistantCopy(mode);
    const workMode = assistantWorkMode || detectAssistantWorkMode(mode);
    const workbench = assistantBridge?.getWorkbench ? assistantBridge.getWorkbench(workMode, { uploads: assistantUploads }) : null;
    const modeInfo = modeMeta(workMode);
    return {
      profile,
      prefs,
      copy,
      workbench,
      workMode,
      modeInfo,
      uploads: assistantUploads,
      title: workbench?.title || `${modeInfo.label} · ${copy.title}`,
      intro: workbench?.focus || modeInfo.hint,
      summary: workbench?.summary || `${profile.teacherName} · ${profile.preferredGrade}${profile.subject}`,
      contextItems: Array.isArray(workbench?.context) ? workbench.context : [],
      actions: normalizeAssistantActions(copy, workbench)
    };
  }

  function pushAssistantMessage(message){
    const record = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2,8)}`,
      role: message.role,
      text: message.text,
      actionKey: message.actionKey || '',
      actionTitle: message.actionTitle || '',
      actionPatch: message.actionPatch || {},
      pending: !!message.pending,
      canApply: !!message.canApply,
      actionCard: message.actionCard ? normalizeAssistantActionCard(message.actionCard) : null,
      choices: Array.isArray(message.choices)
        ? message.choices.map((choice, index) => ({
            id: choice.id || `${Date.now()}-${index}`,
            title: choice.title || `方案${index + 1}`,
            summary: choice.summary || '',
            actionPatch: choice.actionPatch || choice.action_patch || {},
            applyLabel: choice.applyLabel || choice.apply_label || '采纳并回填'
          }))
        : []
    };
    assistantConversation.push(record);
    return record;
  }

  function normalizeAssistantActionCard(card = {}){
    const action = normalizeAssistantActionContract(card.action || {});
    return {
      id: card.id || `${Date.now()}-${Math.random().toString(16).slice(2,8)}`,
      status: card.status || 'ready',
      action,
      steps: Array.isArray(card.steps) && card.steps.length ? card.steps : buildAssistantExecutionSteps(action),
      resultText: card.resultText || '',
      errorText: card.errorText || '',
      primaryLabel: card.primaryLabel || assistantExecutionPrimaryLabel(action),
      secondaryLabel: card.secondaryLabel || '取消'
    };
  }

  function removeAssistantMessage(messageId){
    assistantConversation = assistantConversation.filter(item => item.id !== messageId);
  }

  function scrollAssistantChatToBottom(){
    if (!assistantDrawerRefs?.chat) return;
    requestAnimationFrame(() => {
      assistantDrawerRefs.chat.scrollTop = assistantDrawerRefs.chat.scrollHeight;
    });
  }

  function formatFileSize(size){
    const value = Number(size || 0);
    if (!value) return '0 KB';
    if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.max(1, Math.round(value / 1024))} KB`;
  }

  function uploadSummaryText(upload){
    if (!upload) return '';
    return upload.summary || upload.excerpt || upload.text_preview || '';
  }

  function apiRootForRoute(base){
    return String(base || '').replace(/\/$/, '').replace(/\/api$/, '');
  }

  function knowledgeApiCandidates(){
    const saved = localStorage.getItem(KB_API_BASE_KEY);
    const candidates = [
      saved,
      LOCAL_API_BASE,
      LOCAL_API_BASE.includes(':8082') ? 'http://127.0.0.1:18082' : ''
    ].filter(Boolean).map(apiRootForRoute);
    return [...new Set(candidates)];
  }

  function summarizeKnowledgeContext(kbContext){
    if (!kbContext?.sections) return [];
    const rows = Object.entries(kbContext.sections).map(([section, payload]) => {
      const count = Array.isArray(payload.items) ? payload.items.length : 0;
      const names = (payload.items || [])
        .slice(0, 2)
        .map(item => item['资料名称'] || item.name || item.kb_item_id || '')
        .filter(Boolean)
        .join('、');
      return {
        label:`知识库·${section}`,
        value:`${payload.source_status || 'missing'} · ${count} 条${names ? ` · ${names}` : ''}`
      };
    });
    if (Array.isArray(kbContext.warnings) && kbContext.warnings.length) {
      rows.push({
        label:'知识库·提醒',
        value:kbContext.warnings.slice(0, 2).map(item => item.message || item.section || '').filter(Boolean).join('；')
      });
    }
    return rows;
  }

  async function fetchKnowledgeContext(pageSnapshot, model){
    if (!pageSnapshot) return null;
    const entity = pageSnapshot.entity_type || pageSnapshot.page_mode || '';
    const plannerBasics = pageSnapshot.planner_request?.basics || {};
    if (!['unit','lesson','semester_plan','semester_planner'].includes(entity)) return null;
    const payload = {
      subject: plannerBasics.subject || model?.profile?.subject || '美术',
      grade: pageSnapshot.grade_scope || plannerBasics.grade || model?.profile?.preferredGrade || '',
      unit_name: pageSnapshot.unit_name || '',
      topic_name: pageSnapshot.topic_name || '',
      lesson_context: pageSnapshot,
      limit_per_section: 2
    };
    for (const base of knowledgeApiCandidates()) {
      try {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 1800);
        const response = await fetch(`${base}/api/xiaobei/kb/context`, {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body:JSON.stringify(payload),
          signal:controller.signal
        });
        window.clearTimeout(timer);
        const body = await response.json().catch(() => ({}));
        if (response.ok && body.success) return body;
      } catch (error) {}
    }
    return null;
  }

  function asksKnowledgeSearch(text){
    const query = String(text || '').trim();
    if (!query) return false;
    return /(知识库|资料库|素材库|内容库|入库资料)/.test(query)
      && /(查|找|检索|搜索|有没有|有吗|能不能|可以|调用|调取|看一下)/.test(query);
  }

  function inferKnowledgeGrade(text, pageSnapshot, model){
    const query = String(text || '');
    const gradeMatch = query.match(/([一二三四五六])年级/);
    if (gradeMatch) return `${gradeMatch[1]}年级`;
    const plannerBasics = pageSnapshot?.planner_request?.basics || {};
    return pageSnapshot?.grade_scope || plannerBasics.grade || model?.profile?.preferredGrade || '';
  }

  function inferKnowledgeSubject(text, pageSnapshot, model){
    const query = String(text || '');
    const subjectMatch = query.match(/(美术|音乐|语文|数学|英语|科学|信息科技|体育|道德与法治)/);
    if (subjectMatch) return subjectMatch[1];
    const plannerBasics = pageSnapshot?.planner_request?.basics || {};
    return plannerBasics.subject || model?.profile?.subject || '';
  }

  function knowledgeSearchQuery(text, pageSnapshot){
    const plannerTopics = pageSnapshot?.planner_request?.topics || [];
    const activeTopicNames = Array.isArray(plannerTopics)
      ? plannerTopics.slice(0, 4).map(item => item.name).filter(Boolean).join(' ')
      : '';
    const cleaned = String(text || '')
      .replace(/你可以|能不能|可以|帮我|请|一下|吗|\?|？/g, ' ')
      .replace(/知识库|资料库|素材库|内容库|里面|里|查找|查|搜索|检索|调用|调取|有没有|有/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned || activeTopicNames || String(text || '').trim();
  }

  async function searchKnowledgeBase(text, pageSnapshot, model){
    const query = knowledgeSearchQuery(text, pageSnapshot);
    const grade = inferKnowledgeGrade(text, pageSnapshot, model);
    const subject = inferKnowledgeSubject(text, pageSnapshot, model);
    const filterAttempts = [];
    const scopedFilters = {};
    if (subject) scopedFilters['学科'] = subject;
    if (grade) scopedFilters['年级'] = grade;
    filterAttempts.push(scopedFilters);
    if (grade) filterAttempts.push({ '年级': grade });
    if (subject) filterAttempts.push({ '学科': subject });
    filterAttempts.push({});
    let lastError = null;
    const seenFilters = new Set();
    for (const filters of filterAttempts) {
      const filterKey = JSON.stringify(filters);
      if (seenFilters.has(filterKey)) continue;
      seenFilters.add(filterKey);
      for (const base of knowledgeApiCandidates()) {
        try {
          const response = await fetch(`${base}/api/xiaobei/kb/search`, {
            method:'POST',
            headers:{ 'Content-Type':'application/json' },
            body:JSON.stringify({ query, filters, limit:8 })
          });
          const body = await response.json().catch(() => ({}));
          if (response.ok && body.success) {
            if ((body.items || []).length || Object.keys(filters).length === 0) {
              return Object.assign({}, body, { used_filters: filters });
            }
          } else {
            lastError = new Error(body?.error_message || '知识库检索失败');
          }
        } catch (error) {
          lastError = error;
        }
      }
    }
    if (lastError) throw lastError;
    return { success:true, query, items:[], match_count:0, used_filters:scopedFilters };
  }

  function formatKnowledgeSearchReply(result){
    const items = Array.isArray(result?.items) ? result.items : [];
    const filters = result?.used_filters || {};
    const filterText = Object.entries(filters).map(([key, value]) => `${key}:${value}`).join('，') || '无额外筛选';
    if (!items.length) {
      return `我查了知识库，暂时没有命中“${result?.query || '当前关键词'}”。筛选条件：${filterText}。\n\n你可以换个关键词，或者先把对应教材目录/教案入库。`;
    }
    const lines = items.slice(0, 6).map((item, index) => {
      const title = item.title || item['资料名称'] || item.kb_item_id || `资料${index + 1}`;
      const meta = [item['资料类型'], item['年级'], item['单元'], item['课题']]
        .filter(Boolean)
        .join(' · ');
      const status = item.source_status || item.parse_status || 'partial';
      const excerpt = item.excerpt ? `\n   摘要：${compactText(item.excerpt, 120)}` : '';
      return `${index + 1}. ${title}${meta ? `（${meta}）` : ''} · ${status}${excerpt}`;
    });
    return `我查到 ${items.length} 条知识库资料。筛选条件：${filterText}。\n\n${lines.join('\n')}\n\n你可以继续说“用第1条整理课题卡片”或“把这些资料作为学期安排依据”。`;
  }

  function compactText(value, limit = 120){
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
  }

  function editableFieldLabel(node){
    if (!node) return '';
    const field = node.closest?.('.field');
    const label = field?.querySelector('label')?.textContent?.trim();
    if (label) return label;
    const card = node.closest?.('.process-card');
    const step = card?.querySelector('[data-field="step_name"]')?.value?.trim();
    const dataField = node.getAttribute?.('data-field') || node.id || '';
    if (step && dataField) return `${step} · ${dataField}`;
    return node.id || dataField || '当前字段';
  }

  function captureAssistantEditableSelection(node){
    if (!node || !['TEXTAREA', 'INPUT'].includes(node.tagName)) return;
    const start = Number(node.selectionStart || 0);
    const end = Number(node.selectionEnd || 0);
    if (end <= start) return;
    const selected = String(node.value || '').slice(start, end).trim();
    if (!selected) return;
    assistantSelectionContext = {
      node,
      start,
      end,
      text:selected,
      label: editableFieldLabel(node),
      fieldId: node.id || '',
      dataField: node.getAttribute('data-field') || '',
      selectedAt: Date.now()
    };
  }

  function installAssistantSelectionTracker(){
    if (assistantSelectionListenerReady) return;
    assistantSelectionListenerReady = true;
    document.addEventListener('mouseup', event => {
      const node = event.target;
      if (node && ['TEXTAREA', 'INPUT'].includes(node.tagName)) {
        window.setTimeout(() => captureAssistantEditableSelection(node), 0);
      }
    }, true);
    document.addEventListener('keyup', event => {
      const node = event.target;
      if (node && ['TEXTAREA', 'INPUT'].includes(node.tagName)) {
        captureAssistantEditableSelection(node);
      }
    }, true);
    document.addEventListener('selectionchange', () => {
      const node = document.activeElement;
      if (node && ['TEXTAREA', 'INPUT'].includes(node.tagName)) {
        captureAssistantEditableSelection(node);
      }
    });
  }

  function assistantSelectionSnapshot(){
    const item = assistantSelectionContext;
    if (!item?.text) return null;
    const node = item.node;
    return {
      text: item.text,
      label: item.label || '',
      field_id: item.fieldId || '',
      data_field: item.dataField || '',
      before: node ? compactText(String(node.value || '').slice(Math.max(0, item.start - 140), item.start), 140) : '',
      after: node ? compactText(String(node.value || '').slice(item.end, item.end + 140), 140) : ''
    };
  }

  function replaceAssistantSelectedText(nextText){
    const item = assistantSelectionContext;
    const text = String(nextText || '').trim();
    const node = item?.node;
    if (!node || !text || !['TEXTAREA', 'INPUT'].includes(node.tagName)) return false;
    const current = String(node.value || '');
    if (item.start < 0 || item.end <= item.start || item.end > current.length) return false;
    node.setRangeText(text, item.start, item.end, 'select');
    node.dispatchEvent(new Event('input', { bubbles:true }));
    const field = node.closest?.('.field, .process-card, .identity-item');
    if (field) {
      field.classList.add('assistant-fill-flash');
      window.setTimeout(() => field.classList.remove('assistant-fill-flash'), 1400);
    }
    assistantSelectionContext = {
      ...item,
      text,
      start: node.selectionStart || item.start,
      end: node.selectionEnd || (item.start + text.length),
      selectedAt: Date.now()
    };
    return true;
  }

  function assistantGreeting(model){
    const context = model.summary ? `当前在看：${model.summary}` : '';
    if (assistantMode === 'planner') {
      return `${model.profile.teacherName}，我在。你可以让我生成学期安排草案、整理教材目录、调整排课口径，或者先讨论哪些周要避开活动。${context}`.trim();
    }
    return `${model.profile.teacherName}，我在。你可以直接告诉我你想速备、精备、读教材、补目标、改过程，或者先讨论思路。${context}`.trim();
  }

  function asksAssistantCapabilities(text){
    return /(能做什么|可以做什么|具备哪些能力|会什么|能帮我什么|有什么能力)/.test(String(text || ''));
  }

  function recentAssistantContextText(limit = 8){
    return assistantConversation
      .slice(-limit)
      .map(item => item.text || '')
      .join('\n');
  }

  function isAssistantConfirmOnly(text){
    return /^(确认|确认删除重复卡片|确认删除重复|确认去重|加进去|填进去|写进去|放进去|帮我填进去|帮我加进去|就这样|可以|好|好的|行|OK|ok|保存一下|存一下)[。！! ]*$/.test(String(text || '').trim());
  }

  function isAssistantGenericExecutionOnly(text){
    const query = String(text || '').trim();
    if (!/^(开始|开始吧|去做|执行|生成|回填|填入|写入|应用|采纳|做吧|搞吧|直接做|直接生成|帮我做|跑|开始回填|直接回填|回填到页面)[。！! ]*$/.test(query)) return false;
    return !/(评价维度|维度|量规|作业|目标|导入|过程|环节|资源|信息化|单元|课时|这段|选中|所选)/.test(query);
  }

  function recentAssistantContextSuggestsFill(){
    return /(评价维度|维度|量规|构图|色彩|创意构思|线条表现|作业要求|作业任务|教学导入|教学过程|课时目标|本课目标|教学目标|学期安排|周历|排课草案|教材目录|课题卡片|重复课题|重复卡片|查重|去重)/.test(recentAssistantContextText(10));
  }

  function wantsAssistantExecution(text){
    const query = String(text || '').trim();
    if (/(整理|解析|导入|开启|打开|填到|放进|转成|变成|读取|识别).*(课题卡片|教材目录|目录|课题|单元)/.test(query)
      || /(课题卡片|教材目录|目录|课题|单元).*(整理|解析|导入|开启|打开|填到|放进|转成|变成|读取|识别)/.test(query)) return true;
    if (/(开始|去做|执行|生成|回填|填入|填进去|加进去|写入|写进去|放进去|应用|采纳|做吧|搞吧|直接做|直接生成|帮我做|帮我填进去|帮我加进去|开始吧|跑|查重|去重|清理重复|删除重复|新增|添加|增加)/.test(query)) return true;
    return isAssistantConfirmOnly(query) && recentAssistantContextSuggestsFill();
  }

  function wantsAssistantChoices(text){
    return /(方案|版本|候选|几版|两版|三版|2版|3版|几个版本|给我一版|给我两版|先来一版|先起一版|底稿)/.test(String(text || ''));
  }

  function inferAssistantTargetFromText(text){
    const query = String(text || '').trim();
    if (!query) return {};
    const patch = {};
    if (/(这段|选中|所选|当前这段|刚才选的|润色|改写)/.test(query) && assistantSelectionContext?.text) {
      patch.targetField = 'selected_text';
    }
    const lessonStepMap = [
      ['课前角色调查与分组', /(课前|分组|角色调查|角色分组)/],
      ['教学导入', /(导入|开场|引入)/],
      ['欣赏与解析', /(欣赏|解析|分析)/],
      ['实践与探索', /(实践|探索|尝试|练习)/],
      ['手绘创作', /(手绘|创作|作画|绘制)/],
      ['作品展示与评价', /(作品展示|展示与评价|展示评价|讲评|互评)/],
      ['结束与拓展', /(结束|拓展|延伸|收束)/],
    ];
    const matchedStep = lessonStepMap.find(([, pattern]) => pattern.test(query));
    if (matchedStep) {
      patch.targetStepName = matchedStep[0];
      patch.targetField = 'lesson_process';
      return patch;
    }
    const fieldRules = [
      { field:'dimension_summary', pattern:/(评价维度|维度|量规|评价标准|评价要点|rubric)/i },
      { field:'assignment_requirement', pattern:/(作业要求|作业任务|作业说明|作业|assignment)/i },
      { field:'lesson_goals', pattern:/(课时目标|本课目标|教学目标|目标)/i },
      { field:'lesson_process', pattern:/(教学过程|过程|环节|七段|7段)/i },
      { field:'resource_notes', pattern:/(资源|素材|ppt|学习单|平台|上传|信息化|AI支撑|数字工具)/i },
      { field:'core_literacy_goals', pattern:/(单元目标|核心素养|素养目标)/i },
      { field:'resource_list', pattern:/(资源总表|单元资源|资源清单)/i },
      { field:'assignment_overview', pattern:/(作评总表|作业总览|评价总览|单元作评)/i },
      { field:'core_task', pattern:/(核心任务|表现性任务|单元任务)/i },
      { field:'cross_discipline', pattern:/(跨学科|融合点)/i },
      { field:'support_strategy', pattern:/(分层|支持策略|差异化)/i }
    ];
    const matchedField = fieldRules.find(item => item.pattern.test(query));
    if (matchedField) patch.targetField = matchedField.field;
    return patch;
  }

  function inferAssistantActionPatch(text, actionKey){
    const query = String(text || '').trim();
    if (!query) return {};
    const patch = inferAssistantTargetFromText(query);
    if (actionKey === 'lesson_assignment') {
      if (/(评价维度|维度|量规|rubric)/i.test(query)) patch.targetField = 'dimension_summary';
      else if (/(作业要求|作业任务|作业说明|assignment)/i.test(query)) patch.targetField = 'assignment_requirement';
      else if (/(评价维度|维度|量规|构图|色彩|创意构思|线条表现)/.test(recentAssistantContextText(10))) patch.targetField = 'dimension_summary';
    }
    if (actionKey === 'lesson_digital' && /(资源|素材|ppt|学习单|平台|上传|信息化)/i.test(query)) {
      patch.targetField = 'resource_notes';
    }
    if (actionKey === 'lesson_process') {
      if (patch.targetStepName) patch.targetField = 'lesson_process';
    }
    if (actionKey === 'unit_goals' && /(目标|核心素养|素养目标)/.test(query)) {
      patch.targetField = 'core_literacy_goals';
    }
    if (actionKey === 'unit_resources') {
      if (/(资源|素材|学习单|ppt)/i.test(query)) patch.targetField = 'resource_list';
      if (/(作评|评价|作业|量规)/i.test(query)) patch.targetField = patch.targetField || 'assignment_overview';
    }
    if (actionKey === 'planner_dedupe_topics' && /(确认删除|确认去重|删除重复|开始删除|执行删除|确认清理)/.test(query)) {
      patch.confirmed = true;
    }
    if (actionKey === 'planner_add_topic') {
      const nameMatch = query.match(/(?:新增|添加|增加|加一张|开一张)(?:一个|一条|一张)?(?:课题卡片|课题卡|课题)?[：:，, ]*([^，。；;]*)/);
      const topicName = (nameMatch?.[1] || '').trim();
      if (topicName && !/^(课题卡片|课题卡|课题)$/.test(topicName)) patch.topicName = topicName;
      const hoursMatch = query.match(/(\d+)\s*(?:课时|节)/);
      if (hoursMatch) patch.hours = hoursMatch[1];
      const typeMatch = query.match(/(教材|活动|项目|复习)/);
      if (typeMatch) patch.topicType = typeMatch[1];
    }
    if (actionKey === 'planner_parse_topics') {
      const combined = `${recentAssistantContextText(10)}\n${query}`;
      const hasUploadSource = /(刚上传|上传资料|上传的|AI 对话资料|资料文件|识别到的文字|这份资料|这些资料|刚才的资料|图片|教材目录|三年级目录|四年级目录)/.test(combined);
      const hasTopicTarget = /(课题卡片|课题|单元题目|单元标题|单元课题|单元)/.test(combined);
      const hasParseIntent = /(整理|解析|导入|填|填到|放进|开启|打开|生成|转成|变成|读取|读一下|识别|看一下)/.test(combined);
      if (hasUploadSource && hasTopicTarget && hasParseIntent) patch.source = 'assistant_uploads';
    }
    return patch;
  }

  function extractDimensionLabelsFromConversation(){
    const recent = recentAssistantContextText(10).replace(/\*\*/g, '');
    const labels = [];
    const addLabel = label => {
      const clean = String(label || '')
        .replace(/^[\s\-—:：]+/, '')
        .replace(/[。；;，,、/].*$/, '')
        .trim();
      if (!clean) return;
      if (/^(维度|评价|建议|目前|当前|如果|直接|下一步)/.test(clean)) return;
      labels.push(clean);
    };
    let match;
    const numberedPattern = /维度\s*\d*\s*[：:]\s*([^\n—\-。；;]+)/g;
    while ((match = numberedPattern.exec(recent))) {
      addLabel(match[1]);
    }
    const groupedPattern = /(四个维度|维度确认|维度已保存|维度齐了)[^：:\n]*[：:]\s*([^\n。]+)/g;
    while ((match = groupedPattern.exec(recent))) {
      String(match[2] || '').split(/[、，,\/]/).forEach(addLabel);
    }
    const commonDimensions = [
      { label:'构图', pattern:/(画面构图|构图)/ },
      { label:'色彩', pattern:/(色彩表现|色彩)/ },
      { label:'创意构思', pattern:/(创意构思|创意表达|想象力)/ },
      { label:'线条表现', pattern:/(线条表现|线条)/ },
      { label:'细节刻画', pattern:/(细节刻画|细节)/ },
      { label:'主题表达', pattern:/(主题表达|主题表现)/ },
      { label:'完成度', pattern:/(完成度|完整度)/ }
    ];
    commonDimensions.forEach(item => {
      if (item.pattern.test(recent)) labels.push(item.label);
    });
    const normalized = labels.map(label => {
      if (/构图/.test(label)) return '构图';
      if (/色彩/.test(label)) return '色彩';
      if (/(创意|想象)/.test(label)) return '创意构思';
      if (/线条/.test(label)) return '线条表现';
      if (/细节/.test(label)) return '细节刻画';
      if (/主题/.test(label)) return '主题表达';
      if (/(完成|完整)/.test(label)) return '完成度';
      return label;
    });
    return [...new Set(normalized)].slice(0, 6);
  }

  function inferAssistantGeneratedPatchFromConversation(text, action){
    const actionKey = String(action?.key || '');
    if (actionKey === 'planner_parse_topics') {
      const patch = inferAssistantActionPatch(text, actionKey);
      if (patch.source === 'assistant_uploads') {
        return {
          source:'assistant_uploads',
          uploads:assistantUploads.slice(-6)
        };
      }
      return {};
    }
    if (actionKey !== 'lesson_assignment') return {};
    const recent = `${recentAssistantContextText(10)}\n${String(text || '')}`;
    if (!/(评价维度|维度|量规|构图|色彩|创意构思|线条表现)/.test(recent)) return {};
    const dimensions = extractDimensionLabelsFromConversation();
    if (!dimensions.length) return {};
    return {
      targetField:'dimension_summary',
      generated:{
        dimension_lines:[`评价维度：${dimensions.join(' / ')}`]
      },
      choiceTitle:'刚才确认的评价维度'
    };
  }

  function hasAssistantGeneratedPatch(patch){
    const generated = patch?.generated || {};
    if (patch?.source === 'assistant_uploads' && Array.isArray(patch.uploads) && patch.uploads.length) return true;
    return ['lesson_goals', 'assignment_lines', 'dimension_lines', 'resource_lines', 'process_steps']
      .some(key => Array.isArray(generated[key]) && generated[key].length);
  }

  function capabilityReply(model){
    if (assistantMode === 'planner') {
      return '我现在在学期安排页的能力是：读取教师课表、教材课题卡、节假日和特殊活动，生成学期周历草案；也可以整理教材目录、切换保守/正常/紧凑排课口径、保存草案，并在你确认后写入当前安排。';
    }
    if (model.workMode === 'fast') {
      return '我现在的速备能力是：读当前内容库上下文、参考你上传的教材/教案/PPT 说明、快速起单元底稿、快速起课时底稿、补 7 段教学过程骨架、补资源与作评骨架。你如果确认要我动手，直接说“开始速备”或“生成这节课底稿”。';
    }
    return '我现在的精备能力是：基于当前单元和课时继续讨论、补目标、改导入、细化教学过程、补资源与作评、对比旧稿、把确认过的内容回填到页面。你如果确认要我动手，直接说“开始精备”或“把这段补上”。';
  }

  function discussionReply(text, action, model){
    if (asksAssistantCapabilities(text)) {
      return { text: capabilityReply(model), canApply: false };
    }
    if (action && wantsAssistantChoices(text)) {
      const choices = assistantBridge?.previewAction
        ? assistantBridge.previewAction(action.key, action, assistantWorkMode, text) || []
        : [];
      return {
        text: choices.length
          ? `可以。关于“${action.title}”，我先给你 ${choices.length} 个候选版本。你先挑一版，我再回填到页面。`
          : `可以。我建议先做“${action.title}”。${action.helper || ''} 如果你确认我现在开始，就直接回我“开始”或“去做”。`,
        canApply: false,
        choices
      };
    }
    if (action) {
      return {
        text:'可以，我们先把要求聊清楚。你如果想先看 2 到 3 个候选版本，就直接说“给我两版”或“先起一版”；如果已经确定要我执行，就直接说“开始”。',
        canApply: false
      };
    }
    return {
      text:'我先理解你的意思了。你可以继续说细一点；如果你已经想让我动手，就直接回我“开始”“去做”或者“回填到页面”。',
      canApply: false
    };
  }

  function choiceIndexFromText(text){
    const query = String(text || '').trim();
    const rules = [
      { index:0, pattern:/(第?\s*1\s*版|第一版|一版|方案\s*1|第一个|第一条|用一|采用一)/ },
      { index:1, pattern:/(第?\s*2\s*版|第二版|二版|方案\s*2|第二个|第二条|用二|采用二)/ },
      { index:2, pattern:/(第?\s*3\s*版|第三版|三版|方案\s*3|第三个|第三条|用三|采用三)/ }
    ];
    const found = rules.find(item => item.pattern.test(query));
    return found ? found.index : -1;
  }

  function referencesStoredChoice(text){
    return choiceIndexFromText(text) >= 0 && /(用|采用|采纳|填|回填|写入|应用|就它|选|按)/.test(String(text || ''));
  }

  function choiceListText(choices){
    return choices.map((choice, index) => {
      const summary = choice.summary ? `：${choice.summary}` : '';
      return `${index + 1}. ${choice.title}${summary}`;
    }).join('\n');
  }

  function storeAssistantChoices({ actionKey, actionTitle, actionPatch, choices }){
    if (!Array.isArray(choices) || !choices.length) return null;
    assistantLastChoiceSet = {
      actionKey,
      actionTitle,
      actionPatch: actionPatch || {},
      choices,
      createdAt: Date.now()
    };
    return assistantLastChoiceSet;
  }

  function narrowActionForTarget(actionKey, actionTitle, patch){
    const targetField = String(patch?.targetField || '');
    const targetStepName = String(patch?.targetStepName || '');
    if (actionKey === 'selected_rewrite') {
      return { key:'selected_rewrite', title:'改写选中文本' };
    }
    if (targetField === 'selected_text') {
      return { key:'selected_rewrite', title:'改写选中文本' };
    }
    if (assistantMode === 'lesson_design') {
      if (targetField === 'dimension_summary' || targetField === 'assignment_requirement') {
        return { key:'lesson_assignment', title: targetField === 'dimension_summary' ? '补评价维度' : '补作业要求' };
      }
      if (targetField === 'lesson_goals') {
        return { key:'lesson_goals', title:'补课时目标' };
      }
      if (targetField === 'resource_notes') {
        return { key:'lesson_digital', title:'补资源与信息化支撑' };
      }
      if (targetField === 'lesson_process' || targetStepName) {
        return { key:'lesson_process', title: targetStepName ? `补${targetStepName}` : '补教学过程' };
      }
    }
    if (assistantMode === 'unit_design') {
      if (targetField === 'core_literacy_goals') {
        return { key:'unit_goals', title:'补单元目标' };
      }
      if (['resource_list','assignment_overview','cross_discipline','support_strategy'].includes(targetField)) {
        return { key:'unit_resources', title: targetField === 'resource_list' ? '补资源总表' : targetField === 'assignment_overview' ? '补作评总表' : '补资源与作评骨架' };
      }
      if (targetField === 'core_task') {
        return { key:'fast_fill_unit', title:'补核心任务' };
      }
    }
    return { key: actionKey, title: actionTitle };
  }

  function applyStoredAssistantChoiceFromText(text){
    if (!assistantLastChoiceSet?.choices?.length) return false;
    const index = choiceIndexFromText(text);
    if (index < 0 || !assistantLastChoiceSet.choices[index]) return false;
    const model = assistantModel(assistantMode);
    const baseAction = model.actions.find(item => item.key === assistantLastChoiceSet.actionKey);
    const userPatch = inferAssistantActionPatch(text, assistantLastChoiceSet.actionKey || baseAction?.key || '');
    const narrowed = narrowActionForTarget(
      assistantLastChoiceSet.actionKey || baseAction?.key || '',
      assistantLastChoiceSet.actionTitle || baseAction?.title || '',
      userPatch
    );
    const message = {
      actionKey: narrowed.key,
      actionTitle: narrowed.title,
      actionPatch: Object.assign({}, assistantLastChoiceSet.actionPatch || {}, userPatch),
      choices: assistantLastChoiceSet.choices
    };
    const choice = assistantLastChoiceSet.choices[index];
    pushAssistantMessage({ role:'assistant', text:`好，我按“${choice.title}”这一版处理${userPatch.targetStepName ? `，只填“${userPatch.targetStepName}”` : ''}${userPatch.targetField ? '，只改指定字段' : ''}。` });
    applyAssistantChoice(message, choice, { skipSelectionMessages:true });
    assistantLastChoiceSet = null;
    return true;
  }

  async function fileToBase64(file){
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let index = 0; index < bytes.length; index += 1) {
      binary += String.fromCharCode(bytes[index]);
    }
    return btoa(binary);
  }

  async function ingestAssistantFiles(files){
    const payloadFiles = await Promise.all(Array.from(files || []).map(async file => ({
      name: file.name,
      size: file.size,
      type: file.type || '未知类型',
      data_base64: await fileToBase64(file)
    })));
    let lastError = null;
    for (const base of API_BASE_CANDIDATES) {
      try {
        const response = await fetch(`${base}/api/xiaobei/assistant/ingest_files`, {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({ files: payloadFiles })
        });
        const body = await response.json().catch(() => null);
        if (response.ok && body?.success) {
          return body.files || [];
        }
        lastError = new Error(body?.error_message || `${base} 资料解析失败`);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('资料解析失败');
  }

  async function handleAssistantFiles(files, options = {}){
    const rawList = Array.from(files || []);
    if (!rawList.length) return;
    let parsedList = [];
    try {
      parsedList = await ingestAssistantFiles(rawList);
    } catch (error) {
      parsedList = rawList.map(file => ({
        id: `${Date.now()}-${Math.random().toString(16).slice(2,8)}`,
        name: file.name,
        size: file.size,
        type: file.type || '未知类型',
        extension: (file.name.split('.').pop() || '').toLowerCase(),
        status:'fallback',
        summary:'当前本地解析失败，先仅保留文件信息。',
        excerpt:'',
        text_preview:''
      }));
      pushAssistantMessage({
        role:'assistant',
        text:`这些资料已经加入上下文，但本地解析暂时失败：${error?.message || '未知错误'}。我先按文件名和当前页面继续协助你。`
      });
    }
    assistantUploads = [...assistantUploads, ...parsedList].slice(-10);
    const uploadSummary = parsedList.map(item => item.name).join('、');
    const imageCount = parsedList.filter(item => /^image\//.test(item.type || '') || ['.png','.jpg','.jpeg','.webp','.bmp','png','jpg','jpeg','webp','bmp'].includes(String(item.extension || '').toLowerCase())).length;
    const imageParsedCount = parsedList.filter(item => /^image\//.test(item.type || '') && item.status === 'parsed').length;
    const imageWaitingCount = parsedList.filter(item => /^image\//.test(item.type || '') && item.status === 'image_metadata').length;
    const imageHint = imageCount
      ? (imageParsedCount
        ? `其中 ${imageParsedCount} 张图片已经读出文字或视觉摘要。`
        : (imageWaitingCount ? `其中 ${imageWaitingCount} 张图片已读取尺寸；如果要完整理解图片内容，需要接入视觉模型。` : ''))
      : '';
    pushAssistantMessage({
      role:'assistant',
      text:`已加入 AI 对话资料：${uploadSummary}。${imageHint}这次只进入小备上下文，不会自动改课题卡片区；如果要整理成课题卡片，你可以明确说“用刚上传的资料整理课题卡片”，或者从课题卡片区上传教材目录。`
    });
    if (options.applyToPage && assistantBridge?.onFilesAdded) {
      const result = assistantBridge.onFilesAdded(parsedList, assistantWorkMode);
      if (result?.text) {
        pushAssistantMessage({ role:'assistant', text: result.text });
      }
    }
    renderAssistantDrawer();
  }

  async function requestAssistantReply(model, text, extra = {}){
    const baseSnapshot = assistantBridge?.getAssistantSnapshot
      ? assistantBridge.getAssistantSnapshot(assistantWorkMode)
      : null;
    const selection = assistantSelectionSnapshot();
    const pageSnapshot = baseSnapshot && selection
      ? Object.assign({}, baseSnapshot, { selected_text_context: selection })
      : baseSnapshot;
    const knowledgeContext = await fetchKnowledgeContext(pageSnapshot, model);
    const contextItems = knowledgeContext
      ? [...(model.contextItems || []), ...summarizeKnowledgeContext(knowledgeContext)]
      : model.contextItems;
    const rawHistory = assistantConversation.slice(-12);
    if (rawHistory.length) {
      const last = rawHistory[rawHistory.length - 1];
      if (last?.role === 'user' && String(last.text || '').trim() === String(text || '').trim()) {
        rawHistory.pop();
      }
    }
    const conversationHistory = rawHistory.map(item => ({
      role:item.role,
      text:item.text
    }));
    const payload = {
        page_mode: assistantMode,
        work_mode: model.workMode,
        prompt_preset: assistantPromptPreset,
        force_action_key: extra.forceActionKey || '',
        force_choices: !!extra.forceChoices,
        user_text: text,
        teacher_profile: model.profile,
        summary: model.summary,
        focus: model.intro,
        context_items: contextItems,
        uploads: model.uploads,
        actions: model.actions,
        page_snapshot: pageSnapshot,
        knowledge_context: knowledgeContext,
        conversation_history: conversationHistory
      };
    let lastError = null;
    for (const base of API_BASE_CANDIDATES) {
      try {
        const response = await fetch(`${base}/api/xiaobei/assistant/workstation/reply`, {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify(payload)
        });
        const body = await response.json().catch(() => null);
        if (response.ok && body?.success && body?.reply) {
          return body.reply;
        }
        lastError = new Error(body?.error_message || `${base} assistant_workstation_reply_failed`);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('assistant_workstation_reply_failed');
  }

  function ensureAssistantConversation(mode){
    const model = assistantModel(mode);
    if (assistantConversationMode !== mode || !assistantConversation.length) {
      assistantConversationMode = mode;
      assistantConversation = [];
      assistantLastChoiceSet = null;
      pushAssistantMessage({
        role:'assistant',
        text:assistantGreeting(model)
      });
    }
    return model;
  }

  function mergeAssistantActionContract(action){
    if (!action) return null;
    const model = assistantModel(assistantMode);
    const registered = (model.actions || []).find(item => item.key === action.key) || {};
    return normalizeAssistantActionContract(Object.assign({}, registered, action));
  }

  function actionNeedsTeacherConfirm(action){
    if (!action) return false;
    if (action.confirmed) return false;
    return action.confirm === 'required';
  }

  function actionPolicy(action){
    const normalized = normalizeAssistantActionContract(action || {});
    return normalized.policy || 'micro_edit';
  }

  function pendingActionConfirmText(action){
    const riskText = action.risk === 'formal_write'
      ? '这会写入正式安排或改变当前主流程。'
      : action.risk === 'destructive'
        ? '这会删除或移除页面数据。'
        : '这会修改当前页面内容。';
    return `我已经准备好执行“${action.title}”。${riskText}\n\n请先看清楚下面的执行范围，再点击按钮确认。`;
  }

  function isPendingActionConfirmation(text){
    return !!assistantPendingAction && /^(确认执行|确认|继续|可以|好|好的|执行吧|开始执行|确认写入|确认删除)[。！! ]*$/.test(String(text || '').trim());
  }

  function persistAssistantActionLog(){
    try {
      const safeLog = assistantActionLog.slice(-80).map(item => ({
        at:item.at,
        key:item.key,
        title:item.title,
        risk:item.risk,
        policy:item.policy,
        scope:item.scope,
        source:item.source,
        writes:item.writes,
        uploadsCount:item.uploadsCount,
        confirmed:item.confirmed,
        resultText:item.resultText,
        status:item.status
      }));
      localStorage.setItem(ASSISTANT_ACTION_LOG_KEY, JSON.stringify(safeLog));
    } catch(error) {
      // Local logging should never block the assistant workflow.
    }
  }

  function recordAssistantAction(action, result){
    assistantActionLog.push({
      at:new Date().toISOString(),
      key:action.key,
      title:action.title,
      risk:action.risk,
      policy:action.policy,
      scope:action.scope,
      source:action.source || '',
      writes:Array.isArray(action.writes) ? action.writes.slice(0, 6) : [],
      uploadsCount:Array.isArray(action.uploads) ? action.uploads.length : 0,
      confirmed:!!action.confirmed,
      resultText:result?.text || '',
      status:result?.status || 'done'
    });
    assistantActionLog = assistantActionLog.slice(-80);
    persistAssistantActionLog();
  }

  function rememberAssistantUndo(action, beforeSnapshot, result){
    if (!assistantBridge?.restoreAssistantSnapshot || !beforeSnapshot || action.undoable === false) return;
    assistantActionLog[assistantActionLog.length - 1] = Object.assign({}, assistantActionLog[assistantActionLog.length - 1] || {}, {
      undoSnapshot: beforeSnapshot,
      undoActionTitle: action.title,
      canUndo: true
    });
    persistAssistantActionLog();
    pushAssistantMessage({
      role:'assistant',
      text:`${result?.text || '已完成当前动作。'}\n\n如果不合适，可以点下面的按钮撤销本次操作。`,
      actionKey:'undo_last_action',
      actionTitle:'撤销本次操作',
      canApply:true
    });
  }

  function undoLastAssistantAction(){
    const last = [...assistantActionLog].reverse().find(item => item.canUndo && item.undoSnapshot);
    if (!last || !assistantBridge?.restoreAssistantSnapshot) {
      pushAssistantMessage({ role:'assistant', text:'目前没有可撤销的页面操作。' });
      renderAssistantDrawer();
      return;
    }
    const result = assistantBridge.restoreAssistantSnapshot(last.undoSnapshot) || {};
    last.canUndo = false;
    persistAssistantActionLog();
    pushAssistantMessage({ role:'assistant', text:result.text || `已撤销“${last.undoActionTitle || '上一步'}”。` });
    renderAssistantDrawer();
  }

  function assistantActionFieldLabel(value){
    const map = {
      teacher_schedule:'教师课表',
      topic_cards:'课题卡片区',
      activities:'特殊安排',
      planner_basics:'基础信息',
      topic_seed_text:'教材目录文本',
      uploaded_materials:'上传资料',
      semester_plan_draft:'学期草案',
      local_draft:'本地草案',
      semester_calendar:'学期安排',
      current_semester_calendar:'当前正式安排',
      chat_instruction:'你的聊天指令',
      knowledge_base:'知识库',
      page_context:'当前页面上下文',
      teacher_query:'你的检索问题',
      selected_text:'选中文本'
    };
    return map[value] || value || '当前页面';
  }

  function assistantActionRiskLabel(action){
    const risk = action?.risk || 'draft';
    if (risk === 'formal_write') return '正式写入，执行前必须确认';
    if (risk === 'destructive') return '删除/破坏性操作，执行前必须确认';
    if (risk === 'draft_remove') return '会修改草稿内容，先检查再确认';
    if (risk === 'draft_batch') return '批量修改草稿区，执行前先预览动作';
    if (risk === 'draft_save') return '保存草稿，不覆盖正式数据';
    if (risk === 'read_only') return '只读检索，不修改页面';
    return '草稿区操作，可继续编辑';
  }

  function assistantExecutionPrimaryLabel(action){
    if (action?.risk === 'formal_write') return '确认写入';
    if (action?.risk === 'destructive') return '确认执行';
    if (action?.risk === 'draft_remove') return '执行检查';
    if (action?.risk === 'draft_batch') return '执行';
    if (action?.risk === 'read_only') return '开始检索';
    return '执行';
  }

  function buildAssistantExecutionSteps(action){
    const reads = (action.reads || []).map(assistantActionFieldLabel).join('、') || '当前页面上下文';
    const writes = (action.writes || []).map(assistantActionFieldLabel).join('、') || '不写入页面';
    return [
      { label:'读取上下文', detail:reads },
      { label:'执行动作', detail:action.title || '页面动作' },
      { label:'更新预览', detail:writes }
    ];
  }

  function queueAssistantExecutionCard(action, options = {}){
    const merged = mergeAssistantActionContract(action);
    if (!merged) return null;
    return pushAssistantMessage({
      role:'assistant',
      text:options.text || '我准备执行下面这个页面动作。',
      actionCard:{
        action:merged,
        status:'ready',
        steps:buildAssistantExecutionSteps(merged),
        primaryLabel:options.primaryLabel || assistantExecutionPrimaryLabel(merged)
      }
    });
  }

  function setAssistantActionCardStatus(messageId, status, patch = {}){
    const message = assistantConversation.find(item => item.id === messageId);
    if (!message?.actionCard) return null;
    message.actionCard = Object.assign({}, message.actionCard, patch, { status });
    return message.actionCard;
  }

  function assistantScopeSelectors(action){
    const scope = action?.scope || '';
    const selectors = [];
    if (scope === 'topic_cards' || (action?.writes || []).includes('topic_cards')) selectors.push('#topicCards');
    if (scope === 'semester_planner' || (action?.writes || []).includes('semester_plan_draft')) selectors.push('.planner-output, main');
    if (scope === 'semester_calendar' || (action?.writes || []).includes('current_semester_calendar')) selectors.push('main');
    if (scope === 'selected_text') selectors.push('.field:focus-within, .process-card:focus-within');
    return selectors;
  }

  function highlightAssistantActionScope(action){
    assistantScopeSelectors(action).forEach(selector => {
      document.querySelectorAll(selector).forEach(node => {
        node.classList.add('assistant-action-scope-active');
        window.setTimeout(() => node.classList.remove('assistant-action-scope-active'), 1800);
      });
    });
  }

  function executeAssistantActionFromCard(messageId){
    const message = assistantConversation.find(item => item.id === messageId);
    const card = message?.actionCard;
    if (!card?.action || card.status === 'running') return;
    const shouldConfirmByButton = card.action.confirm === 'required'
      || card.action.risk === 'formal_write'
      || card.action.risk === 'destructive';
    const action = Object.assign({}, card.action, {
      confirmed: !!card.action.confirmed || shouldConfirmByButton
    });
    setAssistantActionCardStatus(messageId, 'running');
    renderAssistantDrawer();
    highlightAssistantActionScope(action);
    window.setTimeout(() => {
      try {
        executeAssistantActionNow(action, { sourceMessageId:messageId });
      } catch (error) {
        setAssistantActionCardStatus(messageId, 'error', {
          errorText:error?.message || '执行失败'
        });
        renderAssistantDrawer();
      }
    }, 120);
  }

  function cancelAssistantActionCard(messageId){
    const message = assistantConversation.find(item => item.id === messageId);
    setAssistantActionCardStatus(messageId, 'cancelled', { resultText:'已取消，本次没有修改页面。' });
    if (message?.actionCard?.action) {
      recordAssistantAction(message.actionCard.action, { text:'已取消，本次没有修改页面。', status:'cancelled' });
    }
    renderAssistantDrawer();
  }

  function applyPendingAssistantAction(){
    if (!assistantPendingAction) return false;
    const action = Object.assign({}, assistantPendingAction, { confirmed:true });
    assistantPendingAction = null;
    queueAssistantExecutionCard(action, { text:`好，我准备执行“${action.title}”。` });
    return true;
  }

  function applyAssistantAction(action){
    if (!action || !assistantBridge?.applyAction) return;
    action = mergeAssistantActionContract(action);
    if (action.key === 'selected_rewrite') {
      const nextText = action?.generated?.selected_rewrite_text || action?.selected_rewrite_text || action?.choiceSummary || '';
      const replaced = replaceAssistantSelectedText(nextText);
      pushAssistantMessage({
        role:'assistant',
        text: replaced ? '已替换你选中的那段文字。' : '我没找到可替换的选中文本，请先在左侧文本框里选中一段。'
      });
      renderAssistantDrawer();
      return;
    }
    if (actionNeedsTeacherConfirm(action)) {
      assistantPendingAction = action;
      queueAssistantExecutionCard(action, { text:pendingActionConfirmText(action), primaryLabel:assistantExecutionPrimaryLabel(action) });
      renderAssistantDrawer();
      return;
    }
    const policy = actionPolicy(action);
    if (policy === 'read_only' || policy === 'micro_edit') {
      highlightAssistantActionScope(action);
      executeAssistantActionNow(action);
      return;
    }
    queueAssistantExecutionCard(action);
    renderAssistantDrawer();
  }

  function executeAssistantActionNow(action, options = {}){
    if (!action || !assistantBridge?.applyAction) return;
    action = mergeAssistantActionContract(action);
    if (action.key === 'undo_last_action') {
      undoLastAssistantAction();
      return;
    }
    if (action.key === 'selected_rewrite') {
      const nextText = action?.generated?.selected_rewrite_text || action?.selected_rewrite_text || action?.choiceSummary || '';
      const replaced = replaceAssistantSelectedText(nextText);
      const text = replaced ? '已替换你选中的那段文字。' : '我没找到可替换的选中文本，请先在左侧文本框里选中一段。';
      if (options.sourceMessageId) {
        setAssistantActionCardStatus(options.sourceMessageId, replaced ? 'done' : 'error', {
          resultText:text,
          errorText:replaced ? '' : text
        });
      } else {
        pushAssistantMessage({ role:'assistant', text });
      }
      renderAssistantDrawer();
      return;
    }
    const beforeSnapshot = assistantBridge?.getUndoSnapshot ? assistantBridge.getUndoSnapshot(action) : null;
    const result = assistantBridge.applyAction(action.key, action, assistantWorkMode) || {};
    recordAssistantAction(action, result);
    if (options.sourceMessageId) {
      setAssistantActionCardStatus(options.sourceMessageId, 'done', {
        resultText:result.text || '已完成当前动作。'
      });
    }
    if (result.type === 'navigate' && result.url) {
      window.location.href = result.url;
      return;
    }
    const text = result.text || '已处理当前动作。';
    if (!options.sourceMessageId) {
      if (actionPolicy(action) === 'micro_edit' && beforeSnapshot && action.undoable !== false) {
        rememberAssistantUndo(action, beforeSnapshot, result);
      } else {
        pushAssistantMessage({ role:'assistant', text });
      }
    }
    renderAssistantDrawer();
  }

  function applyAssistantChoice(message, choice, options = {}){
    if (!message?.actionKey || !choice) return;
    const model = assistantModel(assistantMode);
    const baseAction = model.actions.find(item => item.key === message.actionKey);
    const mergedAction = Object.assign({}, baseAction || {}, {
      key: message.actionKey,
      title: message.actionTitle || baseAction?.title || choice.title,
      variant: choice.actionPatch?.variant || '',
      choiceTitle: choice.title,
      choiceSummary: choice.summary
    }, message.actionPatch || {}, choice.actionPatch || {});
    if (!options.skipSelectionMessages) {
      pushAssistantMessage({ role:'user', text:`采用：${choice.title}` });
      pushAssistantMessage({ role:'assistant', text:`好，我按“${choice.title}”这版回填到页面。` });
    }
    applyAssistantAction(mergedAction);
  }

  function assistantActionCardMarkup(message){
    const card = message.actionCard;
    if (!card?.action) return '';
    const action = card.action;
    const statusText = {
      ready:'等待确认',
      running:'执行中',
      done:'已完成',
      error:'执行失败',
      cancelled:'已取消'
    }[card.status] || '等待确认';
    const readonly = action.risk === 'read_only';
    const modifier = card.status === 'running' ? 'running' : card.status === 'done' ? 'done' : card.status === 'error' ? 'error' : card.status === 'cancelled' ? 'cancelled' : 'ready';
    return `
      <div class="assistant-execution-card ${modifier}">
        <div class="assistant-execution-head">
          <span class="assistant-execution-status">${statusText}</span>
          <strong>${action.title}</strong>
        </div>
        <p>${action.helper || action.output || '小备将执行这个页面动作。'}</p>
        <div class="assistant-execution-meta">
          <span>范围：${assistantActionFieldLabel(action.scope)}</span>
          <span>风险：${assistantActionRiskLabel(action)}</span>
        </div>
        <div class="assistant-execution-steps">
          ${card.steps.map((step, index) => `
            <div class="assistant-execution-step ${card.status === 'running' && index === 1 ? 'active' : ''} ${['done','cancelled'].includes(card.status) ? 'done' : ''}">
              <span>${index + 1}</span>
              <div>
                <strong>${step.label}</strong>
                <em>${step.detail}</em>
              </div>
            </div>
          `).join('')}
        </div>
        ${card.resultText ? `<div class="assistant-execution-result">${card.resultText}</div>` : ''}
        ${card.errorText ? `<div class="assistant-execution-error">${card.errorText}</div>` : ''}
        ${card.status === 'ready' ? `
          <div class="assistant-execution-actions">
            <button class="assistant-exec-primary ${readonly ? 'readonly' : ''}" type="button" data-exec-message="${message.id}">${card.primaryLabel}</button>
            <button class="assistant-exec-secondary" type="button" data-cancel-exec="${message.id}">${card.secondaryLabel}</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderAssistantDrawer(){
    if (!assistantDrawerRefs) return;
    const model = ensureAssistantConversation(assistantMode);
    assistantDrawerRefs.title.textContent = model.title;
    assistantDrawerRefs.prefText.textContent = `${model.prefs.assistantTone} · ${model.prefs.reminderStyle} · ${model.prefs.defaultAction || '先建议'}`;
    assistantDrawerRefs.modeHint.textContent = model.modeInfo.hint;
    assistantDrawerRefs.input.placeholder = model.modeInfo.placeholder;
    if (assistantDrawerRefs.modeSelect) {
      assistantDrawerRefs.modeSelect.value = model.workMode;
    }
    if (assistantDrawerRefs.presetSelect) {
      assistantDrawerRefs.presetSelect.value = assistantPromptPreset;
    }
    if (assistantDrawerRefs.uploadList) {
      assistantDrawerRefs.uploadList.innerHTML = model.uploads.length
        ? model.uploads.map(file => `
            <div class="assistant-upload-chip" title="${uploadSummaryText(file) || file.name}">
              <strong>${file.name}</strong>
              <span class="assistant-upload-status ${file.status || 'parsed'}">${file.status === 'parsed' ? '已解析' : file.status === 'image_metadata' ? '图片已读取' : file.status === 'fallback' ? '仅文件信息' : '待补解析'}</span>
            </div>
          `).join('')
        : `<div class="assistant-upload-empty">可在这里上传教材、教案、PPT 说明或资源清单。</div>`;
    }
    assistantDrawerRefs.chat.innerHTML = assistantConversation.map(message => `
      <div class="assistant-message ${message.role}">
        <div class="assistant-bubble">
          <div class="assistant-message-text">${message.text}</div>
          ${message.pending ? `<div class="assistant-message-pending"><span></span><span></span><span></span></div>` : ''}
          ${message.role === 'assistant' && message.actionCard ? assistantActionCardMarkup(message) : ''}
          ${message.role === 'assistant' && message.choices?.length ? `
            <div class="assistant-choice-list">
              ${message.choices.map((choice, index) => `
                <div class="assistant-choice-card">
                  <strong>${choice.title}</strong>
                  ${choice.summary ? `<p>${choice.summary}</p>` : ''}
                  <button class="assistant-apply" type="button" data-choice-message="${message.id}" data-choice-index="${index}">${choice.applyLabel}</button>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${message.role === 'assistant' && message.canApply ? `<button class="assistant-apply" type="button" data-apply-key="${message.actionKey}">采纳并回填</button>` : ''}
        </div>
      </div>
    `).join('');
    assistantDrawerRefs.chat.querySelectorAll('[data-apply-key]').forEach(button => {
      button.onclick = () => {
        if (button.dataset.applyKey === 'undo_last_action') {
          undoLastAssistantAction();
          return;
        }
        const action = model.actions.find(item => item.key === button.dataset.applyKey);
        applyAssistantAction(action);
      };
    });
    assistantDrawerRefs.chat.querySelectorAll('[data-exec-message]').forEach(button => {
      button.onclick = () => executeAssistantActionFromCard(button.dataset.execMessage);
    });
    assistantDrawerRefs.chat.querySelectorAll('[data-cancel-exec]').forEach(button => {
      button.onclick = () => cancelAssistantActionCard(button.dataset.cancelExec);
    });
    scrollAssistantChatToBottom();
    assistantDrawerRefs.chat.querySelectorAll('[data-choice-message]').forEach(button => {
      button.onclick = () => {
        const message = assistantConversation.find(item => item.id === button.dataset.choiceMessage);
        const choice = message?.choices?.[Number(button.dataset.choiceIndex || 0)];
        applyAssistantChoice(message, choice);
      };
    });
    if (assistantDrawerRefs.uploadInput) {
      assistantDrawerRefs.uploadInput.onchange = event => {
        handleAssistantFiles(event.target.files);
        event.target.value = '';
      };
    }
    if (assistantDrawerRefs.uploadDropzone) {
      const dropzone = assistantDrawerRefs.uploadDropzone;
      dropzone.ondragover = event => {
        event.preventDefault();
        dropzone.classList.add('drag-over');
      };
      dropzone.ondragleave = () => {
        dropzone.classList.remove('drag-over');
      };
      dropzone.ondrop = event => {
        event.preventDefault();
        dropzone.classList.remove('drag-over');
        if (event.dataTransfer?.files?.length) {
          handleAssistantFiles(event.dataTransfer.files);
        }
      };
    }
    if (assistantDrawerRefs.uploadTrigger) {
      assistantDrawerRefs.uploadTrigger.onclick = () => assistantDrawerRefs.uploadInput?.click();
    }
    const saveBtn = document.getElementById('saveLessonBtn')
      || document.getElementById('saveUnitBtn')
      || document.getElementById('stickySaveUnitBtn')
      || document.getElementById('saveDraftBtn')
      || document.getElementById('saveDraftInlineBtn');
    const compareBtn = document.getElementById('compareLessonBtn') || document.getElementById('compareUnitBtn');
    if (assistantDrawerRefs.quickSave) {
      assistantDrawerRefs.quickSave.hidden = !saveBtn;
    }
    if (assistantDrawerRefs.quickCompare) {
      assistantDrawerRefs.quickCompare.hidden = !compareBtn;
    }
    assistantDrawerRefs.send.onclick = async () => {
      const text = assistantDrawerRefs.input.value.trim();
      if (!text) return;
      pushAssistantMessage({ role:'user', text });
      assistantDrawerRefs.input.value = '';
      renderAssistantDrawer();
      if (isPendingActionConfirmation(text) && applyPendingAssistantAction()) {
        renderAssistantDrawer();
        return;
      }
      if (referencesStoredChoice(text) && applyStoredAssistantChoiceFromText(text)) {
        renderAssistantDrawer();
        return;
      }
      if (asksKnowledgeSearch(text)) {
        const pendingMessage = pushAssistantMessage({
          role:'assistant',
          text:'我正在调用知识库检索…',
          pending:true
        });
        renderAssistantDrawer();
        try {
          const baseSnapshot = assistantBridge?.getAssistantSnapshot
            ? assistantBridge.getAssistantSnapshot(assistantWorkMode)
            : null;
          const result = await searchKnowledgeBase(text, baseSnapshot, model);
          removeAssistantMessage(pendingMessage.id);
          pushAssistantMessage({
            role:'assistant',
            text:formatKnowledgeSearchReply(result),
            actionKey:'kb_search',
            actionTitle:'查找知识库'
          });
        } catch (error) {
          removeAssistantMessage(pendingMessage.id);
          pushAssistantMessage({
            role:'assistant',
            text:`我尝试调用知识库，但检索服务暂时没有成功：${error?.message || '未知错误'}。你可以先检查本地 AI 服务是否在运行，或者换一个关键词再试。`
          });
        }
        renderAssistantDrawer();
        return;
      }
      const action = resolveAssistantAction(model.actions, text);
      const inferredPatch = Object.assign(
        {},
        inferAssistantActionPatch(text, action?.key || ''),
        inferAssistantGeneratedPatchFromConversation(text, action)
      );
      if (action && wantsAssistantExecution(text) && hasAssistantGeneratedPatch(inferredPatch)) {
        applyAssistantAction(Object.assign({}, action, inferredPatch));
        return;
      }
      const pendingMessage = pushAssistantMessage({
        role:'assistant',
        text: action && wantsAssistantExecution(text) ? '我正在准备这一轮回填内容…' : '我正在看当前内容和资料…',
        pending:true
      });
      renderAssistantDrawer();
      if (action && wantsAssistantExecution(text)) {
        let executed = false;
        try {
          const reply = await requestAssistantReply(model, text, {
            forceActionKey: action.key,
            forceChoices: true
          });
          removeAssistantMessage(pendingMessage.id);
          if (Array.isArray(reply.choices) && reply.choices.length) {
            const firstChoice = reply.choices[0];
            pushAssistantMessage({ role:'assistant', text: reply.text || `好，我先按“${firstChoice.title}”这一版开始处理。` });
            pushAssistantMessage({ role:'assistant', text:`我先按“${firstChoice.title}”这一版开始回填。` });
            applyAssistantChoice({
              actionKey: reply.matched_action_key || action.key,
              actionTitle: action.title,
              actionPatch: inferredPatch,
              choices: reply.choices
            }, firstChoice);
            executed = true;
          }
        } catch (error) {
          removeAssistantMessage(pendingMessage.id);
          executed = false;
        }
        if (!executed) {
          pushAssistantMessage({ role:'assistant', text:`我已经匹配到“${action.title}”，下面这张卡片会说明执行范围。` });
          applyAssistantAction(Object.assign({}, action, inferredPatch));
        }
      } else {
        let reply;
        try {
          reply = await requestAssistantReply(model, text);
        } catch (error) {
          const fallback = discussionReply(text, action, model);
          reply = {
            text: fallback.text,
            choices: fallback.choices || [],
            matched_action_key: action?.key || ''
          };
        }
        removeAssistantMessage(pendingMessage.id);
        if (Array.isArray(reply.choices) && reply.choices.length) {
          storeAssistantChoices({
            actionKey: reply.matched_action_key || action?.key || '',
            actionTitle: action?.title || '',
            actionPatch: inferredPatch,
            choices: reply.choices
          });
          const choiceText = choiceListText(reply.choices);
          pushAssistantMessage({
            role:'assistant',
            text:`${reply.text || '我先给你几个候选版本。'}\n${choiceText}\n\n你可以直接说“用第二版”，也可以说“把第二版只填到教学导入”。`
          });
          renderAssistantDrawer();
          return;
        }
        pushAssistantMessage({
          role:'assistant',
          text: reply.text,
          actionKey: reply.matched_action_key || action?.key || '',
          actionTitle: action?.title || '',
          canApply: false,
          choices: []
        });
      }
      renderAssistantDrawer();
    };
    assistantDrawerRefs.input.onkeydown = event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        assistantDrawerRefs.send.click();
      }
    };
    if (assistantDrawerRefs.quickSave) {
      assistantDrawerRefs.quickSave.onclick = () => {
        if (saveBtn) {
          saveBtn.click();
          pushAssistantMessage({ role:'assistant', text:'已触发当前页面的保存动作。' });
        } else {
          pushAssistantMessage({ role:'assistant', text:'当前页还没有可直接调用的保存动作。' });
        }
        renderAssistantDrawer();
      };
    }
    if (assistantDrawerRefs.quickCompare) {
      assistantDrawerRefs.quickCompare.onclick = () => {
        if (compareBtn && compareBtn.href) {
          window.location.href = compareBtn.href;
          return;
        }
        pushAssistantMessage({ role:'assistant', text:'当前页还没有旧稿对比入口。' });
        renderAssistantDrawer();
      };
    }
  }

  function isDesignPage(page){
    return ['design_center','unit_design','lesson_design','design_drafts','design_attach'].includes(page);
  }

  function isInlineAssistantPage(page){
    return isDesignPage(page) || page === 'planner';
  }

  function buildDesignContextState(page, overrides){
    const source = window.XIAOBEI_PREP_TRUTH_SOURCE_V1;
    if (!source || !isDesignPage(page)) return null;
    const profile = ensureProfile();
    const params = new URLSearchParams(window.location.search);
    let grade = overrides?.grade || profile.preferredGrade || '三年级';
    let unitId = overrides?.unitId || params.get('unit_id') || '';
    const lessonDesignId = overrides?.lessonDesignId || params.get('lesson_design_id') || '';

    if (lessonDesignId) {
      const lesson = source.findLessonDesign({ lesson_design_id: lessonDesignId });
      if (lesson) {
        unitId = lesson.unit_id;
        grade = lesson.grade_scope || grade;
      }
    }

    const allUnits = source.listUnitPackages();
    const units = allUnits.filter(item => item.grade_scope === grade);
    const activeUnit = units.find(item => item.unit_id === unitId) || units[0] || allUnits.find(item => item.unit_id === unitId) || null;
    if (activeUnit) {
      unitId = activeUnit.unit_id;
      grade = activeUnit.grade_scope || grade;
    }
    const lessons = activeUnit ? source.listLessonDesigns({ unit_id: activeUnit.unit_id }) : [];
    return { grade, unitId, lessonDesignId, units, activeUnit, lessons };
  }

  function renderDesignContextNav(page, overrides){
    const host = document.querySelector('.design-context-nav-host');
    if (!host) return;
    const state = buildDesignContextState(page, overrides);
    if (!state) {
      host.innerHTML = '';
      return;
    }
    const unitChips = state.units.map(unit => `
      <a class="design-context-chip ${unit.unit_id === state.unitId ? 'active' : ''}" href="unit-design.html?unit_id=${unit.unit_id}">${unit.unit_name}</a>
    `).join('');
    const lessonChips = state.lessons.length
      ? state.lessons.map(lesson => `
          <a class="design-context-chip ${lesson.lesson_design_id === state.lessonDesignId ? 'active' : ''}" href="lesson-design.html?lesson_design_id=${lesson.lesson_design_id}">${lesson.lesson_no}</a>
        `).join('')
      : `<span class="design-context-empty">当前大单元下还没有课时设计</span>`;
    host.innerHTML = `
      <div class="design-context-popover">
        <button class="design-context-toggle" type="button" aria-expanded="false" aria-controls="designContextMenu" aria-label="打开大单元和课时导航" title="打开大单元和课时导航">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 7h16"></path>
            <path d="M4 12h16"></path>
            <path d="M4 17h10"></path>
          </svg>
        </button>
        <div class="design-context-menu" id="designContextMenu" hidden>
          <div class="design-context-meta">
            <small>当前年级</small>
            <strong>${state.grade}</strong>
          </div>
          <div class="design-context-group">
            <small>大单元</small>
            <div class="design-context-chips">
              <a class="design-context-chip ${page === 'design_center' ? 'active' : ''}" href="design-center.html?unit_id=${encodeURIComponent(state.unitId || '')}">总览</a>
              ${unitChips}
            </div>
          </div>
          <div class="design-context-group">
            <small>课时</small>
            <div class="design-context-chips">
              ${lessonChips}
            </div>
          </div>
        </div>
      </div>
    `;
    const toggle = host.querySelector('.design-context-toggle');
    const menu = host.querySelector('.design-context-menu');
    if (!toggle || !menu) return;
    const closeMenu = () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    };
    const openMenu = () => {
      toggle.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
    };
    toggle.onclick = (event) => {
      event.stopPropagation();
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    };
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });
    if (designContextOutsideHandler) {
      document.removeEventListener('click', designContextOutsideHandler);
    }
    designContextOutsideHandler = (event) => {
      if (!host.contains(event.target)) {
        closeMenu();
      }
    };
    document.addEventListener('click', designContextOutsideHandler);
  }

  function navIcon(name){
    const icons = {
      design: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"></path>
          <path d="m13.5 6.5 4 4"></path>
        </svg>`,
      execute: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 6h16"></path>
          <path d="M7 12h10"></path>
          <path d="M10 18h4"></path>
        </svg>`,
      profile: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 21a8 8 0 0 0-16 0"></path>
          <circle cx="12" cy="8" r="4"></circle>
        </svg>`,
      assistant: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3 9.8 7.8 5 10l4.8 2.2L12 17l2.2-4.8L19 10l-4.8-2.2L12 3Z"></path>
          <path d="M19 18.5 18.2 20 16.5 20.8 18.2 21.6 19 23.2 19.8 21.6 21.5 20.8 19.8 20Z"></path>
        </svg>`,
      knowledge: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21.5v-16Z"></path>
          <path d="M5 5.5A2.5 2.5 0 0 0 2.5 3H4a1 1 0 0 1 1 1v17.5"></path>
          <path d="M9 7h7"></path>
          <path d="M9 11h6"></path>
        </svg>`
    };
    return icons[name] || icons.design;
  }

  function navGroups(){
    return [
      {
        href:'entry.html',
        label:'教学中心首页',
        desc:'快速入口 / 分流 / 总览',
        icon:'assistant',
        keys:['entry'],
        children:[
          ['entry.html','首页总览','entry']
        ]
      },
      {
        href:'design-center.html',
        label:'教学设计中心',
        desc:'内容库 / 单元 / 课时 / 草稿',
        icon:'design',
        keys:['design_center','unit_design','lesson_design','design_drafts','design_attach','brief','draft','refine'],
        children:[
          ['design-center.html','设计总览','design_center'],
          ['unit-design.html','单元设计','unit_design'],
          ['lesson-design.html','课时设计','lesson_design'],
          ['design-drafts.html','设计草稿','design_drafts'],
          ['design-attach.html','挂接安排','design_attach'],
          ['brief.html','完整简报','brief'],
          ['draft.html','快速备课','draft'],
          ['refine.html','精修页','refine']
        ]
      },
      {
        href:'calendar.html',
        label:'教学执行中心',
        desc:'学期安排 / 上课 / 作业 / 评价',
        icon:'execute',
        keys:['planner','calendar','picker','classroom','assignments','evaluation','class_record'],
        children:[
          ['planner.html','生成安排','planner'],
          ['calendar.html','学期安排','calendar'],
          ['picker.html','选课','picker'],
          ['classroom.html','上课','classroom'],
          ['assignments.html','收作业','assignments'],
          ['evaluation.html','评价','evaluation'],
          ['class-record.html','课堂记录','class_record']
        ]
      },
      {
        href:'knowledge-base.html',
        label:'知识资产',
        desc:'入库 / 检索 / 当前课引用',
        icon:'knowledge',
        keys:['knowledge_base','course_knowledge'],
        children:[
          ['knowledge-base.html','入库台','knowledge_base'],
          ['course-knowledge-sidebar.html','当前课侧栏','course_knowledge']
        ]
      }
    ];
  }

  function mainNav(page){
    return navGroups().map(group => {
      const active = group.keys.includes(page);
      const children = active ? `
        <div class="sidebar-children">
          ${group.children.map(([href,label,key]) => `
            <a href="${href}" class="sidebar-child-link ${key === page ? 'active' : ''}">${label}</a>
          `).join('')}
        </div>
      ` : '';
      return `
        <div class="sidebar-group ${active ? 'active' : ''}">
          <a href="${group.href}" class="sidebar-link ${active ? 'active' : ''}">
            <span class="sidebar-link-icon">${navIcon(group.icon)}</span>
            <span class="sidebar-link-copy">
              <strong>${group.label}</strong>
              <small>${group.desc}</small>
            </span>
          </a>
          ${children}
        </div>
      `;
    }).join('');
  }

  function createSidebar(page){
    const profile = ensureProfile();
    const aside = document.createElement('aside');
    aside.className = 'shell-sidebar';
    aside.innerHTML = `
      <div class="sidebar-brand">
        <span class="brand-mark brand-symbol" role="img" aria-label="智绘教育标志">
          <img src="assets/logosymbol-lightbulb-graph-cc0.svg" alt="">
        </span>
        <div class="sidebar-brand-copy">
          <strong>雕庄智绘教育</strong>
          <small>${profile.preferredGrade}${profile.subject}</small>
        </div>
      </div>
      <nav class="sidebar-nav">${mainNav(page)}</nav>
    `;
    return aside;
  }

  function createTopbar(page,title){
    const profile = ensureProfile();
    const contextHost = isDesignPage(page)
      ? `<div class="design-context-nav-host topbar-context-host"></div>`
      : '';
    const wrap = document.createElement('div');
    wrap.className = 'shell-topbar';
    wrap.innerHTML = `
      <div class="shell-topbar-inner">
        <div class="shell-topbar-left">
          <div class="topbar-copy">
            <small>${title}</small>
          </div>
          ${contextHost}
        </div>
        <div class="user-nav">
          <a class="btn soft" href="profile.html">用户中心</a>
          <a class="btn soft" href="knowledge-base.html">入库台</a>
          <a class="btn soft" href="assistant.html">助手设置</a>
          <a class="user-chip" href="profile.html">
            <span class="user-avatar">${(profile.teacherName || '李').slice(0,1)}</span>
            <span class="user-text">
              <strong>${profile.teacherName}</strong>
            </span>
          </a>
        </div>
      </div>
    `;
    return wrap;
  }

  function assistantPanelMarkup(profile, prefs, copy, options){
    const closeLabel = '收起';
    return `
      <div class="drawer-head assistant-panel-head">
        <div class="assistant-panel-title">
          <h3 data-drawer-title>${copy.title}</h3>
          <div class="assistant-panel-meta">
            <span class="assistant-pref-inline" data-drawer-pref>${prefs.assistantTone} · ${prefs.reminderStyle}</span>
            <span class="assistant-mode-hint" data-drawer-modehint></span>
            <label class="assistant-preset-inline">
              <span>预设</span>
              <select class="assistant-preset-select" data-drawer-preset-select aria-label="切换提示词预设">
                ${promptPresetOptions().map(option => `<option value="${option.value}">${option.label}</option>`).join('')}
              </select>
            </label>
          </div>
        </div>
        <div class="assistant-panel-tools">
          <button class="btn soft" type="button" data-assistant-compare>对比旧稿</button>
          <button class="btn soft" type="button" data-assistant-save>存为草稿</button>
          <button class="btn" type="button" data-assistant-close>${closeLabel}</button>
        </div>
      </div>
      <div class="assistant-chat" data-drawer-chat></div>
      <div class="assistant-composer assistant-composer-chat">
        <div class="assistant-upload-list compact" data-drawer-uploadlist></div>
        <label class="assistant-upload-input-hidden">
          <input class="assistant-upload-input" type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.csv,.json,.png,.jpg,.jpeg,.webp" data-drawer-upload>
        </label>
        <div class="assistant-input-shell assistant-upload-dropzone">
          <textarea class="assistant-input compact" data-drawer-input placeholder="输入 @ 即可询问或标记资料。"></textarea>
          <div class="assistant-input-toolbar">
            <div class="assistant-input-tools-left">
              <button class="assistant-tool-btn" type="button" data-drawer-uploadtrigger aria-label="上传资料">＋</button>
            </div>
            <div class="assistant-input-tools-right">
              <select class="assistant-mode-select" data-drawer-mode-select aria-label="切换速备或精备">
                <option value="fast">快速</option>
                <option value="deep">精备</option>
              </select>
              <button class="assistant-send-btn" type="button" data-drawer-send aria-label="发送">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 18V7"></path>
                  <path d="M7.5 11.5L12 7l4.5 4.5"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bindAssistantRefs(drawer){
    assistantDrawerRefs = {
      drawer,
      title: drawer.querySelector('[data-drawer-title]'),
      chat: drawer.querySelector('[data-drawer-chat]'),
      input: drawer.querySelector('[data-drawer-input]'),
      send: drawer.querySelector('[data-drawer-send]'),
      prefText: drawer.querySelector('[data-drawer-pref]'),
      modeHint: drawer.querySelector('[data-drawer-modehint]'),
      presetSelect: drawer.querySelector('[data-drawer-preset-select]'),
      modeSelect: drawer.querySelector('[data-drawer-mode-select]'),
      uploadInput: drawer.querySelector('[data-drawer-upload]'),
      uploadDropzone: drawer.querySelector('.assistant-upload-dropzone'),
      uploadTrigger: drawer.querySelector('[data-drawer-uploadtrigger]'),
      uploadList: drawer.querySelector('[data-drawer-uploadlist]'),
      quickCompare: drawer.querySelector('[data-assistant-compare]'),
      quickSave: drawer.querySelector('[data-assistant-save]')
    };
    if (assistantDrawerRefs.modeSelect) {
      assistantDrawerRefs.modeSelect.onchange = event => {
        const nextMode = event.target.value;
        if (!nextMode || nextMode === assistantWorkMode) return;
        assistantWorkMode = nextMode;
        assistantConversation = [];
        assistantConversationMode = '';
        renderAssistantDrawer();
      };
    }
    if (assistantDrawerRefs.presetSelect) {
      assistantDrawerRefs.presetSelect.onchange = event => {
        assistantPromptPreset = event.target.value || 'default';
        pushAssistantMessage({
          role:'assistant',
          text:`好的，后面我会优先按“${promptPresetLabel(assistantPromptPreset)}”这个口径来和你讨论。`
        });
        renderAssistantDrawer();
      };
    }
  }

  function createFloatingAssistant(mode){
    installAssistantSelectionTracker();
    const profile = ensureProfile();
    const prefs = Object.assign({assistantTone:'简洁', reminderStyle:'少打扰'}, readJson(ASSISTANT_KEY));
    const copy = assistantCopy(mode);
    assistantMode = mode;
    assistantWorkMode = new URLSearchParams(window.location.search).get('ai_mode') || detectAssistantWorkMode(mode);
    assistantUploads = [];
    assistantInline = false;
    const toggle = document.createElement('button');
    toggle.className = 'drawer-toggle';
    toggle.type = 'button';
    toggle.textContent = '助';

    const drawer = document.createElement('aside');
    drawer.className = 'drawer';
    drawer.innerHTML = assistantPanelMarkup(profile, prefs, copy, { inline:false });
    bindAssistantRefs(drawer);

    toggle.onclick = () => {
      drawer.classList.toggle('open');
      if (drawer.classList.contains('open')) renderAssistantDrawer();
    };
    drawer.querySelector('[data-assistant-close]').onclick = () => drawer.classList.remove('open');
    document.body.appendChild(toggle);
    document.body.appendChild(drawer);
  }

  function createInlineAssistant(host, mode){
    installAssistantSelectionTracker();
    const profile = ensureProfile();
    const prefs = Object.assign({assistantTone:'简洁', reminderStyle:'少打扰'}, readJson(ASSISTANT_KEY));
    const copy = assistantCopy(mode);
    assistantMode = mode;
    assistantWorkMode = new URLSearchParams(window.location.search).get('ai_mode') || detectAssistantWorkMode(mode);
    assistantUploads = [];
    assistantInline = true;

    const panel = document.createElement('aside');
    panel.className = 'assistant-side-panel open';
    panel.innerHTML = assistantPanelMarkup(profile, prefs, copy, { inline:true });

    const peek = document.createElement('button');
    peek.className = 'assistant-side-peek';
    peek.type = 'button';
    peek.textContent = 'AI 备课助手';
    peek.hidden = true;

    bindAssistantRefs(panel);

    panel.querySelector('[data-assistant-close]').onclick = () => {
      panel.classList.remove('open');
      host.classList.add('assistant-collapsed');
      peek.hidden = false;
    };
    peek.onclick = () => {
      panel.classList.add('open');
      host.classList.remove('assistant-collapsed');
      peek.hidden = true;
      renderAssistantDrawer();
    };

    host.appendChild(panel);
    host.appendChild(peek);
    renderAssistantDrawer();
  }

  function mount(options){
    const page = options.page || 'entry';
    const title = options.title || '备课原型';
    const mode = options.assistant || page;
    const shell = document.querySelector('.shell');
    if (!shell) return;
    document.body.dataset.cleanProtoPage = page;
    const pageNode = shell.querySelector('.page');
    const content = document.createElement('div');
    content.className = 'shell-content';
    const topbar = createTopbar(page,title);
    const sidebar = createSidebar(page);
    shell.innerHTML = '';
    content.appendChild(topbar);
    if (pageNode) {
      if (isInlineAssistantPage(page)) {
        content.classList.add('shell-content-with-assistant');
        const workspace = document.createElement('div');
        workspace.className = 'shell-workspace';
        const main = document.createElement('div');
        main.className = 'shell-main';
        main.appendChild(pageNode);
        workspace.appendChild(main);
        content.appendChild(workspace);
        createInlineAssistant(workspace, mode);
      } else {
        content.appendChild(pageNode);
        createFloatingAssistant(mode);
      }
    }
    shell.appendChild(sidebar);
    shell.appendChild(content);
    renderDesignContextNav(page);
  }

  window.CLEAN_PROTO = {
    mount,
    ensureProfile,
    readJson,
    getAssistantActionLog(){
      return assistantActionLog.slice();
    },
    clearAssistantActionLog(){
      assistantActionLog = [];
      persistAssistantActionLog();
    },
    registerAssistantBridge(bridge){
      assistantBridge = bridge || null;
      renderAssistantDrawer();
    },
    updateDesignContextNav(overrides){
      const page = document.body.dataset.cleanProtoPage || '';
      renderDesignContextNav(page, overrides);
    }
  };
})();

(function(){
  const SELECTED_CONTEXT_V1_1_KEY = 'xiaobei_selected_lesson_context_v1_1';
  const LEGACY_SELECTED_CONTEXT_KEY = 'xiaobei_selected_lesson_context_v1';
  const TEACHING_SLOT_CONTEXT_KEY = 'xiaobei_teaching_slot_context_v1';
  const PREP_DRAFT_STORE_KEY = 'xiaobei_prep_draft_store_v1';

  const lessonTasks = [
    {
      course_plan_item_id: 'cp-g3-w8-c1-football-1',
      lesson_key: 'lesson-g3-w8-football-culture-c1',
      semester: '2025学年第二学期',
      week_no: 8,
      week_label: '第8周',
      date_range: '4/21-4/25',
      date_label: '4月24日',
      day_label: '周四',
      period: '第1节',
      grade_scope: '三年级',
      class_name: '三（1）班',
      unit_name: '创艺节·足球梦',
      topic_seq: 'F-1',
      topic_name: '走近足球文化',
      lesson_type: '活动导入课',
      assignment_required: false,
      status: '已看简报',
      status_code: 'brief_done',
      assignment_summary: '已交 25 / 28',
      completion_summary: '上次完成率 89%',
      risk_tag: '补交风险',
      note: '上课前要先提醒 3 名学生补交上周海洋单元作业，再进入足球文化导入。'
    },
    {
      course_plan_item_id: 'cp-g3-w8-c2-football-2',
      lesson_key: 'lesson-g3-w8-football-jersey-c2',
      semester: '2025学年第二学期',
      week_no: 8,
      week_label: '第8周',
      date_range: '4/21-4/25',
      date_label: '4月24日',
      day_label: '周四',
      period: '第3节',
      grade_scope: '三年级',
      class_name: '三（2）班',
      unit_name: '创艺节·足球梦',
      topic_seq: 'F-2',
      topic_name: '我的班级球衣',
      lesson_type: '活动设计课',
      assignment_required: true,
      status: '快速草稿待确认',
      status_code: 'rapid_ready',
      assignment_summary: '已交 27 / 29',
      completion_summary: '上次完成率 78%',
      risk_tag: '细节过早',
      note: '该班上次活动类任务完成度一般，容易一开始就陷入球衣细节。'
    },
    {
      course_plan_item_id: 'cp-g3-w8-c3-football-1',
      lesson_key: 'lesson-g3-w8-football-culture-c3',
      semester: '2025学年第二学期',
      week_no: 8,
      week_label: '第8周',
      date_range: '4/21-4/25',
      date_label: '4月25日',
      day_label: '周五',
      period: '第2节',
      grade_scope: '三年级',
      class_name: '三（3）班',
      unit_name: '创艺节·足球梦',
      topic_seq: 'F-1',
      topic_name: '走近足球文化',
      lesson_type: '活动导入课',
      assignment_required: false,
      status: '待简报',
      status_code: 'brief_pending',
      assignment_summary: '已交 24 / 28',
      completion_summary: '上次完成率 74%',
      risk_tag: '进入慢',
      note: '这个班对足球文化理解偏弱，建议先稳开场，多看图片再进入任务。'
    },
    {
      course_plan_item_id: 'cp-g3-w8-c4-football-2',
      lesson_key: 'lesson-g3-w8-football-jersey-c4',
      semester: '2025学年第二学期',
      week_no: 8,
      week_label: '第8周',
      date_range: '4/21-4/25',
      date_label: '4月25日',
      day_label: '周五',
      period: '第4节',
      grade_scope: '三年级',
      class_name: '三（4）班',
      unit_name: '创艺节·足球梦',
      topic_seq: 'F-2',
      topic_name: '我的班级球衣',
      lesson_type: '活动设计课',
      assignment_required: true,
      status: '已精修',
      status_code: 'refine_done',
      assignment_summary: '待收 30 份',
      completion_summary: '上次完成率 93%',
      risk_tag: '收齐草图',
      note: '这个班风险较低，重点是课后把草图收齐。'
    },
    {
      course_plan_item_id: 'cp-g3-w9-c5-football-3',
      lesson_key: 'lesson-g3-w9-football-trophy-c5',
      semester: '2025学年第二学期',
      week_no: 9,
      week_label: '第9周',
      date_range: '4/28-5/2',
      date_label: '4月30日',
      day_label: '周四',
      period: '第1节',
      grade_scope: '三年级',
      class_name: '三（5）班',
      unit_name: '创艺节·足球梦',
      topic_seq: 'F-3',
      topic_name: '足球奖杯设计',
      lesson_type: '活动制作课',
      assignment_required: true,
      status: '待简报',
      status_code: 'brief_pending',
      assignment_summary: '待收 29 份',
      completion_summary: '上次完成率 81%',
      risk_tag: '顺延预警',
      note: '五一前后课时容易压缩，奖杯设计要保留顺延空间。'
    },
    {
      course_plan_item_id: 'cp-g3-w10-c6-qinglv-1',
      lesson_key: 'lesson-g3-w10-qinglv-intro-c6',
      semester: '2025学年第二学期',
      week_no: 10,
      week_label: '第10周',
      date_range: '5/5-5/9',
      date_label: '5月8日',
      day_label: '周四',
      period: '第1节',
      grade_scope: '三年级',
      class_name: '三（6）班',
      unit_name: '第四单元 青绿中国色',
      topic_seq: '4-1',
      topic_name: '矿物颜料认识',
      lesson_type: '欣赏认知课',
      assignment_required: false,
      status: '待简报',
      status_code: 'brief_pending',
      assignment_summary: '无作业回收',
      completion_summary: '上次完成率 86%',
      risk_tag: '切回教材',
      note: '从活动课切回教材课，建议先做静下来看的导入。'
    },
    {
      course_plan_item_id: 'cp-g3-w10-c7-qinglv-2',
      lesson_key: 'lesson-g3-w10-qinglv-intro-c7',
      semester: '2025学年第二学期',
      week_no: 10,
      week_label: '第10周',
      date_range: '5/5-5/9',
      date_label: '5月9日',
      day_label: '周五',
      period: '第2节',
      grade_scope: '三年级',
      class_name: '三（7）班',
      unit_name: '第四单元 青绿中国色',
      topic_seq: '4-2',
      topic_name: '青绿中国色导入',
      lesson_type: '欣赏课',
      assignment_required: false,
      status: '待简报',
      status_code: 'brief_pending',
      assignment_summary: '无作业回收',
      completion_summary: '上次完成率 84%',
      risk_tag: '切回教材',
      note: '活动课之后学生容易散，导入要更稳、更慢。'
    },
    {
      course_plan_item_id: 'cp-g3-w11-c8-qinglv-3',
      lesson_key: 'lesson-g3-w11-qinglv-scale-c8',
      semester: '2025学年第二学期',
      week_no: 11,
      week_label: '第11周',
      date_range: '5/11-5/15',
      date_label: '5月14日',
      day_label: '周四',
      period: '第1节',
      grade_scope: '三年级',
      class_name: '三（8）班',
      unit_name: '第四单元 青绿中国色',
      topic_seq: '4-3',
      topic_name: '青绿色阶练习',
      lesson_type: '技法练习课',
      assignment_required: true,
      status: '待简报',
      status_code: 'brief_pending',
      assignment_summary: '待收 32 份',
      completion_summary: '上次完成率 79%',
      risk_tag: '层次发虚',
      note: '学生容易在第 3-4 阶拉不开差距，需要更明确的示范。'
    },
    {
      course_plan_item_id: 'cp-g3-w11-c1-qinglv-4',
      lesson_key: 'lesson-g3-w11-qinglv-poem-c1',
      semester: '2025学年第二学期',
      week_no: 11,
      week_label: '第11周',
      date_range: '5/11-5/15',
      date_label: '5月15日',
      day_label: '周五',
      period: '第2节',
      grade_scope: '三年级',
      class_name: '三（1）班',
      unit_name: '第四单元 青绿中国色',
      topic_seq: '4-4',
      topic_name: '诗画合一表达',
      lesson_type: '创作课',
      assignment_required: true,
      status: '未开始',
      status_code: 'not_started',
      assignment_summary: '待收 28 份',
      completion_summary: '上次完成率 82%',
      risk_tag: '表达偏散',
      note: '前一课如果色阶不稳，这一课创作容易发虚，先抓整体意境。'
    }
  ];

  function clone(value){
    return JSON.parse(JSON.stringify(value));
  }

  function listLessonTasks(){
    return clone(lessonTasks);
  }

  function findLessonTask(query){
    if (!query) return null;
    if (query.course_plan_item_id) {
      return clone(lessonTasks.find(item => item.course_plan_item_id === query.course_plan_item_id) || null);
    }
    if (query.lesson_key) {
      return clone(lessonTasks.find(item => item.lesson_key === query.lesson_key) || null);
    }
    return null;
  }

  function buildSelectedLessonContext(task){
    return {
      course_plan_item_id: task.course_plan_item_id,
      lesson_key: task.lesson_key,
      topic_seq: task.topic_seq,
      topic_name: task.topic_name,
      grade_scope: task.grade_scope,
      lesson_type: task.lesson_type,
      assignment_required: task.assignment_required,
      unit_name: task.unit_name,
      planned_week: task.week_label
    };
  }

  function buildTeachingSlotContext(task){
    return {
      week_label: task.week_label,
      date_range: task.date_range,
      date_label: task.date_label,
      day_label: task.day_label,
      period: task.period,
      class_name: task.class_name,
      topic_name: task.topic_name,
      prep_status: task.status,
      submission_summary: task.assignment_summary,
      completion_summary: task.completion_summary,
      risk_tag: task.risk_tag,
      note: task.note
    };
  }

  function writeLessonSelection(task){
    const lessonContext = buildSelectedLessonContext(task);
    const slotContext = buildTeachingSlotContext(task);
    try {
      sessionStorage.setItem(SELECTED_CONTEXT_V1_1_KEY, JSON.stringify(lessonContext));
      sessionStorage.setItem(LEGACY_SELECTED_CONTEXT_KEY, JSON.stringify(lessonContext));
      sessionStorage.setItem(TEACHING_SLOT_CONTEXT_KEY, JSON.stringify(slotContext));
    } catch (error) {}
    return { lessonContext, slotContext };
  }

  function recommendationFromRisk(task){
    const risk = task.risk_tag || '';
    if (risk.includes('补交')) {
      return {
        focus: ['先抓补交提醒', '今天上课前先把补交要求说明清楚，不要把课堂节奏拖散。'],
        guard: ['先防边讲边追作业', '先把补交动作说明完，再进入新内容，不要同时做两件事。'],
        support: ['先备补交名单', '准备清晰的补交名单和收取顺序，减少课中来回确认。']
      };
    }
    if (risk.includes('细节过早')) {
      return {
        focus: ['先抓整体表达', '先看球衣案例和整体结构，再进入图案与细节。'],
        guard: ['先防一开始就抠细节', '如果学生过早进入装饰，整节课很容易发散。'],
        support: ['先备两组案例', '准备一组保底案例和一组挑战案例，方便课中切换。']
      };
    }
    if (risk.includes('进入慢') || risk.includes('切回教材')) {
      return {
        focus: ['先稳导入', '先让学生看图、说图，再进入任务，不要直接布置创作。'],
        guard: ['先防节奏太快', '这个班更需要稳定进入，而不是一开始就推满。'],
        support: ['先备导入图组', '准备容易讨论的图片和关键词卡片，帮助学生进入情境。']
      };
    }
    if (risk.includes('层次发虚')) {
      return {
        focus: ['先抓层次清晰', '先把第 1-4 阶的色阶差别拉开，再谈画面表现。'],
        guard: ['先防混色和发虚', '毛笔未洗净和水量控制失衡，会直接导致色阶发虚。'],
        support: ['先备色阶示范', '准备清晰的色阶样张和失败对比样张。']
      };
    }
    if (risk.includes('收齐')) {
      return {
        focus: ['先抓收齐草图', '今天重点是把草图收齐，而不是再扩课堂流程。'],
        guard: ['先防漏收', '课后收取动作如果不提前设计，很容易遗漏。'],
        support: ['先备收取顺序', '提前确定每组收取顺序和摆放位置。']
      };
    }
    return {
      focus: ['先抓课时方向', '先确认这节课今天最关键的一步，再往下推进。'],
      guard: ['先防把课写重', '先把方向立住，不要一上来就把备课写成厚稿。'],
      support: ['先备最小支架', '准备 1 到 2 个最必要的支架，先确保这节课能顺利推进。']
    };
  }

  function buildBrief(task){
    const rec = recommendationFromRisk(task);
    const hasClassFacts = task.assignment_summary && task.completion_summary;
    return {
      brief_id: `brief-${task.lesson_key}`,
      selected_lesson_context: buildSelectedLessonContext(task),
      resolver_confidence: hasClassFacts ? 'medium' : 'low',
      source_summary: {
        material_ref_count: 1,
        curriculum_ref_count: 1,
        exemplar_ref_count: 1,
        class_profile_available: hasClassFacts
      },
      cards: [
        {
          card_type: 'material_summary',
          title: '教材摘要卡',
          summary: `${task.topic_name} 属于 ${task.unit_name}，这节课先要把“今天到底学什么”收得足够清楚。`,
          bullets: [
            `本课课型：${task.lesson_type}。`,
            task.assignment_required ? '本课涉及作业链，课中要兼顾产出要求。':'本课不以作业回收为主，重点先放课堂推进。',
            '先把今天的核心学习任务说清楚，再进入更细的活动安排。'
          ],
          source_status: 'resolved',
          confidence: 'high'
        },
        {
          card_type: 'unit_goal_bridge',
          title: '单元 -> 单课目标卡',
          summary: `${task.topic_name} 在 ${task.unit_name} 里承担本周这一课的推进任务，应先看清它是导入、练习还是创作。`,
          bullets: [
            `当前周次：${task.week_label}。`,
            `当前班级：${task.class_name}。`,
            '本卡先帮老师确认这节课在单元里的位置，再进入备课。'
          ],
          source_status: 'resolved',
          confidence: 'high'
        },
        {
          card_type: 'class_readiness',
          title: '学情摘要卡',
          summary: `当前先基于班级级摘要做保守判断：${task.class_name}${hasClassFacts ? ` 上次完成情况为 ${task.completion_summary}` : ' 还没有足够完整的班级数据'}。`,
          bullets: [
            `作业与提交：${task.assignment_summary}。`,
            `当前风险：${task.risk_tag}。`,
            hasClassFacts ? '本卡当前属于 partial：有班级摘要，但还不是完整班级画像。':'本卡当前信息偏薄，只能给保守提醒。'
          ],
          source_status: hasClassFacts ? 'partial' : 'sample_only',
          confidence: hasClassFacts ? 'medium' : 'low'
        },
        {
          card_type: 'history_issue',
          title: '历史问题摘要卡',
          summary: `当前先从上次完成率和风险标签回推这节课最可能卡住的地方：${task.risk_tag}。`,
          bullets: [
            `上次完成率：${task.completion_summary}。`,
            task.assignment_required ? '这节课和作业链有关，课中要兼顾提交与回收。':'这节课当前不以作业回收为主要约束。',
            '本卡现在是班级级摘要，不代表已经有完整历史作品分析。'
          ],
          source_status: hasClassFacts ? 'partial' : 'sample_only',
          confidence: hasClassFacts ? 'medium' : 'low'
        },
        {
          card_type: 'task_recommendation',
          title: '本课任务建议卡',
          summary: `这节课先抓“${rec.focus[0].replace('先抓','')}”，先防“${rec.guard[0].replace('先防','')}”，先备“${rec.support[0].replace('先备','')}”。`,
          bullets: [
            `先抓：${rec.focus[1]}`,
            `先防：${rec.guard[1]}`,
            `先备：${rec.support[1]}`
          ],
          source_status: hasClassFacts ? 'resolved' : 'partial',
          confidence: hasClassFacts ? 'medium' : 'low'
        }
      ],
      source_gaps: hasClassFacts ? [
        '当前已接入班级级摘要，但还没有学生个体细节。',
        '当前还没有完整历史作品解析，风险仍以班级级事实为主。'
      ] : [
        '当前班级级事实仍偏薄，简报只能做保守提示。',
        '还没有完整历史作品和学习过程数据。'
      ]
    };
  }

  function resolveLessonContextFromQuery(){
    const params = new URLSearchParams(window.location.search);
    return findLessonTask({
      course_plan_item_id: params.get('course_plan_item_id'),
      lesson_key: params.get('lesson_key')
    });
  }

  function _readLocalDraftStore(){
    try {
      const raw = window.localStorage.getItem(PREP_DRAFT_STORE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function _writeLocalDraftStore(records){
    try {
      window.localStorage.setItem(PREP_DRAFT_STORE_KEY, JSON.stringify(records));
      return true;
    } catch (error) {
      return false;
    }
  }

  function _generatePrepDraftId(){
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 17);
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `PREP_DRAFT_${stamp}_${random}`;
  }

  function _formatSavedAt(value){
    try {
      return new Date(value).toLocaleString('zh-CN', { hour12: false });
    } catch (error) {
      return value || '';
    }
  }

  function savePrepDraft(task, payload){
    if (!task || !task.course_plan_item_id || !task.lesson_key) {
      throw new Error('task with course_plan_item_id and lesson_key is required.');
    }
    if (!payload || typeof payload !== 'object') {
      throw new Error('payload must be an object.');
    }

    const draftMode = payload.draft_mode === 'minimal'
      ? 'minimal'
      : payload.draft_mode === 'refine'
        ? 'refine'
        : 'rapid';
    const now = new Date().toISOString();
    const store = _readLocalDraftStore();
    const existingIndex = store.findIndex(item =>
      item.course_plan_item_id === task.course_plan_item_id &&
      item.lesson_key === task.lesson_key &&
      item.draft_mode === draftMode
    );
    const previous = existingIndex >= 0 ? store[existingIndex] : null;
    const snapshot = {
      draft_id: previous?.draft_id || _generatePrepDraftId(),
      draft_mode: draftMode,
      source_mode: draftMode === 'rapid'
        ? 'quick_generate'
        : draftMode === 'minimal'
          ? 'minimal_start'
          : 'refine_workspace',
      course_plan_item_id: task.course_plan_item_id,
      lesson_key: task.lesson_key,
      topic_name: task.topic_name,
      unit_name: task.unit_name,
      grade_scope: task.grade_scope,
      lesson_type: task.lesson_type,
      class_name: task.class_name,
      period: task.period,
      status: 'draft_saved',
      saved_at: now,
      created_at: previous?.created_at || now,
      fields: clone(payload.fields || {}),
      brief_snapshot: Array.isArray(payload.brief_snapshot) ? payload.brief_snapshot : [],
      risk_tag: payload.risk_tag || task.risk_tag || '',
      assignment_summary: payload.assignment_summary || task.assignment_summary || ''
    };

    if (existingIndex >= 0) {
      store[existingIndex] = snapshot;
    } else {
      store.push(snapshot);
    }
    _writeLocalDraftStore(store);
    return clone(snapshot);
  }

  function getDraftModeLabel(mode){
    if (mode === 'minimal') return '极简版';
    if (mode === 'rapid') return '快速版';
    if (mode === 'refine') return '精修页';
    return '未识别模式';
  }

  function getSavedDraftLabel(mode){
    if (mode === 'minimal') return '已保存极简稿';
    if (mode === 'rapid') return '已保存快速稿';
    if (mode === 'refine') return '已保存精修稿';
    return '已保存草稿';
  }

  function getContinueActionLabel(mode){
    if (mode === 'minimal') return '继续极简版';
    if (mode === 'rapid') return '继续快速版';
    if (mode === 'refine') return '继续精修页';
    return '继续编辑';
  }

  function findLatestPrepDraft(query){
    if (!query) return null;
    const store = _readLocalDraftStore();
    const matched = store.filter(item => {
      if (query.course_plan_item_id && item.course_plan_item_id !== query.course_plan_item_id) return false;
      if (query.lesson_key && item.lesson_key !== query.lesson_key) return false;
      if (query.draft_mode && item.draft_mode !== query.draft_mode) return false;
      return true;
    });
    matched.sort((a, b) => String(b.saved_at || '').localeCompare(String(a.saved_at || '')));
    return matched.length ? clone(matched[0]) : null;
  }

  function listPrepDrafts(){
    const store = _readLocalDraftStore();
    store.sort((a, b) => String(b.saved_at || '').localeCompare(String(a.saved_at || '')));
    return clone(store);
  }

  function getPrepDraftState(taskOrQuery){
    const task = taskOrQuery?.topic_name
      ? clone(taskOrQuery)
      : findLessonTask(taskOrQuery);
    if (!task) {
      return { rapidDraft: null, minimalDraft: null, refineDraft: null, latestDraft: null };
    }
    const rapidDraft = findLatestPrepDraft({
      course_plan_item_id: task.course_plan_item_id,
      lesson_key: task.lesson_key,
      draft_mode: 'rapid'
    });
    const minimalDraft = findLatestPrepDraft({
      course_plan_item_id: task.course_plan_item_id,
      lesson_key: task.lesson_key,
      draft_mode: 'minimal'
    });
    const refineDraft = findLatestPrepDraft({
      course_plan_item_id: task.course_plan_item_id,
      lesson_key: task.lesson_key,
      draft_mode: 'refine'
    });
    const latestDraft = [rapidDraft, minimalDraft, refineDraft]
      .filter(Boolean)
      .sort((a, b) => String(b.saved_at || '').localeCompare(String(a.saved_at || '')))[0] || null;
    return { rapidDraft, minimalDraft, refineDraft, latestDraft };
  }

  function buildRuntimeLessonTask(taskOrQuery){
    const task = taskOrQuery?.topic_name
      ? clone(taskOrQuery)
      : findLessonTask(taskOrQuery);
    if (!task) return null;
    const draftState = getPrepDraftState(task);
    const runtime = { ...task, ...draftState };
    if (draftState.refineDraft) {
      runtime.status = '已有精修稿';
      runtime.status_code = 'refine_done';
      runtime.status_note = `最近保存：${_formatSavedAt(draftState.refineDraft.saved_at)}`;
      return runtime;
    }
    if (draftState.rapidDraft && task.status_code !== 'refine_done') {
      runtime.status = '已有快速稿';
      runtime.status_code = 'rapid_ready';
      runtime.status_note = `最近保存：${_formatSavedAt(draftState.rapidDraft.saved_at)}`;
      return runtime;
    }
    if (draftState.minimalDraft && !draftState.rapidDraft && task.status_code !== 'refine_done') {
      runtime.status = '已有极简稿';
      runtime.status_code = 'minimal_saved';
      runtime.status_note = `最近保存：${_formatSavedAt(draftState.minimalDraft.saved_at)}`;
      return runtime;
    }
    runtime.status_note = draftState.latestDraft ? `最近保存：${_formatSavedAt(draftState.latestDraft.saved_at)}` : '';
    return runtime;
  }

  function listRecentPrepLessons(limit){
    const store = listPrepDrafts();
    const max = Number.isFinite(Number(limit)) ? Number(limit) : 4;
    const seen = new Set();
    const recent = [];

    for (const draft of store) {
      const key = `${draft.course_plan_item_id}::${draft.lesson_key}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const runtimeTask = buildRuntimeLessonTask({
        course_plan_item_id: draft.course_plan_item_id,
        lesson_key: draft.lesson_key
      });
      recent.push({
        course_plan_item_id: draft.course_plan_item_id,
        lesson_key: draft.lesson_key,
        latest_draft: clone(draft),
        runtime_task: runtimeTask ? clone(runtimeTask) : null
      });
      if (recent.length >= max) break;
    }

    return clone(recent);
  }

  function describeLatestDraft(taskOrQuery){
    const task = taskOrQuery?.topic_name
      ? clone(taskOrQuery)
      : findLessonTask(taskOrQuery);
    if (!task) {
      return {
        draft: null,
        modeLabel: '',
        savedDraftLabel: '',
        continueLabel: '',
        summary: '当前还没有已保存草稿',
        savedAtLabel: ''
      };
    }
    const draftState = getPrepDraftState(task);
    const latestDraft = draftState.latestDraft;
    if (!latestDraft) {
      return {
        draft: null,
        modeLabel: '',
        savedDraftLabel: '',
        continueLabel: '',
        summary: '当前还没有已保存草稿',
        savedAtLabel: ''
      };
    }
    const modeLabel = getDraftModeLabel(latestDraft.draft_mode);
    const savedDraftLabel = getSavedDraftLabel(latestDraft.draft_mode);
    const continueLabel = getContinueActionLabel(latestDraft.draft_mode);
    const savedAtLabel = _formatSavedAt(latestDraft.saved_at);
    return {
      draft: clone(latestDraft),
      modeLabel,
      savedDraftLabel,
      continueLabel,
      summary: `${savedDraftLabel} · ${savedAtLabel}`,
      savedAtLabel
    };
  }

  window.XIAOBEI_PREP_TRUTH_SOURCE_V1 = {
    version: 'v1',
    storage_keys: {
      selected_context: SELECTED_CONTEXT_V1_1_KEY,
      selected_context_legacy: LEGACY_SELECTED_CONTEXT_KEY,
      teaching_slot_context: TEACHING_SLOT_CONTEXT_KEY,
      prep_draft_store: PREP_DRAFT_STORE_KEY
    },
    listLessonTasks,
    findLessonTask,
    buildSelectedLessonContext,
    buildTeachingSlotContext,
    writeLessonSelection,
    buildBrief,
    resolveLessonContextFromQuery,
    savePrepDraft,
    getDraftModeLabel,
    getSavedDraftLabel,
    getContinueActionLabel,
    findLatestPrepDraft,
    listPrepDrafts,
    listRecentPrepLessons,
    describeLatestDraft,
    getPrepDraftState,
    buildRuntimeLessonTask
  };
})();

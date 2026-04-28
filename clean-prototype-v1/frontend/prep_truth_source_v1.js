(function(){
  const SELECTED_CONTEXT_V1_1_KEY = 'xiaobei_selected_lesson_context_v1_1';
  const LEGACY_SELECTED_CONTEXT_KEY = 'xiaobei_selected_lesson_context_v1';
  const TEACHING_SLOT_CONTEXT_KEY = 'xiaobei_teaching_slot_context_v1';
  const PREP_DRAFT_STORE_KEY = 'xiaobei_prep_draft_store_v1';
  const CLASSROOM_RUN_STORE_KEY = 'xiaobei_classroom_run_store_v1';
  const UNIT_DESIGN_STORE_KEY = 'xiaobei_unit_design_store_v1';
  const LESSON_DESIGN_STORE_KEY = 'xiaobei_lesson_design_store_v1';
  const REAL_BRIDGE = window.XIAOBEI_FEISHU_REAL_DATA_V1 || null;
  const CONTENT_LIBRARY_BRIDGE = window.XIAOBEI_CONTENT_LIBRARY_REAL_DATA_V1 || null;
  function resolveDesignApiBase(){
    if (window.XIAOBEI_LOCAL_API_BASE) {
      return String(window.XIAOBEI_LOCAL_API_BASE).replace(/\/$/, '');
    }
    const { protocol, hostname, origin } = window.location;
    const localHosts = new Set(['127.0.0.1', 'localhost']);
    if (protocol === 'file:' || localHosts.has(hostname)) {
      return 'http://127.0.0.1:8082';
    }
    if (protocol === 'http:' || protocol === 'https:') {
      return `${origin}/api`;
    }
    return 'http://127.0.0.1:8082';
  }
  const DESIGN_VERSION_API_BASE = resolveDesignApiBase();

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
      status: '快速运行稿待确认',
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

  const DEFAULT_SEMESTER_PLAN_ID = 'semester-2025-2-xutao-g3-art';
  const DEFAULT_SEMESTER_LABEL = '2025学年第二学期';
  const EXECUTION_GRADE_SCOPE = '三年级';
  const EXECUTION_SUBJECT = '美术';

  function _slug(value){
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'unknown';
  }

  function _contentUnitIdFromName(unitName){
    if (String(unitName || '').includes('青绿')) return 'unit-g3-qinglv';
    if (String(unitName || '').includes('足球')) return 'unit-g3-football';
    if (String(unitName || '').includes('远航')) return 'unit-g5-voyage';
    return `unit-${_slug(unitName)}`;
  }

  function _classIdFromName(className){
    return `class-${_slug(className)}`;
  }

  function normalizeCoursePlanItem(item){
    const semesterPlanId = item.semester_plan_id || DEFAULT_SEMESTER_PLAN_ID;
    const weekNo = Number(item.week_no) || 0;
    return {
      object_type: 'course_plan_item',
      semester_plan_id: semesterPlanId,
      semester_week_plan_id: item.semester_week_plan_id || `${semesterPlanId}-week-${weekNo || 'unknown'}`,
      course_plan_item_id: item.course_plan_item_id,
      lesson_key: item.lesson_key,
      semester: item.semester || DEFAULT_SEMESTER_LABEL,
      week_no: weekNo,
      week_label: item.week_label || (weekNo ? `第${weekNo}周` : '未排周次'),
      date_range: item.date_range || '',
      date_label: item.date_label || '',
      day_label: item.day_label || '',
      period: item.period || '',
      grade_scope: item.grade_scope || EXECUTION_GRADE_SCOPE,
      class_id: item.class_id || _classIdFromName(item.class_name),
      class_name: item.class_name || '',
      content_unit_id: item.content_unit_id || _contentUnitIdFromName(item.unit_name),
      content_lesson_id: item.content_lesson_id || item.lesson_key,
      lesson_design_version_id: item.lesson_design_version_id || `design-version-${item.lesson_key}`,
      unit_name: item.unit_name || '',
      topic_seq: item.topic_seq || '',
      topic_name: item.topic_name || '',
      lesson_type: item.lesson_type || '',
      assignment_required: !!item.assignment_required,
      run_status: item.run_status || item.status || '未开始',
      run_status_code: item.run_status_code || item.status_code || 'not_started',
      status: item.status || item.run_status || '未开始',
      status_code: item.status_code || item.run_status_code || 'not_started',
      assignment_summary: item.assignment_summary || '',
      completion_summary: item.completion_summary || '',
      risk_tag: item.risk_tag || '',
      note: item.note || ''
    };
  }

  function buildSemesterPlanSeed(courseItems){
    const items = (courseItems || lessonTasks).map(normalizeCoursePlanItem);
    const weekNos = items.map(item => item.week_no).filter(Boolean);
    return {
      object_type: 'semester_plan',
      semester_plan_id: DEFAULT_SEMESTER_PLAN_ID,
      school_year: '2025学年',
      term: '第二学期',
      semester_label: DEFAULT_SEMESTER_LABEL,
      teacher_id: 'teacher-xutao',
      teacher_name: '徐涛老师',
      subject: EXECUTION_SUBJECT,
      grade_scope: EXECUTION_GRADE_SCOPE,
      week_count: weekNos.length ? Math.max(...weekNos) : 0,
      plan_source: 'mock_seed',
      plan_status: 'current',
      version_no: 'execution-v1',
      updated_at: '2026-04-27T00:00:00+08:00',
      summary: '本地执行中心样例安排，用于验证“学期安排 -> 排课课次 -> 备课运行”的主线。'
    };
  }

  function buildSemesterWeekPlansSeed(courseItems){
    const items = (courseItems || lessonTasks).map(normalizeCoursePlanItem);
    const groups = new Map();
    items.forEach(item => {
      if (!groups.has(item.week_no)) groups.set(item.week_no, []);
      groups.get(item.week_no).push(item);
    });
    return [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([weekNo, rows]) => {
      const uniqueTopics = [...new Set(rows.map(item => item.topic_name).filter(Boolean))];
      return {
        object_type: 'semester_week_plan',
        semester_week_plan_id: `${DEFAULT_SEMESTER_PLAN_ID}-week-${weekNo}`,
        semester_plan_id: DEFAULT_SEMESTER_PLAN_ID,
        week_no: weekNo,
        week_label: rows[0]?.week_label || `第${weekNo}周`,
        date_range: rows[0]?.date_range || '',
        grade_scope: rows[0]?.grade_scope || EXECUTION_GRADE_SCOPE,
        lesson_capacity: rows.length,
        planned_summary: uniqueTopics.join('、'),
        actual_summary: weekNo === 9 ? '足球奖杯设计顺延到第10周前半' : '按原计划执行',
        holiday_summary: weekNo === 9 ? '五一前后' : '—',
        note: weekNo === 9 ? '活动周压缩了可用容量。' : '当前无额外变动。',
        course_plan_item_ids: rows.map(item => item.course_plan_item_id)
      };
    });
  }

  function buildAssignmentInstancesSeed(courseItems){
    return (courseItems || lessonTasks)
      .map(normalizeCoursePlanItem)
      .filter(item => item.assignment_required)
      .map((item, index) => ({
        object_type: 'assignment_instance',
        assignment_instance_id: `assignment-${item.course_plan_item_id}`,
        course_plan_item_id: item.course_plan_item_id,
        prep_run_id: `prep-run-${item.course_plan_item_id}`,
        class_id: item.class_id,
        class_name: item.class_name,
        assignment_no: `${item.week_label}-${item.class_name}-${index + 1}`,
        assignment_type: item.lesson_type.includes('制作') || item.lesson_type.includes('活动') ? '综合' : '绘画',
        assignment_requirement: item.assignment_summary || '待从课时设计稿生成作业要求',
        content_unit_id: item.content_unit_id,
        content_lesson_id: item.content_lesson_id,
        assignment_definition_id: `assignment-definition-${item.lesson_key}`,
        content_version_no: item.lesson_design_version_id,
        dimension_json_snapshot: [],
        release_status: item.assignment_summary.includes('待收') ? '已发布' : '运行中',
        due_at: ''
      }));
  }

  function buildSubmissionSlotsSeed(assignmentInstances){
    return (assignmentInstances || buildAssignmentInstancesSeed()).flatMap(item => ([
      {
        object_type: 'submission_slot',
        submission_slot_id: `submission-${item.assignment_instance_id}-sample-1`,
        assignment_instance_id: item.assignment_instance_id,
        student_id: `${item.class_id}-student-01`,
        student_name: '学生样例A',
        class_id: item.class_id,
        class_name: item.class_name,
        submission_files: [],
        submit_status: '已交',
        submitted_at: '',
        dimension_score_json: [],
        ai_feedback: '',
        teacher_feedback: '',
        final_score: ''
      },
      {
        object_type: 'submission_slot',
        submission_slot_id: `submission-${item.assignment_instance_id}-sample-2`,
        assignment_instance_id: item.assignment_instance_id,
        student_id: `${item.class_id}-student-02`,
        student_name: '学生样例B',
        class_id: item.class_id,
        class_name: item.class_name,
        submission_files: [],
        submit_status: '未交',
        submitted_at: '',
        dimension_score_json: [],
        ai_feedback: '',
        teacher_feedback: '',
        final_score: ''
      }
    ]));
  }

  const unitPackages = [
    {
      unit_id: 'unit-g3-qinglv',
      unit_name: '第三单元 青绿中国色',
      grade_scope: '三年级',
      total_lessons: 4,
      design_type: '常规单元',
      core_literacy_goals: [
        '审美感知：感受中国传统青绿设色的层次、秩序与意境。',
        '艺术表现：认识并尝试石青、石绿等青绿色调的设色方式。',
        '创意实践：围绕青绿山水完成从色阶练习到完整创作的递进表达。',
        '文化理解：联系《千里江山图》等作品理解青绿山水的文化来源。'
      ],
      core_task: '完成一组“由练习到创作”的青绿山水学习任务：先会调色，再会组织画面，最后完成一幅具有青绿层次的小景创作。',
      cross_discipline: '美术 + 语文（诗画意境）；美术 + 科学（矿物颜料与材料特性）；美术 + 历史（青绿山水传统）。',
      support_strategy: '基础层先稳色阶与构图；进阶层补层次与节奏；拓展层尝试题跋、金石色点缀或诗句融入。',
      resource_list: [
        '《千里江山图》高清局部',
        '青绿山水导入 PPT',
        '石青 / 石绿设色示范',
        '青绿色阶练习纸',
        '教师示范视频与失败对比样张'
      ],
      lesson_map: [
        { lesson_design_id: 'lesson-design-g3-qinglv-1', lesson_no: '课时1', title: '走进青绿山水', focus: '先建立青绿意象与传统山水审美', assignment_code: '3.0', timeline_hint: '第10周' },
        { lesson_design_id: 'lesson-design-g3-qinglv-2', lesson_no: '课时2', title: '青绿色阶练习', focus: '先把色阶、层次和设色节奏练稳', assignment_code: '3.1', timeline_hint: '第11周' },
        { lesson_design_id: 'lesson-design-g3-qinglv-3', lesson_no: '课时3', title: '心中的青绿山水', focus: '把色阶练习迁移到完整小景创作', assignment_code: '3.2', timeline_hint: '第11周' },
        { lesson_design_id: 'lesson-design-g3-qinglv-4', lesson_no: '课时4', title: '青绿山水展与评', focus: '完成展评、题跋和单元回看', assignment_code: '3.3', timeline_hint: '第12周' }
      ],
      assignment_overview: [
        '3.1 青绿色阶练习：看色阶是否清晰、过渡是否干净。',
        '3.2 青绿山水创作：看主题表达、层次组织、整体完成度。'
      ],
      status: '祖层已成稿',
      linked_execution: '已部分挂到第10-12周执行线'
    },
    {
      unit_id: 'unit-g3-football',
      unit_name: '创艺节·足球梦',
      grade_scope: '三年级',
      total_lessons: 3,
      design_type: '活动项目单元',
      core_literacy_goals: [
        '审美感知：从校园活动和班级文化里找到视觉符号。',
        '艺术表现：用图形、色彩和版式表达班级球衣主题。',
        '创意实践：围绕班级身份完成球衣、奖杯等项目化设计。',
        '文化理解：理解足球文化和校园活动中的集体表达。'
      ],
      core_task: '围绕创艺节足球主题，完成“认识文化 -> 球衣设计 -> 奖杯设计”的连续项目。',
      cross_discipline: '美术 + 体育（足球文化与校园活动）；美术 + 德育（班级认同与集体表达）。',
      support_strategy: '保底层先稳主题和识别度；进阶层再谈版式和细节；项目展示时允许班级间做节奏差异。',
      resource_list: [
        '足球文化导入图组',
        '班级球衣案例板',
        '奖杯造型参考图',
        '创艺节活动说明'
      ],
      lesson_map: [
        { lesson_design_id: 'lesson-design-g3-football-1', lesson_no: '课时1', title: '走近足球文化', focus: '先认识项目背景和视觉符号', assignment_code: 'F.0', timeline_hint: '第8周' },
        { lesson_design_id: 'lesson-design-g3-football-2', lesson_no: '课时2', title: '我的班级球衣', focus: '完成班级球衣的整体表达与版式设计', assignment_code: 'F.1', timeline_hint: '第8周' },
        { lesson_design_id: 'lesson-design-g3-football-3', lesson_no: '课时3', title: '足球奖杯设计', focus: '把项目表达延伸到立体/平面奖杯设计', assignment_code: 'F.2', timeline_hint: '第9周' }
      ],
      assignment_overview: [
        'F.1 我的班级球衣：看主题识别、班级元素和整体版式。',
        'F.2 足球奖杯设计：看造型完整度、象征元素和展示效果。'
      ],
      status: '项目单元已起草',
      linked_execution: '已挂到第8-9周执行线'
    },
    {
      unit_id: 'unit-g4-voyage',
      unit_name: '梦中的远航',
      grade_scope: '四年级',
      total_lessons: 1,
      design_type: '完整教学设计案例',
      core_literacy_goals: [
        '审美感知：感受远航主题里的想象性空间与叙事感。',
        '艺术表现：用画面结构、色彩和象征物表现“梦中的远航”。',
        '创意实践：把个人经历或想象转化为完整画面表达。',
        '文化理解：理解海洋、远航与成长叙事之间的文化意象。'
      ],
      core_task: '围绕“梦中的远航”完成一份完整的主题创作设计，并通过信息技术材料支持教学推进。',
      cross_discipline: '美术 + 信息技术（图像、投影、示范支持）；美术 + 语文（叙事表达与想象）。',
      support_strategy: '先通过图像建立情境，再帮助学生把“远航”转成可见的主体、背景和故事线。',
      resource_list: [
        '远航主题情境图组',
        '海洋与船只参考图',
        '信息技术支持页面说明',
        '示范画面拆解图'
      ],
      lesson_map: [
        { lesson_design_id: 'lesson-design-g4-voyage-1', lesson_no: '课时1', title: '梦中的远航', focus: '完整主题创作设计', assignment_code: 'YH.1', timeline_hint: '待挂接' }
      ],
      assignment_overview: [
        'YH.1 梦中的远航：看主题表达、画面组织、信息技术支持下的创作推进。'
      ],
      status: '完整设计案例',
      linked_execution: '暂未挂接到执行线'
    }
  ];

  const lessonDesigns = [
    {
      lesson_design_id: 'lesson-design-g3-qinglv-2',
      unit_id: 'unit-g3-qinglv',
      unit_name: '第三单元 青绿中国色',
      grade_scope: '三年级',
      lesson_no: '课时2',
      topic_name: '青绿色阶练习',
      theme: '先通过技法练习稳住青绿色阶与层次，再为后续创作做准备。',
      linked_execution: '已挂接：第11周 · 三年级 · 技法练习课',
      unit_bridge: '本课承接“走进青绿山水”的审美导入，负责把青绿色调从“看得懂”推进到“能调出来、能拉开层次”，为后面《心中的青绿山水》创作做技法准备。',
      lesson_goals: [
        '认识石青、石绿、墨汁之间的关系，能说出深浅变化的基本逻辑。',
        '能完成 4 阶以上青绿色阶练习，并拉开相邻色阶差异。',
        '能把色阶练习中的层次控制迁移到简单山体局部。'
      ],
      focus_difficulty: '重点：色阶差异清楚、过渡稳定。难点：避免颜色发虚、层次混掉。',
      teacher_prepare: '石青、石绿、墨汁、示范样张、失败对比样张、练习纸、导入 PPT。',
      student_prepare: '毛笔、调色盘、清水、练习纸、抹布。',
      assignment_code: '3.1',
      assignment_title: '青绿色阶练习',
      assignment_requirement: '完成一张 4 阶以上青绿色阶练习，并在局部山体里试用这一组色阶。',
      key_points: '看色阶是否清晰、层次是否拉开、颜色是否干净。',
      dimension_summary: 'A 色阶清晰度 / B 层次控制 / C 画面整理',
      process_steps: [
        {step_name:'课堂导入', duration:'3分钟', teacher_action:'先回看《千里江山图》局部，提醒学生注意“深浅青绿”的节奏。', student_task:'说出自己上节课记住的一种青绿色感受。', material:'导入图组', ppt:'封面 + 回顾页'},
        {step_name:'认识材料', duration:'4分钟', teacher_action:'并排展示墨汁、石青、石绿，强调颜色差异与调和关系。', student_task:'观察三种材料，说出至少一个发现。', material:'材料杯、湿布', ppt:'材料展示页'},
        {step_name:'教师示范', duration:'6分钟', teacher_action:'示范从浅到深拉出 4 阶色阶，并展示失败样张。', student_task:'跟着记录“水量 / 色量 / 落笔次序”。', material:'示范纸、样张', ppt:'步骤页'},
        {step_name:'学生练习', duration:'16分钟', teacher_action:'巡视时重点盯第 3-4 阶是否真正拉开。', student_task:'完成色阶练习并把其中两阶迁移到山体局部。', material:'练习纸、毛笔、颜料', ppt:'评价提醒页'},
        {step_name:'展示与收束', duration:'6分钟', teacher_action:'让 2-3 名学生对比色阶层次，教师再补一轮纠偏。', student_task:'说出自己哪一阶最难控制。', material:'展示台', ppt:'收束页'}
      ],
      resource_notes: 'PPT 重点是导入图组、材料展示页、示范步骤页、评价提醒页；练习纸需可打印。',
      revision_notes: '这一稿先偏技法练习体量，后续可再补“层次失败样例”的更多说明。'
    },
    {
      lesson_design_id: 'lesson-design-g3-football-2',
      unit_id: 'unit-g3-football',
      unit_name: '创艺节·足球梦',
      grade_scope: '三年级',
      lesson_no: '课时2',
      topic_name: '我的班级球衣',
      theme: '围绕班级身份完成一件可识别、可展示的球衣设计。',
      linked_execution: '已挂接：第8周 · 三（2）班 / 三（4）班',
      unit_bridge: '本课承接足球文化导入，开始把“项目主题”转成可见的班级视觉方案，是项目单元里最核心的创作课。',
      lesson_goals: [
        '能说出一件班级球衣至少要表达的 2 个班级信息。',
        '能先立整体版式，再补图案与装饰，不一开始就陷进细节。',
        '能完成一件可识别班级身份的球衣设计草稿。'
      ],
      focus_difficulty: '重点：主题识别和整体版式。难点：避免细节过早、图案堆砌。',
      teacher_prepare: '班级球衣案例板、班级元素关键词卡、球衣版式模板、保底案例和挑战案例。',
      student_prepare: '铅笔、马克笔、彩色工具、球衣轮廓纸。',
      assignment_code: 'F.1',
      assignment_title: '我的班级球衣',
      assignment_requirement: '围绕班级身份完成一张球衣设计图，至少体现班级名称/符号/主色调三项中的两项。',
      key_points: '看主题识别、班级元素、版式主次、装饰是否服务整体。',
      dimension_summary: 'A 主题表达 / B 结构完成度 / C 细节与整理',
      process_steps: [
        {step_name:'导入聚焦', duration:'4分钟', teacher_action:'先看 2 组球衣案例，让学生说“先看到了什么”。', student_task:'比较两组案例，判断哪一组更像真正的班级球衣。', material:'案例板', ppt:'案例对比页'},
        {step_name:'拆解任务', duration:'5分钟', teacher_action:'把球衣设计拆成“主色 / 主标识 / 辅助图形”三层。', student_task:'在任务卡上圈出自己班最想表达的元素。', material:'关键词卡、任务卡', ppt:'任务拆解页'},
        {step_name:'教师示范', duration:'6分钟', teacher_action:'示范先画整体块面和主标识，再决定图案和数字位置。', student_task:'跟着示范在草图纸上先定主色和主形。', material:'轮廓纸、示范图', ppt:'示范页'},
        {step_name:'学生设计', duration:'15分钟', teacher_action:'巡视时先看整体是否成立，再提醒学生不要过早陷入装饰细节。', student_task:'完成球衣草图并补班级元素。', material:'彩色工具', ppt:'巡视提醒页'},
        {step_name:'展示小评', duration:'6分钟', teacher_action:'先看一眼能不能认出这是谁的球衣，再看细节。', student_task:'互评“哪一件最有班级感”。', material:'展示夹', ppt:'评价页'}
      ],
      resource_notes: '优先准备案例板和任务拆解页，帮助学生避免一上来就画碎。',
      revision_notes: '后续可以为不同班再加“差异提醒”，但主稿先保持统一。'
    },
    {
      lesson_design_id: 'lesson-design-g4-voyage-1',
      unit_id: 'unit-g4-voyage',
      unit_name: '梦中的远航',
      grade_scope: '四年级',
      lesson_no: '课时1',
      topic_name: '梦中的远航',
      theme: '用主题创作方式完成一份“远航”叙事画面设计。',
      linked_execution: '待挂接到执行线',
      unit_bridge: '这是完整教学设计案例，本页重点不是“赶紧挂时间轴”，而是先把整份设计写完整。',
      lesson_goals: [
        '通过情境图像和问题引导激发学生对“远航”的想象。',
        '能围绕主体、背景和故事线组织一幅远航主题作品。',
        '能在信息技术支持下理解示范图、参考图和过程分解图。'
      ],
      focus_difficulty: '重点：主题表达和故事感。难点：画面层次、主体与背景的叙事关系。',
      teacher_prepare: '远航主题图像、船只与海洋参考、示范画面拆解、投影与展示支持材料。',
      student_prepare: '绘画工具、草稿纸、色彩材料。',
      assignment_code: 'YH.1',
      assignment_title: '梦中的远航',
      assignment_requirement: '完成一幅“梦中的远航”主题作品，画面里要有清楚的主体、背景和梦境表达线索。',
      key_points: '看主题表达、故事感、画面组织和色彩氛围。',
      dimension_summary: 'A 主题表达 / B 画面组织 / C 创意与氛围',
      process_steps: [
        {step_name:'情境导入', duration:'5分钟', teacher_action:'播放远航与海洋主题图像，引导学生说“如果这是你的梦，会去哪里”。', student_task:'说一个自己的远航想象。', material:'图像与投影', ppt:'导入情境页'},
        {step_name:'任务建立', duration:'6分钟', teacher_action:'拆解“主体 / 背景 / 梦境元素”三层画面结构。', student_task:'用关键词卡写下自己的远航故事线。', material:'关键词卡', ppt:'任务拆解页'},
        {step_name:'示范与分析', duration:'8分钟', teacher_action:'示范如何先定主体，再补背景和梦境元素，并说明信息技术支持如何帮助观察。', student_task:'观察示范图，说出一处画面主次关系。', material:'示范画、投影', ppt:'示范步骤页'},
        {step_name:'学生创作', duration:'18分钟', teacher_action:'巡视时帮助学生先稳主体位置，再慢慢丰富故事细节。', student_task:'完成主体和背景的初步设计。', material:'画纸、彩色工具', ppt:'巡视提醒页'},
        {step_name:'展示与交流', duration:'8分钟', teacher_action:'让学生讲述自己的远航故事，再做课堂收束。', student_task:'用一句话讲自己的作品。', material:'展示台', ppt:'展示页'}
      ],
      resource_notes: '本页适合承载“教师活动 / 学生活动 / 信息技术支持”这一类完整教学设计内容。',
      revision_notes: '如果后续挂接到执行线，需要再补具体年级、周次和作业实例信息。'
    }
  ];

  function clone(value){
    return JSON.parse(JSON.stringify(value));
  }

  function _realBridgeList(section, key, fallback){
    if (section === 'design') {
      const contentList = CONTENT_LIBRARY_BRIDGE?.design?.[key];
      if (Array.isArray(contentList) && contentList.length) {
        return contentList;
      }
    }
    const list = REAL_BRIDGE?.[section]?.[key];
    return Array.isArray(list) && list.length ? list : fallback;
  }

  function _readJsonArrayStore(key){
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function _writeJsonArrayStore(key, value){
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function _filterCoursePlanItems(items, query){
    return items.filter(item => {
      if (query?.semester_plan_id && item.semester_plan_id !== query.semester_plan_id) return false;
      if (query?.semester_week_plan_id && item.semester_week_plan_id !== query.semester_week_plan_id) return false;
      if (query?.week_no && String(item.week_no) !== String(query.week_no)) return false;
      if (query?.course_plan_item_id && item.course_plan_item_id !== query.course_plan_item_id) return false;
      if (query?.lesson_key && item.lesson_key !== query.lesson_key) return false;
      if (query?.class_id && item.class_id !== query.class_id) return false;
      if (query?.class_name && item.class_name !== query.class_name) return false;
      if (query?.content_unit_id && item.content_unit_id !== query.content_unit_id) return false;
      return true;
    });
  }

  function listCoursePlanItems(query){
    const fallback = _realBridgeList('execution', 'lessonTasks', lessonTasks);
    const raw = _realBridgeList('execution', 'coursePlanItems', fallback);
    const normalized = raw.map(normalizeCoursePlanItem);
    return clone(_filterCoursePlanItems(normalized, query));
  }

  function listLessonTasks(query){
    return listCoursePlanItems(query);
  }

  function listSemesterPlans(){
    const raw = _realBridgeList('execution', 'semesterPlans', [buildSemesterPlanSeed(listCoursePlanItems())]);
    return clone(raw);
  }

  function listSemesterWeekPlans(query){
    const fallback = buildSemesterWeekPlansSeed(listCoursePlanItems());
    const raw = _realBridgeList('execution', 'semesterWeekPlans', fallback);
    const filtered = raw.filter(item => {
      if (query?.semester_plan_id && item.semester_plan_id !== query.semester_plan_id) return false;
      if (query?.week_no && String(item.week_no) !== String(query.week_no)) return false;
      return true;
    });
    return clone(filtered);
  }

  function listAssignmentInstances(query){
    const raw = _realBridgeList('execution', 'assignmentInstances', buildAssignmentInstancesSeed(listCoursePlanItems()));
    const filtered = raw.filter(item => {
      if (query?.assignment_instance_id && item.assignment_instance_id !== query.assignment_instance_id) return false;
      if (query?.course_plan_item_id && item.course_plan_item_id !== query.course_plan_item_id) return false;
      if (query?.class_id && item.class_id !== query.class_id) return false;
      return true;
    });
    return clone(filtered);
  }

  function listSubmissionSlots(query){
    const raw = _realBridgeList('execution', 'submissionSlots', buildSubmissionSlotsSeed(listAssignmentInstances()));
    const filtered = raw.filter(item => {
      if (query?.submission_slot_id && item.submission_slot_id !== query.submission_slot_id) return false;
      if (query?.assignment_instance_id && item.assignment_instance_id !== query.assignment_instance_id) return false;
      if (query?.student_id && item.student_id !== query.student_id) return false;
      if (query?.class_id && item.class_id !== query.class_id) return false;
      return true;
    });
    return clone(filtered);
  }

  function _mergeDesignSeedWithStore(seedList, keyName, storeKey){
    const saved = _readJsonArrayStore(storeKey);
    const merged = seedList.map(seed => {
      const override = saved.find(item => item[keyName] === seed[keyName]);
      return override ? { ...seed, ...override } : seed;
    });
    const extras = saved.filter(item => !seedList.some(seed => seed[keyName] === item[keyName]));
    return [...merged, ...extras];
  }

  function listUnitPackages(){
    const baseUnits = _realBridgeList('design', 'unitPackages', unitPackages).map(item => {
      const normalized = { ...item };
      if (Array.isArray(normalized.lesson_map)) {
        normalized.lesson_map = normalized.lesson_map.map((lessonItem, index) => ({
          ...lessonItem,
          lesson_no: lessonItem.lesson_no || `课时${index + 1}`
        }));
      }
      return normalized;
    });
    return clone(_mergeDesignSeedWithStore(baseUnits, 'unit_id', UNIT_DESIGN_STORE_KEY));
  }

  function findUnitPackage(query){
    if (!query) return null;
    const list = listUnitPackages();
    return clone(list.find(item => {
      if (query.unit_id && item.unit_id !== query.unit_id) return false;
      if (query.unit_name && item.unit_name !== query.unit_name) return false;
      return true;
    }) || null);
  }

  function saveUnitPackage(payload){
    if (!payload || !payload.unit_id) return null;
    const store = _readJsonArrayStore(UNIT_DESIGN_STORE_KEY);
    const snapshot = {
      ...payload,
      saved_at: payload.saved_at || new Date().toISOString()
    };
    const index = store.findIndex(item => item.unit_id === payload.unit_id);
    if (index >= 0) {
      store[index] = snapshot;
    } else {
      store.push(snapshot);
    }
    _writeJsonArrayStore(UNIT_DESIGN_STORE_KEY, store);
    return clone(snapshot);
  }

  function listLessonDesigns(query){
    const baseLessons = _realBridgeList('design', 'lessonDesigns', lessonDesigns).map((item, index) => ({
      ...item,
      lesson_no: item.lesson_no || `课时${index + 1}`
    }));
    const list = _mergeDesignSeedWithStore(baseLessons, 'lesson_design_id', LESSON_DESIGN_STORE_KEY);
    const filtered = list.filter(item => {
      if (query?.unit_id && item.unit_id !== query.unit_id) return false;
      if (query?.grade_scope && item.grade_scope !== query.grade_scope) return false;
      return true;
    });
    return clone(filtered);
  }

  function findLessonDesign(query){
    if (!query) return null;
    const list = listLessonDesigns(query);
    return clone(list.find(item => {
      if (query.lesson_design_id && item.lesson_design_id !== query.lesson_design_id) return false;
      if (query.topic_name && item.topic_name !== query.topic_name) return false;
      return true;
    }) || null);
  }

  function saveLessonDesign(payload){
    if (!payload || !payload.lesson_design_id) return null;
    const store = _readJsonArrayStore(LESSON_DESIGN_STORE_KEY);
    const snapshot = {
      ...payload,
      saved_at: payload.saved_at || new Date().toISOString()
    };
    const index = store.findIndex(item => item.lesson_design_id === payload.lesson_design_id);
    if (index >= 0) {
      store[index] = snapshot;
    } else {
      store.push(snapshot);
    }
    _writeJsonArrayStore(LESSON_DESIGN_STORE_KEY, store);
    return clone(snapshot);
  }

  function _buildLocalApiUrl(path){
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (window.location && /^https?:$/i.test(window.location.protocol)) {
      return normalized;
    }
    return `${DESIGN_VERSION_API_BASE}${normalized}`;
  }

  async function _postDesignVersion(path, payload){
    const response = await fetch(_buildLocalApiUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.success) {
      throw new Error(body.error_message || `HTTP ${response.status}`);
    }
    return body;
  }

  async function persistUnitDesignVersion(payload){
    const localSnapshot = saveUnitPackage(payload);
    try {
      const synced = await _postDesignVersion('/api/xiaobei/design_versions/unit/save', localSnapshot);
      return saveUnitPackage({
        ...localSnapshot,
        version_sync_status: 'saved',
        version_record_id: synced.version_record_id || '',
        design_version_no: synced.version_no || '',
        version_saved_at: synced.saved_at || '',
        version_sync_message: ''
      });
    } catch (error) {
      return saveUnitPackage({
        ...localSnapshot,
        version_sync_status: 'local_only',
        version_sync_message: error?.message || '版本表同步失败，请稍后重试'
      });
    }
  }

  async function persistLessonDesignVersion(payload){
    const localSnapshot = saveLessonDesign(payload);
    try {
      const synced = await _postDesignVersion('/api/xiaobei/design_versions/lesson/save', localSnapshot);
      return saveLessonDesign({
        ...localSnapshot,
        version_sync_status: 'saved',
        version_record_id: synced.version_record_id || '',
        design_version_no: synced.version_no || '',
        version_saved_at: synced.saved_at || '',
        version_sync_message: ''
      });
    } catch (error) {
      return saveLessonDesign({
        ...localSnapshot,
        version_sync_status: 'local_only',
        version_sync_message: error?.message || '版本表同步失败，请稍后重试'
      });
    }
  }

  function listRecentDesignDrafts(limit){
    const units = _readJsonArrayStore(UNIT_DESIGN_STORE_KEY).map(item => ({
      design_type: 'unit',
      identity: item.unit_id,
      title: item.unit_name,
      saved_at: item.saved_at || '',
      payload: clone(item)
    }));
    const lessons = _readJsonArrayStore(LESSON_DESIGN_STORE_KEY).map(item => ({
      design_type: 'lesson',
      identity: item.lesson_design_id,
      title: item.topic_name,
      saved_at: item.saved_at || '',
      payload: clone(item)
    }));
    const max = Number.isFinite(Number(limit)) ? Number(limit) : 6;
    return clone([...units, ...lessons]
      .sort((a, b) => String(b.saved_at || '').localeCompare(String(a.saved_at || '')))
      .slice(0, max));
  }

  function hasUnitDesignDraft(unit){
    return !!(unit && (unit.saved_at || unit.version_sync_status || unit.design_version_no));
  }

  function hasLessonDesignDraft(lesson){
    return !!(lesson && (lesson.saved_at || lesson.version_sync_status || lesson.design_version_no));
  }

  function getDesignSourceLabel(item){
    if (!item) return '未识别来源';
    const hasDraft = !!(item.saved_at || item.version_sync_status || item.design_version_no);
    if (hasDraft) return '本轮设计稿';
    if (item.source_mode === 'content_library') return '内容库母稿';
    if (item.source_mode === 'real_bridge') return '真实桥内容';
    return '样例内容';
  }

  function getDesignSyncSummary(item){
    if (!item) return '尚未保存';
    if (item.version_sync_status === 'saved') {
      return item.design_version_no ? `已同步 ${item.design_version_no}` : '已同步到版本表';
    }
    if (item.version_sync_status === 'local_only') {
      return item.version_sync_message ? `仅本地：${item.version_sync_message}` : '仅本地保存';
    }
    if (item.saved_at) return '已保存为本地设计稿';
    return '尚未形成设计稿';
  }

  function _countFilledLines(value){
    if (Array.isArray(value)) return value.filter(Boolean).length;
    return String(value || '').split(/\r?\n/).map(item => item.trim()).filter(Boolean).length;
  }

  function _hasText(value){
    return !!String(value || '').trim();
  }

  function buildDesignCenterAiWorkbench(units, lessons, activeUnit, unitLessons){
    const targetUnit = activeUnit || units[0] || null;
    const targetLessons = Array.isArray(unitLessons) ? unitLessons : [];
    const pendingAttach = (lessons || []).filter(item => String(item.linked_execution || '').includes('待挂接') || String(item.linked_execution || '').includes('尚未挂接')).length;
    const draftCount = (lessons || []).filter(item => hasLessonDesignDraft(item)).length + (units || []).filter(item => hasUnitDesignDraft(item)).length;
    const focus = targetUnit
      ? `${targetUnit.unit_name} 是当前主单元，已有 ${targetUnit.lesson_content_count || targetUnit.total_lessons || 0} 节课时内容。`
      : '先从左侧选择一个大单元，再让 AI 帮你判断下一步。';
    const firstLesson = targetLessons[0] || null;
    return {
      title: 'AI 设计助手',
      summary: `当前库里有 ${units.length} 个大单元、${lessons.length} 个课时内容，${draftCount} 个设计稿已产生版本或本地覆盖。`,
      focus,
      context: [
        { label:'当前年级', value: targetUnit?.grade_scope || '未锁定' },
        { label:'当前大单元', value: targetUnit?.unit_name || '未锁定' },
        { label:'课时数量', value: `${targetLessons.length} 节` },
        { label:'待挂接', value: `${pendingAttach} 节` }
      ],
      actions: [
        {
          key: 'gap_scan',
          title: 'AI 先看缺口',
          helper: '先看当前单元还缺哪一层',
          output: targetUnit
            ? `建议优先检查：单元目标 ${targetUnit.goal_count || 0} 条、作评定义 ${targetUnit.assignment_definition_count || 0} 条、资源 ${targetUnit.resource_count || 0} 条。${pendingAttach ? `当前还有 ${pendingAttach} 节课时待挂接。` : '当前没有待挂接课时。'}`
            : '当前还没有锁定单元，先从左侧选中一个大单元。'
        },
        {
          key: 'next_unit',
          title: 'AI 推荐下一步',
          helper: '决定先改单元还是先改课时',
          output: firstLesson
            ? `建议先进入《${firstLesson.topic_name}》继续整理课时，因为它是当前单元最先可推进的一节课。`
            : (targetUnit ? `建议先补《${targetUnit.unit_name}》的大单元骨架，再生成第一节课时内容。` : '建议先新建一个大单元，再补课时骨架。')
        },
        {
          key: 'ready_check',
          title: 'AI 看执行准备度',
          helper: '先看能不能挂回执行层',
          output: targetLessons.length
            ? `当前单元共有 ${targetLessons.length} 节课时内容；其中已形成设计稿的有 ${targetLessons.filter(item => hasLessonDesignDraft(item)).length} 节。只有形成设计稿并补齐过程、作评、资源后，才建议进入挂接安排。`
            : '当前单元还没有课时内容，暂时不建议进入执行挂接。'
        }
      ]
    };
  }

  function buildUnitAiWorkbench(unit){
    if (!unit) return null;
    const goalCount = Array.isArray(unit.core_literacy_goals) ? unit.core_literacy_goals.filter(Boolean).length : 0;
    const resourceCount = Array.isArray(unit.resource_list) ? unit.resource_list.filter(Boolean).length : 0;
    const assignmentCount = Array.isArray(unit.assignment_overview) ? unit.assignment_overview.filter(Boolean).length : 0;
    const lessonCount = Number(unit.total_lessons) || 0;
    return {
      title: '小备 AI 单元工作台',
      summary: `${getDesignSourceLabel(unit)} · ${getDesignSyncSummary(unit)}`,
      focus: `当前单元《${unit.unit_name}》共有 ${lessonCount} 课时，目标 ${goalCount} 条，资源 ${resourceCount} 条，作评总览 ${assignmentCount} 条。`,
      context: [
        { label:'当前年级', value: unit.grade_scope || '未设置' },
        { label:'单元类型', value: unit.design_type || '常规单元' },
        { label:'总课时', value: `${lessonCount} 节` },
        { label:'当前来源', value: getDesignSourceLabel(unit) }
      ],
      actions: [
        {
          key: 'unit_goals',
          title: 'AI 补单元目标',
          helper: '把目标写得更像可落地设计稿',
          output: goalCount >= 3
            ? `当前目标数量够用，建议下一步把每条目标再明确到“哪几课承接、最后如何看得见”。`
            : `当前目标偏少，建议至少补到 3 条以上，并分别覆盖审美感知、艺术表现、创意实践。`
        },
        {
          key: 'unit_map',
          title: 'AI 看课时拆分',
          helper: '先判断这几个课时承担什么',
          output: lessonCount
            ? `建议把 ${lessonCount} 节课分成“导入认知 / 技法练习 / 完整创作 / 展评收束”这样的递进结构，再逐课补内容。`
            : '当前还没有课时数量，先补总课时。'
        },
        {
          key: 'unit_resources',
          title: 'AI 梳理资源作评',
          helper: '先看资源与作评有没有落点',
          output: `当前资源 ${resourceCount} 条、作评总览 ${assignmentCount} 条。建议下一步把每类资源和作评分别落到对应课时，不要只停在单元层。`
        },
        {
          key: 'unit_attach',
          title: 'AI 挂接前检查',
          helper: '先判断能不能进执行层',
          output: hasUnitDesignDraft(unit)
            ? '当前单元已经形成设计稿，下一步先检查每节课是否都有完整课时内容，再进入挂接安排。'
            : '当前还停留在内容母稿层，建议先保存为本轮设计稿，再考虑挂接。'
        }
      ]
    };
  }

  function buildLessonAiWorkbench(lesson, unit){
    if (!lesson) return null;
    const processCount = Array.isArray(lesson.process_steps) ? lesson.process_steps.filter(Boolean).length : 0;
    const goalCount = Array.isArray(lesson.lesson_goals) ? lesson.lesson_goals.filter(Boolean).length : 0;
    return {
      title: 'AI 课时工作台',
      summary: `${getDesignSourceLabel(lesson)} · ${getDesignSyncSummary(lesson)}`,
      focus: `当前课时《${lesson.topic_name}》已有 ${goalCount} 条课时目标、${processCount} 段教学过程。`,
      context: [
        { label:'当前年级', value: lesson.grade_scope || '未设置' },
        { label:'所属单元', value: unit?.unit_name || lesson.unit_name || '未设置' },
        { label:'当前课时', value: `${lesson.lesson_no} · ${lesson.topic_name}` },
        { label:'当前来源', value: getDesignSourceLabel(lesson) }
      ],
      actions: [
        {
          key: 'lesson_goals',
          title: 'AI 补课时目标',
          helper: '把目标补成可教、可看、可评',
          output: goalCount >= 3
            ? '当前目标数量基本够用，建议进一步检查每条目标是否真的能在课堂中被看到、被评价。'
            : '当前目标偏少，建议至少补到 3 条，并分别对应知识理解、过程体验和作品输出。'
        },
        {
          key: 'lesson_process',
          title: 'AI 看过程展开',
          helper: '检查过程是不是撑得住一整课',
          output: processCount >= 5
            ? `当前已经有 ${processCount} 段过程，建议继续补强每段的教师活动、学生活动和成功标准。`
            : '当前过程偏薄，建议先把导入、欣赏/解析、实践/探索、创作、展示评价这些主段补齐。'
        },
        {
          key: 'lesson_digital',
          title: 'AI 看信息化支撑',
          helper: '判断 AI/技术是不是放对位置',
          output: _hasText(lesson.resource_notes)
            ? '当前课时已经有资源与技术说明，建议再检查哪些环节是真正需要信息化支持，哪些不需要硬塞 AI。'
            : '当前还缺资源与技术说明，建议先补清楚“什么环节需要平台/AI，什么环节只靠常规材料”。'
        },
        {
          key: 'lesson_assignment',
          title: 'AI 梳理作评定义',
          helper: '先看课时输出和评价标准',
          output: _hasText(lesson.assignment_requirement) || _hasText(lesson.dimension_summary)
            ? '当前课时已经有作业或评价摘要，建议下一步对齐到内容库里的作评定义，再决定是否生成执行实例。'
            : '当前还没有清楚的作业与评价摘要，建议先补本课输出成果、评价要点和维度摘要。'
        }
      ]
    };
  }

  function findLessonTask(query){
    if (!query) return null;
    return listCoursePlanItems(query)[0] || null;
  }

  function findCoursePlanItem(query){
    return findLessonTask(query);
  }

  function buildSelectedLessonContext(task){
    return {
      object_type: 'execution_context',
      semester_plan_id: task.semester_plan_id,
      semester_week_plan_id: task.semester_week_plan_id,
      course_plan_item_id: task.course_plan_item_id,
      lesson_key: task.lesson_key,
      content_unit_id: task.content_unit_id,
      content_lesson_id: task.content_lesson_id,
      lesson_design_version_id: task.lesson_design_version_id,
      topic_seq: task.topic_seq,
      topic_name: task.topic_name,
      grade_scope: task.grade_scope,
      lesson_type: task.lesson_type,
      assignment_required: task.assignment_required,
      unit_name: task.unit_name,
      planned_week: task.week_label,
      class_id: task.class_id,
      class_name: task.class_name
    };
  }

  function buildTeachingSlotContext(task){
    return {
      object_type: 'teaching_slot_context',
      semester_plan_id: task.semester_plan_id,
      semester_week_plan_id: task.semester_week_plan_id,
      course_plan_item_id: task.course_plan_item_id,
      week_label: task.week_label,
      date_range: task.date_range,
      date_label: task.date_label,
      day_label: task.day_label,
      period: task.period,
      class_id: task.class_id,
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

  function writeCoursePlanSelection(coursePlanItem){
    return writeLessonSelection(coursePlanItem);
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

  function resolveCoursePlanContextFromQuery(){
    return resolveLessonContextFromQuery();
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
      object_type: 'prep_run_draft',
      prep_run_id: previous?.prep_run_id || `prep-run-${task.course_plan_item_id}`,
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

  function savePrepRun(coursePlanItem, payload){
    return savePrepDraft(coursePlanItem, payload);
  }

  function _readClassroomRunStore(){
    try {
      const raw = window.localStorage.getItem(CLASSROOM_RUN_STORE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function _writeClassroomRunStore(records){
    try {
      window.localStorage.setItem(CLASSROOM_RUN_STORE_KEY, JSON.stringify(records));
      return true;
    } catch (error) {
      return false;
    }
  }

  function saveClassroomRun(task, payload){
    if (!task || !task.course_plan_item_id || !task.lesson_key) {
      throw new Error('task with course_plan_item_id and lesson_key is required.');
    }
    const now = new Date().toISOString();
    const store = _readClassroomRunStore();
    const existingIndex = store.findIndex(item =>
      item.course_plan_item_id === task.course_plan_item_id &&
      item.lesson_key === task.lesson_key
    );
    const previous = existingIndex >= 0 ? store[existingIndex] : null;
    const snapshot = {
      object_type: 'classroom_run',
      classroom_run_id: previous?.classroom_run_id || `classroom-run-${task.course_plan_item_id}`,
      course_plan_item_id: task.course_plan_item_id,
      lesson_key: task.lesson_key,
      topic_name: task.topic_name,
      unit_name: task.unit_name,
      grade_scope: task.grade_scope,
      lesson_type: task.lesson_type,
      class_name: task.class_name,
      week_label: task.week_label,
      day_label: task.day_label,
      period: task.period,
      status: payload.status || '准备上课',
      checklist: clone(payload.checklist || {}),
      class_note: payload.class_note || '',
      completion_note: payload.completion_note || '',
      assignment_note: payload.assignment_note || '',
      reflection_note: payload.reflection_note || '',
      linked_draft_id: payload.linked_draft_id || '',
      linked_draft_mode: payload.linked_draft_mode || '',
      updated_at: now,
      created_at: previous?.created_at || now
    };
    if (existingIndex >= 0) {
      store[existingIndex] = snapshot;
    } else {
      store.push(snapshot);
    }
    _writeClassroomRunStore(store);
    return clone(snapshot);
  }

  function findClassroomRun(query){
    if (!query) return null;
    const store = _readClassroomRunStore();
    const matched = store.filter(item => {
      if (query.course_plan_item_id && item.course_plan_item_id !== query.course_plan_item_id) return false;
      if (query.lesson_key && item.lesson_key !== query.lesson_key) return false;
      if (query.classroom_run_id && item.classroom_run_id !== query.classroom_run_id) return false;
      return true;
    });
    matched.sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')));
    return matched.length ? clone(matched[0]) : null;
  }

  function listClassroomRuns(query){
    const store = _readClassroomRunStore().filter(item => {
      if (query?.course_plan_item_id && item.course_plan_item_id !== query.course_plan_item_id) return false;
      if (query?.lesson_key && item.lesson_key !== query.lesson_key) return false;
      if (query?.class_name && item.class_name !== query.class_name) return false;
      return true;
    });
    store.sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')));
    return clone(store);
  }

  function getDraftModeLabel(mode){
    if (mode === 'minimal') return '极简版';
    if (mode === 'rapid') return '快速版';
    if (mode === 'refine') return '精修页';
    return '未识别模式';
  }

  function getSavedDraftLabel(mode){
    if (mode === 'minimal') return '已保存极简运行稿';
    if (mode === 'rapid') return '已保存快速运行稿';
    if (mode === 'refine') return '已保存精修运行稿';
    return '已保存运行稿';
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

  function findLatestPrepRunDraft(query){
    return findLatestPrepDraft(query);
  }

  function listPrepDrafts(){
    const store = _readLocalDraftStore();
    store.sort((a, b) => String(b.saved_at || '').localeCompare(String(a.saved_at || '')));
    return clone(store);
  }

  function listPrepRunDrafts(){
    return listPrepDrafts();
  }

  function listPrepRuns(query){
    const items = listCoursePlanItems(query);
    return clone(items.map(item => {
      const latestDraft = findLatestPrepDraft({
        course_plan_item_id: item.course_plan_item_id,
        lesson_key: item.lesson_key
      });
      return {
        object_type: 'prep_run',
        prep_run_id: latestDraft?.prep_run_id || `prep-run-${item.course_plan_item_id}`,
        course_plan_item_id: item.course_plan_item_id,
        lesson_design_version_id: item.lesson_design_version_id,
        lesson_key: item.lesson_key,
        topic_name: item.topic_name,
        class_id: item.class_id,
        class_name: item.class_name,
        prep_mode: latestDraft?.draft_mode || 'not_started',
        brief_snapshot_json: latestDraft?.brief_snapshot || [],
        class_adjustment_json: {},
        draft_body_json: latestDraft?.fields || {},
        save_status: latestDraft ? 'draft' : 'not_started',
        updated_at: latestDraft?.saved_at || ''
      };
    }));
  }

  function findLatestPrepRun(query){
    if (!query) return null;
    const item = query?.topic_name ? clone(query) : findLessonTask(query);
    if (!item) return null;
    const latestDraft = findLatestPrepDraft({
      course_plan_item_id: item.course_plan_item_id,
      lesson_key: item.lesson_key,
      draft_mode: query.draft_mode
    });
    return {
      object_type: 'prep_run',
      prep_run_id: latestDraft?.prep_run_id || `prep-run-${item.course_plan_item_id}`,
      course_plan_item_id: item.course_plan_item_id,
      lesson_design_version_id: item.lesson_design_version_id,
      lesson_key: item.lesson_key,
      topic_name: item.topic_name,
      class_id: item.class_id,
      class_name: item.class_name,
      prep_mode: latestDraft?.draft_mode || 'not_started',
      brief_snapshot_json: latestDraft?.brief_snapshot || [],
      class_adjustment_json: latestDraft?.fields?.class_adjustments || {},
      draft_body_json: latestDraft?.fields || {},
      save_status: latestDraft ? 'draft' : 'not_started',
      updated_at: latestDraft?.saved_at || '',
      latest_draft: latestDraft ? clone(latestDraft) : null
    };
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

  function buildCoursePlanRuntimeItem(coursePlanItemOrQuery){
    return buildRuntimeLessonTask(coursePlanItemOrQuery);
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
        execution_context: runtimeTask ? clone(runtimeTask) : null,
        runtime_task: runtimeTask ? clone(runtimeTask) : null
      });
      if (recent.length >= max) break;
    }

    return clone(recent);
  }

  function listRecentPrepRuns(limit){
    return listRecentPrepLessons(limit);
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
        summary: '当前还没有已保存运行稿',
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
        summary: '当前还没有已保存运行稿',
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

  function describeLatestPrepRun(taskOrQuery){
    return describeLatestDraft(taskOrQuery);
  }

  function buildLessonIdentitySummary(taskOrQuery){
    const runtimeTask = buildRuntimeLessonTask(taskOrQuery);
    if (!runtimeTask) return null;
    const latestDraftDesc = describeLatestDraft(runtimeTask);
    return {
      topic_name: runtimeTask.topic_name,
      week_date: `${runtimeTask.week_label} · ${runtimeTask.date_range}`,
      slot: `${runtimeTask.class_name} · ${runtimeTask.day_label}${runtimeTask.period}`,
      unit_type: `${runtimeTask.unit_name} · ${runtimeTask.lesson_type}`,
      status: runtimeTask.status,
      draft_summary: latestDraftDesc?.summary || '当前还没有已保存运行稿',
      risk_tag: runtimeTask.risk_tag,
      assignment_summary: runtimeTask.assignment_summary
    };
  }

  function getRealBridgeInfo(){
    return clone({
      enabled: !!REAL_BRIDGE,
      source: REAL_BRIDGE?.source || null,
      issues: Array.isArray(REAL_BRIDGE?.issues) ? REAL_BRIDGE.issues : [],
      execution_issues: Array.isArray(REAL_BRIDGE?.execution?.issues) ? REAL_BRIDGE.execution.issues : [],
      content_library_enabled: !!CONTENT_LIBRARY_BRIDGE,
      content_library_source: CONTENT_LIBRARY_BRIDGE?.source || null,
      content_library_issues: Array.isArray(CONTENT_LIBRARY_BRIDGE?.design?.issues) ? CONTENT_LIBRARY_BRIDGE.design.issues : []
    });
  }

  window.XIAOBEI_PREP_TRUTH_SOURCE_V1 = {
    version: 'v1',
    storage_keys: {
      selected_context: SELECTED_CONTEXT_V1_1_KEY,
      selected_context_legacy: LEGACY_SELECTED_CONTEXT_KEY,
      teaching_slot_context: TEACHING_SLOT_CONTEXT_KEY,
      prep_draft_store: PREP_DRAFT_STORE_KEY,
      classroom_run_store: CLASSROOM_RUN_STORE_KEY,
      unit_design_store: UNIT_DESIGN_STORE_KEY,
      lesson_design_store: LESSON_DESIGN_STORE_KEY
    },
    listSemesterPlans,
    listSemesterWeekPlans,
    listCoursePlanItems,
    listLessonTasks,
    listAssignmentInstances,
    listSubmissionSlots,
    listUnitPackages,
    findUnitPackage,
    saveUnitPackage,
    persistUnitDesignVersion,
    listLessonDesigns,
    findLessonDesign,
    saveLessonDesign,
    persistLessonDesignVersion,
    listRecentDesignDrafts,
    hasUnitDesignDraft,
    hasLessonDesignDraft,
    getDesignSourceLabel,
    getDesignSyncSummary,
    buildDesignCenterAiWorkbench,
    buildUnitAiWorkbench,
    buildLessonAiWorkbench,
    findLessonTask,
    findCoursePlanItem,
    buildSelectedLessonContext,
    buildTeachingSlotContext,
    writeLessonSelection,
    writeCoursePlanSelection,
    buildBrief,
    resolveLessonContextFromQuery,
    resolveCoursePlanContextFromQuery,
    savePrepDraft,
    savePrepRun,
    getDraftModeLabel,
    getSavedDraftLabel,
    getContinueActionLabel,
    findLatestPrepDraft,
    findLatestPrepRunDraft,
    listPrepDrafts,
    listPrepRunDrafts,
    saveClassroomRun,
    findClassroomRun,
    listClassroomRuns,
    listPrepRuns,
    findLatestPrepRun,
    listRecentPrepLessons,
    listRecentPrepRuns,
    describeLatestDraft,
    describeLatestPrepRun,
    buildLessonIdentitySummary,
    getPrepDraftState,
    buildRuntimeLessonTask,
    buildCoursePlanRuntimeItem,
    getRealBridgeInfo
  };
})();

# 备课原型个人验收包 v1

## 这份包怎么用

这不是继续规划的材料，而是一份个人验收顺序清单。

建议按下面顺序一页页看：

1. `frontend/xiaobei_prepare_desktop_preview.html`
2. `frontend/xiaobei_teaching_calendar_preview.html`
3. `frontend/xiaobei_formal_lesson_picker_preview.html`
4. `frontend/xiaobei_preclass_brief_preview.html`
5. `frontend/xiaobei_prepare_draft_preview.html`
6. `frontend/xiaobei_prepare_refine_preview.html`
7. `frontend/xiaobei_user_profile_preview.html`
8. `frontend/xiaobei_ai_semester_planner_preview.html`

## 个人验收只看 6 个问题

### 1. 首页是否先分流老师意图

看点：
- 能不能明确区分“继续上次 / 今天快速备一节 / 调整教学安排 / 查看学期安排”
- 有没有一进来就逼老师选课

### 2. 学期教学安排是否支持现实中的变动

看点：
- 是否看得见原计划 / 实际执行
- 是否能理解“改的是未来，不抹掉过去”

### 3. 正式选课是否只做选课

看点：
- 是否只锁定一节真实课时
- 有没有偷偷开始生成或写稿

### 4. 课前简报是否只做定向

看点：
- 是否还残留明显工程口音
- 是否已经默认推荐先进入快速版

### 5. 快速版和精修页是否真的是同一节课

看点：
- 标题一致
- 身份条一致
- 正文内容一致
- 保存 / 再进时是否还能回到同一条草稿链

### 6. 继续编辑是否已经成立

看点：
- 首页“继续上次备课”
- 最近在备的课
- 正式选课页的草稿状态
- brief / 快速版 / 精修页的继续入口

## 当前个人验收通过标准

只要下面 4 条成立，就可以判定原型阶段基本完成：

1. 标准主线能顺着走完一遍
2. 快速备一节短路径能顺着走完一遍
3. 同一节课 / 同一草稿链已经可信
4. supporting pages 没有再抢主线

## 个人验收后再做什么

如果这轮个人验收通过，后面就不再继续磨原型细枝末节，而是转：

- 正式产品重写
- 干净组件化
- 正式接口层接入
- 真正账号和持久化接入

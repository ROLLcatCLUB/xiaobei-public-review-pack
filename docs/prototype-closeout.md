# 备课原型收官说明 v1

## 当前目标

本轮原型阶段的目标不是继续扩系统，而是把第一阶段备课主线收成一条可连续体验的产品流。

当前冻结后的主线：

```text
备课入口台
-> 学期教学安排
-> 正式选课
-> 课前简报
-> 快速版（主推荐）
-> 精修页（需要时再进）
-> 保存
-> 下次继续编辑
```

## 当前已收住的页面角色

### 1. 备课入口台

文件：
- `frontend/xiaobei_prepare_desktop_preview.html`

职责：
- 先按老师意图分流
- 允许继续上次备课
- 允许今天快速备一节
- 允许查看或调整学期安排

不再承担：
- 教学执行首页
- 作业回收主台
- 学生学习主台

### 2. 学期教学安排页

文件：
- `frontend/xiaobei_teaching_calendar_preview.html`

职责：
- 看学期总纲和周历
- 同时保留原计划 / 实际执行
- 承接顺延和未来调整

### 3. 正式选课页

文件：
- `frontend/xiaobei_formal_lesson_picker_preview.html`

职责：
- 从真实课时项里选中一节课
- 锁定当前课时身份
- 主按钮固定进入课前简报

### 4. 课前简报页

文件：
- `frontend/xiaobei_preclass_brief_preview.html`

职责：
- 只做课前定向
- 不做生成
- 默认推荐先进入快速版

### 5. 快速版页

文件：
- `frontend/xiaobei_prepare_draft_preview.html`

职责：
- 承接简报
- 先立一版可继续编辑的主稿
- 支持保存和恢复

### 6. 精修页

文件：
- `frontend/xiaobei_prepare_refine_preview.html`

职责：
- 承接同一节课、同一草稿链
- 先维护公共主稿
- 再做班级差异调整
- 支持保存和恢复

## 当前 supporting pages

### 1. 教学档案页

文件：
- `frontend/xiaobei_user_profile_preview.html`

作用：
- 提供老师基础信息
- 提供教师课表
- 提供助手偏好

### 2. AI 学期排课向导

文件：
- `frontend/xiaobei_ai_semester_planner_preview.html`

作用：
- 作为上游 planning helper
- 不是当前备课主线连续性评审的核心页

### 3. 全局 AI 助手壳层

文件：
- `frontend/xiaobei_proto_shell_v1.js`
- `frontend/xiaobei_ai_assistant_panel_preview.html`

作用：
- 提供统一悬浮助手小精灵
- 不再做成独立“每页一个 AI”

## 当前原型阶段明确不做

- 真实登录系统
- 教学执行首页回归第一阶段
- 作业回收主台
- 学生学习主台
- 复杂 agent 编排
- 深后端重构

## 当前完成标准

### 已完成

- 主线页面角色已基本固定
- 标准路径和快速路径都能走通
- “继续编辑 / 最近在备的课” 已形成内部闭环
- `Rapid Draft -> Refine` 已对齐到同一节课内容

### 剩余工作只允许做收口

- 页面口径统一
- 公开审稿包同步
- 个人验收与最终审稿

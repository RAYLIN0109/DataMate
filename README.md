# DataMate — 快递业务智能查询系统

<p align="center">
    <b>用大白话查数据，业务人员无需会 SQL</b>
</p>

DataMate 是公司内部的**快递业务智能查询系统**，基于开源项目 [Dataherald](https://github.com/Dataherald/dataherald) 二次开发。业务人员只需用自然语言（大白话）提问，系统即可自动生成 SQL、查询业务数据库并返回答案。

## 适用场景

- 业务人员日常取数：运单量、揽收量、派送量、签收率等统计
- 时效分析：平均派送时效、准时率、延误件分析
- 异常件监控：滞留件、破损件、丢件等异常情况排查
- 网点/区域业绩：各网点、各区域业务量对比与排名
- 管理层自助查询：无需等待数据分析师排期出数

## 使用示例

| 业务问题（大白话） | 系统行为 |
|-------------------|----------|
| "昨天上海发往北京的快递有多少票？" | 生成 SQL → 查询 → 返回票数 |
| "本月华东区平均派送时效是多少？" | 生成聚合 SQL → 返回时效数据 |
| "近一周滞留超过 48 小时的件有哪些网点？" | 生成多表关联查询 → 返回网点清单 |
| "上月各网点的揽收量排名前 10" | 生成排序查询 → 返回排行榜 |

## 系统组成

| 服务 | 说明 | 是否必需 |
|------|------|----------|
| `engine` | 核心自然语言转 SQL 引擎：连接业务数据库、扫描表结构、生成并执行 SQL | 是 |
| `enterprise` | 应用服务层：用户登录、组织管理、API Key、用量统计 | 是 |
| `admin-console` | Web 管理界面：数据源配置、问答测试、查询记录、用户管理 | 是 |
| `slackbot` | Slack 机器人：在 Slack 里直接 @机器人 提问（可选） | 否 |

## 快速开始

### 1. 环境要求

- Docker 与 Docker Compose
- 各服务目录下按 `.env.example` 配置 `.env` 文件（数据库连接、LLM API Key 等）

### 2. 一键启动

```bash
sh docker-run.sh
```

该脚本会创建公共 Docker 网络并依次启动 Engine、Enterprise、Admin Console、Slackbot。

### 3. 开始使用

1. 浏览器访问 Admin Console（默认 `http://localhost:3000`）
2. 登录后在「数据库连接」页添加业务数据库（只读账号）
3. 同步表结构，进入「Playground」用大白话提问即可

## 二次开发说明

本项目基于 Dataherald（Apache 2.0）改造，保留了核心 NL-to-SQL 能力，并针对公司业务进行了以下定制：

- 业务数据库适配与表结构描述优化（快递运单、时效、网点等业务语义）
- 慢 SQL 管控：查询超时、行数限制、成本拦截等防护机制
- 面向内部业务人员的界面与交互调整

上游更新同步：`origin` 指向 Dataherald 官方仓库，可通过 `git fetch origin && git merge origin/main` 同步上游改动后自行解决冲突。

## 目录结构

```
.
├── docker-run.sh              # 一键启动脚本
└── services/
    ├── engine/                # 核心 NL-to-SQL 引擎（FastAPI + LangChain）
    ├── enterprise/            # 应用服务层（FastAPI：认证/组织/用量）
    ├── admin-console/         # Web 管理界面（Next.js）
    └── slackbot/              # Slack 机器人（可选）
```

## 许可证

本项目基于 Apache 2.0 协议的开源项目 Dataherald 二次开发，仅供公司内部使用。

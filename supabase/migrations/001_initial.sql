-- GTM Project Planner — initial schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Uncategorised',
  owner TEXT DEFAULT 'Shivani',
  sponsor TEXT DEFAULT '',
  rag TEXT DEFAULT 'unknown' CHECK (rag IN ('green','amber','red','unknown')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  stage TEXT DEFAULT 'Discovery',
  score INTEGER DEFAULT 30,
  target TEXT DEFAULT 'TBD',
  updated TEXT DEFAULT 'just now',
  updated_days INTEGER DEFAULT 0,
  focus BOOLEAN DEFAULT false,
  decision BOOLEAN DEFAULT false,
  business_case TEXT DEFAULT '',
  rag_reason TEXT DEFAULT '',
  success_metrics TEXT DEFAULT '',
  est_cost TEXT DEFAULT '',
  revenue_impact TEXT DEFAULT '',
  stakeholders JSONB DEFAULT '[]',
  ask_text TEXT DEFAULT '',
  ask_recommendation TEXT DEFAULT '',
  next_actions JSONB DEFAULT '[]',
  blockers JSONB DEFAULT '[]',
  dependencies JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  scoring JSONB DEFAULT '{"revenueImpact":5,"strategicFit":5,"riskIfDelayed":5,"timeToValue":5,"effort":5}',
  decisions JSONB DEFAULT '[]',
  comments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_tabs (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  view TEXT DEFAULT 'kanban' CHECK (view IN ('kanban','table')),
  group_by TEXT DEFAULT 'priority',
  sort TEXT DEFAULT 'score',
  hide_empty_columns BOOLEAN DEFAULT false,
  card_fields JSONB DEFAULT '["stage","rag","priority","decision","owner","score"]',
  manual JSONB DEFAULT '{}',
  filters JSONB DEFAULT '{"categories":[],"owners":[],"priorities":[],"rags":[],"stages":[],"focusOnly":false,"decisionOnly":false,"stalledOnly":false,"search":""}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (open read/write for internal tool — tighten if needed)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_tabs ENABLE ROW LEVEL SECURITY;

-- Allow all operations (suitable for an internal shared tool)
CREATE POLICY "Allow all on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on custom_tabs" ON custom_tabs FOR ALL USING (true) WITH CHECK (true);

-- Enable real-time for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE custom_tabs;

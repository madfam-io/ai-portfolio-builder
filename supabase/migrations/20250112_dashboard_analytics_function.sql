-- Dashboard Analytics Function
-- Optimized function to fetch all dashboard data in a single query

CREATE OR REPLACE FUNCTION get_dashboard_analytics(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH 
  -- Get repositories
  user_repositories AS (
    SELECT 
      r.*,
      COALESCE(cm.loc_total, 0) as lines_of_code,
      COALESCE(pr_counts.open_prs, 0) as open_pull_requests,
      COALESCE(pr_counts.closed_prs, 0) as closed_pull_requests
    FROM repositories r
    LEFT JOIN LATERAL (
      SELECT loc_total 
      FROM code_metrics 
      WHERE repository_id = r.id 
      ORDER BY metric_date DESC 
      LIMIT 1
    ) cm ON true
    LEFT JOIN LATERAL (
      SELECT 
        COUNT(*) FILTER (WHERE state = 'open') as open_prs,
        COUNT(*) FILTER (WHERE state = 'closed') as closed_prs
      FROM pull_requests 
      WHERE repository_id = r.id
    ) pr_counts ON true
    WHERE r.user_id = p_user_id AND r.is_active = true
  ),
  
  -- Get metrics summary
  metrics_summary AS (
    SELECT 
      SUM(loc_total) as total_lines_of_code,
      SUM(commit_count) as total_commits,
      COUNT(DISTINCT repository_id) as active_repositories,
      AVG(commit_frequency) as avg_commit_frequency
    FROM code_metrics
    WHERE repository_id IN (SELECT id FROM user_repositories)
      AND metric_date >= CURRENT_DATE - INTERVAL '30 days'
  ),
  
  -- Get recent activity
  recent_activity AS (
    SELECT 
      DATE(ca.commit_date) as activity_date,
      COUNT(*) as commit_count,
      COUNT(DISTINCT ca.author_id) as unique_contributors
    FROM commit_analytics ca
    JOIN user_repositories ur ON ca.repository_id = ur.id
    WHERE ca.commit_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(ca.commit_date)
    ORDER BY activity_date DESC
  ),
  
  -- Get top contributors
  top_contributors AS (
    SELECT 
      c.*,
      SUM(rc.commit_count) as total_commits
    FROM contributors c
    JOIN repository_contributors rc ON c.id = rc.contributor_id
    JOIN user_repositories ur ON rc.repository_id = ur.id
    GROUP BY c.id
    ORDER BY total_commits DESC
    LIMIT 10
  ),
  
  -- Get language distribution
  language_stats AS (
    SELECT 
      language,
      SUM(lines_of_code) as total_lines
    FROM (
      SELECT 
        jsonb_each_text(languages) as lang_data,
        repository_id
      FROM code_metrics
      WHERE repository_id IN (SELECT id FROM user_repositories)
        AND metric_date = CURRENT_DATE
    ) lang_breakdown,
    LATERAL (
      SELECT 
        (lang_data).key as language,
        ((lang_data).value)::INTEGER as lines_of_code
    ) parsed
    GROUP BY language
    ORDER BY total_lines DESC
  )
  
  -- Combine all results
  SELECT json_build_object(
    'repositories', COALESCE((SELECT json_agg(row_to_json(r)) FROM user_repositories r), '[]'::json),
    'metrics', COALESCE((SELECT row_to_json(m) FROM metrics_summary m), '{}'::json),
    'recentActivity', COALESCE((SELECT json_agg(row_to_json(a)) FROM recent_activity a), '[]'::json),
    'topContributors', COALESCE((SELECT json_agg(row_to_json(c)) FROM top_contributors c), '[]'::json),
    'languages', COALESCE((SELECT json_agg(row_to_json(l)) FROM language_stats l), '[]'::json),
    'lastUpdated', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_repositories_user_active 
  ON repositories(user_id, is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_code_metrics_repo_date 
  ON code_metrics(repository_id, metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_pull_requests_repo_state 
  ON pull_requests(repository_id, state);

CREATE INDEX IF NOT EXISTS idx_commit_analytics_repo_date 
  ON commit_analytics(repository_id, commit_date DESC);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_dashboard_analytics(UUID) TO authenticated;
-- Monthly active users by plan, over the last six months.
WITH active AS (
  SELECT
    u.id,
    u.plan,
    date_trunc('month', e.created_at) AS month
  FROM users AS u
  INNER JOIN events e ON e.user_id = u.id
  WHERE e.created_at >= now() - INTERVAL '6 months'
    AND e.type IN ('page_view', 'deploy')
    AND u.deleted_at IS NULL
  GROUP BY 1, 2, 3
)
SELECT plan, month, COUNT(*) AS mau
FROM active
GROUP BY plan, month
HAVING COUNT(*) > 10
ORDER BY month DESC, mau DESC
LIMIT 50;

CREATE INDEX CONCURRENTLY IF NOT EXISTS events_user_created_idx
  ON events (user_id, created_at DESC);

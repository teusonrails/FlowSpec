-- Full-text search GIN index for automations
-- This enables fast text search across automation name, description, and FlowSpec content
CREATE INDEX idx_automations_search ON automations
  USING GIN (to_tsvector('english', name || ' ' || description || ' ' || COALESCE(long_description, '') || ' ' || COALESCE(flowspec_content, '')));

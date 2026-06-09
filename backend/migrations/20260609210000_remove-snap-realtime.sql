-- Chunk 07 review (P1): the snap realtime channel could not be RLS-gated for per-user subscription
-- — realtime.channels is owned by `postgres`, so project_admin can't ENABLE RLS or add a subscribe
-- policy on it. The per-user channel was therefore a cross-tenant subscription surface.
--
-- The extract-snap-report edge function is synchronous (the client awaits its result and refetches),
-- so realtime was redundant. Remove the publish trigger + function + channel entirely; dropping the
-- trigger stops all publishing, closing the gap.
DROP TRIGGER IF EXISTS snap_reports_realtime_trg ON snap_reports;
DROP FUNCTION IF EXISTS snap_reports_realtime();
DELETE FROM realtime.channels WHERE pattern = 'snap:%';

# Performance Optimizations

## Throttling

Event and statistics updates are throttled to avoid excessive broadcasts:

```sql
-- From migration: 2026_01_27_1153-589ef1bd6ca9_fix_ambiguous_match_id_in_trigger.py
CREATE OR REPLACE FUNCTION notify_football_event_change() RETURNS trigger AS $$
DECLARE
    last_notify TIMESTAMP;
    throttle_seconds INTEGER := 2;
    match_id INTEGER;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        match_id := OLD.match_id;
        PERFORM pg_notify('football_event_change', ...);
        RETURN OLD;
    ELSE
        match_id := NEW.match_id;
        SELECT last_notified_at INTO last_notify
        FROM match_stats_throttle
        WHERE match_stats_throttle.match_id = NEW.match_id;

        IF last_notify IS NULL OR
           EXTRACT(EPOCH FROM (NOW() - last_notify)) > throttle_seconds THEN
            INSERT INTO match_stats_throttle (match_id, last_notified_at)
            VALUES (NEW.match_id, NOW())
            ON CONFLICT (match_id) DO UPDATE
            SET last_notified_at = NOW();

            PERFORM pg_notify('football_event_change', ...);
        END IF;

        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

## Caching

Backend cache invalidation:

```python
async def match_data_listener(self, connection, pid, channel, payload):
    if self._cache_service:
        self._cache_service.invalidate_match_data(match_id)
```

Player match updates also invalidate match cache to avoid stale players payloads:

```python
if self._cache_service:
    self._cache_service.invalidate_players(match_id)
    self._cache_service.invalidate_match_data(match_id)
```

Cache services:

- `match_data` - matchdata table
- `gameclock` - gameclock table
- `playclock` - playclock table
- `event_data` - football_event table
- `stats` - aggregated statistics

## Batch Fetching

Initial load fetches all data in parallel:

```python
(
    initial_data,
    initial_playclock_data,
    initial_gameclock_data,
    initial_event_data,
    initial_stats_data,
) = await asyncio.gather(
    fetch_with_scoreboard_data(match_id),
    fetch_playclock(match_id),
    fetch_gameclock(match_id),
    fetch_event(match_id),
    fetch_stats(match_id),
)
```

## Related Documentation

- [Initial Load](./initial-load.md)
- [Update Flow](./update-flow.md)

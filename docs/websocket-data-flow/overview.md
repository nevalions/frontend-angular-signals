# WebSocket Data Flow Overview

This documentation describes how data flows from backend to frontend clients via WebSocket connections for real-time match updates.

## Key Principles

- Full objects: WebSocket messages send complete objects, not partial updates
- Real-time: Updates are pushed immediately via database triggers
- Broadcast: All clients receive the same updates
- Optimized: Partial updates from frontend -> full updates to clients via WebSocket

## Key Takeaways

1. Full objects only: messages send complete objects, not partial changes
2. Database-driven: updates triggered by PostgreSQL triggers, not manual notifications
3. Broadcast pattern: all connected clients receive the same updates simultaneously
4. Partial merging: frontend merges full objects into existing signals
5. Optimized: throttling, caching, and parallel fetching ensure performance
6. Real-time: updates are pushed immediately after database changes
7. Consistent state: all clients maintain identical state via full object replacements

## Contents

- [Connection Flow](./connection-flow.md)
- [Message Types](./message-types.md)
- [Initial Load](./initial-load.md)
- [Update Flow](./update-flow.md)
- [Message Schemas](./message-schemas.md)
- [Frontend Handling](./frontend-handling.md)
- [Error Handling](./error-handling.md)
- [Performance Optimizations](./performance-optimizations.md)

## Related Documentation

- [Backend API Documentation](http://localhost:9000/docs) - Interactive API docs
- [Angular Signals Best Practices](../angular-signals-best-practices.md)
- [Component Patterns](../component-patterns.md)
- [Backend WebSocket Handler](../../statsboards-backend/src/websocket/match_handler.py)
- [Backend WebSocket Manager](../../statsboards-backend/src/utils/websocket/websocket_manager.py)

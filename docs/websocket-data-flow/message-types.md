# Message Types

## Available Message Types

| Message Type | Purpose | Trigger | Content |
|-------------|---------|----------|----------|
| `initial-load` | Initial data on connection | Client connects | Full comprehensive match data |
| `match-update` | Match data changes | Database trigger on match/matchdata/scoreboard tables | Full match, matchdata, scoreboard, teams |
| `gameclock-update` | Game clock changes | Database trigger on gameclock table | Full GameClock object |
| `playclock-update` | Play clock changes | Database trigger on playclock table | Full PlayClock object |
| `event-update` | Football events changes | Database trigger on football_event table | Events array |
| `statistics-update` | Match stats changes | Database trigger (throttled) | Full MatchStats object |
| `ping` | Connection health check | Backend heartbeat | Timestamp |

## Ping/Pong

Ping message:

```json
{
  "type": "ping",
  "timestamp": 1706433600000
}
```

Client response:

```json
{
  "type": "pong",
  "timestamp": 1706433600000
}
```

## Related Documentation

- [Message Schemas](./message-schemas.md)
- [Update Flow](./update-flow.md)

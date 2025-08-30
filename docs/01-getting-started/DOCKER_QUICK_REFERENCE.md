# 🐳 Docker Quick Reference Card

## 🚀 Most Common Commands

### Start Everything

```bash
./scripts/docker-dev.sh
```

### Stop Everything

```bash
docker-compose -f docker-compose.dev.yml down
```

### View Logs

```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Restart App Only

```bash
docker-compose -f docker-compose.dev.yml restart app
```

---

## 🌐 Access URLs

| Service      | URL                   | Credentials             |
| ------------ | --------------------- | ----------------------- |
| **App**      | http://localhost:3000 | -                       |
| **pgAdmin**  | http://localhost:5050 | admin@madfam.io / admin |
| **Database** | localhost:5432        | postgres / postgres     |
| **Redis**    | localhost:6379        | -                       |

---

## 🔧 Troubleshooting

### Check Status

```bash
docker ps
```

### View Specific Service Logs

```bash
docker logs ai-portfolio-builder-app-1 -f
```

### Access App Shell

```bash
docker exec -it ai-portfolio-builder-app-1 sh
```

### Complete Reset

```bash
docker-compose -f docker-compose.dev.yml down -v
./scripts/docker-dev.sh
```

---

## 💡 Pro Tips

1. **First Time Setup**: The initial build takes 3-5 minutes
2. **Hot Reload**: Code changes auto-refresh (no restart needed)
3. **Database GUI**: Use pgAdmin at http://localhost:5050
4. **Check Logs**: If something fails, always check logs first

---

See [SPIN_UP_PROTOCOLS.md](./docs/SPIN_UP_PROTOCOLS.md) for detailed instructions.

---
title: "Docker Basics"
category: devops
tags: [docker, containers, devops]
sources: [raw/inbox/docker-basics.md]
confidence: 0.9
last_updated: 2026-04-19
stale: false
related: [[Wiki Overview]]
---

# Docker Basics

Fundamental concepts of containerization using Docker.

## Images vs Containers
- **Image**: An immutable template with instructions for creating a Docker container. Often based on another image, with some additional customization.
- **Container**: A runnable instance of an image. You can create, start, stop, move, or delete a container using the Docker API or CLI.

## Key Commands

```bash
# Run an nginx container in detached mode, mapping port 80
docker run -d -p 80:80 nginx

# List running containers
docker ps

# List all local images
docker images

# Stop a container
docker stop <id>
```

## Source References
- `raw/inbox/docker-basics.md`

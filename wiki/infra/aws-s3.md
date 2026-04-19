---
title: "AWS S3"
category: infra
tags: [aws, s3, storage, cloud]
sources: [raw/inbox/aws-s3-cheatsheet.md]
confidence: 0.9
last_updated: 2026-04-19
stale: false
related: [[Wiki Overview]]
---

# AWS S3

Amazon Simple Storage Service (S3) is an object storage service that offers industry-leading scalability, data availability, security, and performance.

## Key Concepts

### Buckets and Objects
- **Buckets**: Containers for storing objects. Bucket names are globally unique.
- **Objects**: The fundamental entities stored in S3. Consist of object data and metadata.
- **Keys**: Unique identifier for an object within a bucket.
- **Flat Hierarchy**: S3 is a flat storage system, but uses delimiters (like `/`) to simulate folders.

### Storage Classes
| Class | Use Case |
|-------|----------|
| **Standard** | General purpose, frequent access |
| **Intelligent-Tiering** | Unknown or changing access patterns |
| **Standard-IA** | Infrequent access but needs millisecond access |
| **One Zone-IA** | Lower-cost for non-critical INFREQUENT data |
| **Glacier** | Archive data (retrieval in minutes/hours) |
| **Glacier Deep Archive** | Long-term digital preservation (retrieval in 12 hours) |

## Source References
- `raw/inbox/aws-s3-cheatsheet.md`

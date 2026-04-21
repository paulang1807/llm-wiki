---
title: "Git Commit Reversion & History Manipulation"
category: os
tags: [git, version-control, history-management]
sources: [raw/inbox/git-commit-revert.rtf]
confidence: 0.9
last_updated: 2021-10-30
stale: false
related: []
---

# Git Commit Reversion & History Manipulation

## Overview
Procedures for undoing the most recent commit and synchronizing the forced history change with a remote origin. This is useful for removing sensitive data or correcting high-level structural errors in the commit sequence.

## Key Concepts

- **Soft Reset (`HEAD~1`)**: Pulls the changes from the last commit back into the local working directory (staged or unstaged) while keeping the files.
- **Hard Reset (`HEAD^ --hard`)**: Discards all local changes and the last commit, forcing the branch back to the preceding state.
- **Stash Strategy**: Stashing changes allows for a temporary backup of state before performing history-altering operations.

## Code Patterns

### Reverting the Last Commit (Non-destructive)
1. Pull changes to local machine:
   ```bash
   git reset HEAD~1
   ```
2. Stash for later reference:
   ```bash
   git stash
   ```

### Forced History Reset (Destructive)
To completely remove the last commit and update the remote history:

1. Perform a hard reset to the previous commit:
   ```bash
   git reset HEAD^ --hard
   ```
2. Force push changes to origin:
   ```bash
   git push origin -f
   ```

## Relationships
- [[Shell Scripting Basics]] (related CLI techniques)

## Source References
- [git-commit-revert.rtf](file:///Users/pauls/Documents/_000.Code/Pauls/git/llm-wiki/raw/inbox/git-commit-revert.rtf)

---
title: "ML Reinforcement Learning"
category: ml
tags: [reinforcement-learning, q-learning, policy-gradient, gym, reward, agent]
sources: [raw/ml/ml-rein.md, raw/ml/stats-rein.md]
confidence: 0.85
last_updated: 2026-04-19
stale: false
related: [[ML Deep Learning]], [[ML Workflow]], [[AI Agents]]
---

# ML Reinforcement Learning

Learning through interaction with an environment — an agent takes actions to maximise cumulative reward. Foundation of game-playing AI (AlphaGo, Atari) and robotics.

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Agent** | The learner/decision-maker |
| **Environment** | The world the agent interacts with |
| **State (S)** | Current situation/observation |
| **Action (A)** | What the agent can do |
| **Reward (R)** | Feedback signal (+/-) for an action |
| **Policy (π)** | Agent's strategy: state → action |
| **Value Function** | Expected cumulative reward from a state |
| **Q-Value** | Expected reward for action A in state S |

## Q-Learning

Model-free algorithm that learns the optimal action-value function (Q-table):

```python
import gym

env = gym.make('FrozenLake-v1')
Q = np.zeros([env.observation_space.n, env.action_space.n])

# Q-learning update
learning_rate = 0.8
discount = 0.95

for episode in range(2000):
    state = env.reset()
    done = False
    while not done:
        action = np.argmax(Q[state, :] + np.random.randn(1, env.action_space.n) * (1.0 / (episode + 1)))
        next_state, reward, done, _ = env.step(action)
        Q[state, action] += learning_rate * (reward + discount * np.max(Q[next_state, :]) - Q[state, action])
        state = next_state
```

## Deep Q-Network (DQN)

Replaces Q-table with a neural network for large/continuous state spaces:
- Neural network approximates Q(s, a)
- Experience replay: store and sample past transitions
- Target network: separate stable network for target computation

## Algorithm Families

| Type | Examples | Notes |
|------|---------|-------|
| **Value-based** | Q-learning, DQN | Learns value function; derives policy |
| **Policy-based** | REINFORCE, PPO | Directly optimises policy |
| **Actor-Critic** | A3C, SAC | Combines both approaches |

## Relationships
- [[ML Deep Learning]] — deep RL uses neural networks; DQN uses CNNs for image inputs
- [[AI Agents]] — AI agents in GenAI share the concept of "acting in a loop to reach a goal"
- [[LLM Concepts]] — RLHF (Reinforcement Learning from Human Feedback) fine-tunes LLMs

## Source References
- `raw/ml/ml-rein.md` — RL implementations and examples
- `raw/ml/stats-rein.md` — statistical concepts behind RL

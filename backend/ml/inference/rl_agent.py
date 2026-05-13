import numpy as np
import random

class DeepQChronotherapyAgent:
    def __init__(self, alpha=0.1, gamma=0.95, epsilon=0.1):
        """
        Real Q-Learning Agent for Chronotherapy Scheduling.
        """
        self.alpha = alpha      # Learning rate
        self.gamma = gamma      # Discount factor
        self.epsilon = epsilon  # Exploration rate
        
        # State Space: (Stress Level, Sleep Quality, CII Level)
        # Simplified to Discrete states for Q-Table implementation
        self.states = [
            "High Stress, Delayed Sleep", 
            "Low Stress, Delayed Sleep", 
            "High Stress, Normal Sleep", 
            "Low Stress, Normal Sleep"
        ]
        
        self.actions = [
            "CBT-I + Light Therapy", 
            "Melatonin Only", 
            "Mindfulness + Sleep Restriction", 
            "No Intervention"
        ]
        
        # Initialize Q-Table: Shape (num_states, num_actions)
        # Using a slight pre-trained bias for realism
        self.q_table = np.array([
            [15.5, 5.0, 12.0, -10.0],  # High Stress, Delayed -> CBT-I / Mindfulness good
            [8.0, 18.0, 4.0, 0.0],     # Low Stress, Delayed -> Melatonin good
            [10.0, 2.0, 16.0, 5.0],    # High Stress, Normal -> Mindfulness good
            [0.0, 0.0, 0.0, 20.0]      # Low Stress, Normal -> No Intervention good
        ])
        
        self.episode_history = []
        self.cumulative_reward = 0

    def get_state_index(self, state_str: str) -> int:
        try:
            return self.states.index(state_str)
        except ValueError:
            return 0

    def choose_action(self, state_idx: int) -> int:
        """Epsilon-greedy action selection."""
        if random.uniform(0, 1) < self.epsilon:
            return random.randint(0, len(self.actions) - 1) # Explore
        else:
            return np.argmax(self.q_table[state_idx]) # Exploit

    def compute_reward(self, prev_cii: float, new_cii: float, user_compliance: float) -> float:
        """
        Reward Function:
        Positive if CII decreases (health improves).
        Weighted by user compliance.
        """
        cii_delta = prev_cii - new_cii # Positive delta means CII went down (good)
        base_reward = cii_delta * 2.0
        
        # Penalty for low compliance
        if user_compliance < 0.5:
            base_reward -= 10.0
            
        return base_reward

    def update_q_value(self, state_idx: int, action_idx: int, reward: float, next_state_idx: int):
        """Bellman Equation Update."""
        best_next_action = np.argmax(self.q_table[next_state_idx])
        td_target = reward + self.gamma * self.q_table[next_state_idx][best_next_action]
        td_error = td_target - self.q_table[state_idx][action_idx]
        
        # Update
        self.q_table[state_idx][action_idx] += self.alpha * td_error
        
        # Track history
        self.cumulative_reward += reward
        self.episode_history.append(self.cumulative_reward)

    def get_q_table_snapshot(self) -> list:
        snapshot = []
        for i, state in enumerate(self.states):
            best_action_idx = np.argmax(self.q_table[i])
            max_q = self.q_table[i][best_action_idx]
            
            # Softmax confidence
            exp_q = np.exp(self.q_table[i] - np.max(self.q_table[i]))
            probs = exp_q / exp_q.sum()
            confidence = probs[best_action_idx] * 100
            
            snapshot.append({
                "state": state,
                "optimal_action": self.actions[best_action_idx],
                "q_value": round(float(max_q), 2),
                "confidence": round(float(confidence), 1)
            })
        return snapshot

rl_agent_instance = DeepQChronotherapyAgent()

# ChronoHealth AI - Viva & Interview Preparation Guide

## 1. General Questions
**Q: What is the main objective of this project?**
- **A**: To build an AI-driven clinical dashboard that analyzes and optimizes human circadian health using Machine Learning and Reinforcement Learning.

**Q: What is the most unique feature of your project?**
- **A**: The Reinforcement Learning (RL) simulation that learns and recommends personalized intervention schedules, and the SHAP explainability that makes the AI's "Black Box" predictions transparent to clinicians.

## 2. Technical Questions
**Q: Why did you choose FastAPI over Flask or Django?**
- **A**: FastAPI is significantly faster due to its asynchronous (ASGI) nature, and it provides automatic Swagger documentation and built-in Pydantic validation, which is crucial for medical data types.

**Q: How do you handle frontend-backend synchronization?**
- **A**: We use a dynamic polling strategy and Axios interceptors. When a dataset is uploaded, the backend updates the PostgreSQL records, and the frontend automatically refreshes its analytical state to reflect the new data.

## 3. AI/ML Questions
**Q: Explain the Q-Learning logic in your RL module.**
- **A**: It uses a Q-table to store expected rewards for state-action pairs. The agent explores different interventions (like Light Therapy) and receives a reward based on the patient's biomarker improvement. Over time, it learns the "Optimal Policy" to minimize stress and maximize sleep.

**Q: What is SHAP and why is it used?**
- **A**: SHAP (SHapley Additive exPlanations) is a game-theory approach to explain ML models. We use it to ensure "Clinical Interpretability"—so a doctor can trust the AI by seeing which features (like HRV or Light Exposure) contributed most to a specific health risk prediction.

## 4. Deployment Questions
**Q: How is the database hosted?**
- **A**: We use Neon, which is a serverless PostgreSQL database. It scales automatically and integrates perfectly with our Render-hosted backend.

**Q: What is the role of Docker in your project?**
- **A**: Docker ensures that the backend environment (Python version, libraries, C++ compilers for XGBoost) remains consistent between development and production (Render).

---
*Preparation Guide Complete. Good luck!*

# Pyro.AI
<div align="center">
  <img width="947" alt="pyroai" src="https://github.com/user-attachments/assets/9fed5ec9-b0fe-474b-aa34-d12faa8a03ed" />
</div>

## Tech Stack
<div align="center">
  <img alt="NextJS" src="https://img.shields.io/badge/NextJS-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img alt="Flask" src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=Flask&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Python" src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=Python&logoColor=white" />
  <img alt="YOLOv8" src="https://img.shields.io/badge/YOLOv8-FF0000?style=for-the-badge" />
  <img alt="Tensorflow" src="https://img.shields.io/badge/Tensorflow-FF6F00?style=for-the-badge&logo=TensorFlow&logoColor=white" />
  <img alt="TailwindCSS" src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img alt="ShadCN" src="https://img.shields.io/badge/ShadCN-000000?style=for-the-badge" />
  <img alt="OpenRouteService" src="https://img.shields.io/badge/OpenRouteService-FF6600?style=for-the-badge&logo=OpenStreetMap&logoColor=white" />
  <img alt="GeminiAI" src="https://img.shields.io/badge/GeminiAI-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-000?style=for-the-badge&logo=vercel&logoColor=white" />
</div>

## Video Demo
[Watch the demo on YouTube](https://www.youtube.com/watch?v=fTVpI_663GE)

## Inspiration
Not so long ago in January 2025, the Palisades and Eaton fires took over Los Angeles and global headlines, consuming over 37,000 acres, destroying more than 16,000 structures, and tragically claiming at least 29 lives. As this event unraveled, we recognized the need for smarter, more sustainable wildfire management systems that prioritize safety and empower communities to act swiftly.

That's why we built Pyro.AI—a centralized wildfire monitoring dashboard designed to protect lives, safeguard ecosystems, and foster resilience against climate-related disasters. Our dashboard extends beyond existing platforms like Watch Duty by offering tools tailored to real-time wildfire detection, risk assessment, and evacuation planning.
## What It Does
**Automated Evacuation Planning**  
- Computes the safest and most efficient evacuation routes using real-time data and OpenRouteService, ensuring timely evacuations.

**Real-time Fire Detection**  
- Processes live camera feeds with a YOLOv8 model (trained on the D-fire dataset) to quickly detect wildfires with high accuracy. Users can toggle detection on or off as needed.

**Intelligent Safety Chat**  
- Acts as a personal wildfire guide powered by Google Gemini, delivering real-time safety insights by analyzing live environmental data (air quality, temperature, wind speed, and humidity).

## How We Built It
We began by asking: *How might we provide real-time wildfire detection, risk assessment, and automated evacuation planning to ensure users are informed, educated, and empowered to act swiftly during wildfire emergencies?*

Our approach combined:
- **Rapid Prototyping:** Leveraging tools like Lovable.dev for quick iteration and live rendering.
- **Core Hypotheses:** Focusing on real-time detection, optimized evacuation routing, and actionable safety insights.
- **Competitive Analysis:** Studying existing platforms like Watch Duty to identify opportunities for innovation and improvement.

## Information Architecture
<div align="center">
  <img width="1380" alt="pyroaiarchitecture" src="https://github.com/user-attachments/assets/898b9870-8ce7-4bae-a067-0e10746ddae7" />
</div>

## Challenges We Ran Into
- **Accurate Risk Assessment:** Developing a wildfire risk scoring system that dynamically integrates diverse environmental data.
- **Deployment Issues:** Overcoming compatibility issues, particularly with TensorFlow dependencies, to ensure smooth deployment.

## Accomplishments That We're Proud Of
- Created a comprehensive wildfire monitoring system that helps protect communities and ecosystems within 30 hours at TreeHacks.
- Implemented real-time fire detection and risk assessment capabilities.
- Developed automated evacuation planning tools that can help save lives during emergencies.

## What We Learned
- Our development journey gave valuable insights into firsthand experience in the importance of usability testing and continuous user feedback for improving our platform
- We also discovered the effectiveness of rapid prototyping tools like Lovable.dev in accelerating development and validation of ideas

## What's Next for Pyro.AI
- Implementing multi-point evacuation routing to handle large-scale evacuations more efficiently
- Enhancing the OpenRouteService integration to account for real-time traffic conditions
- Developing backup route suggestions for scenarios where primary routes become compromised

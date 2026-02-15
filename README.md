BeyondMiles
Basic Details
Team Name:HAK
Team Members:
- Member 1: Hellan Raichel Benoy – Carmel College of Engineering and Technology
- Member 2: Khulood Salam – Carmel College of Engineering and Technology

Hosted Project Link:
https://tinkerhack-project-v87p.vercel.app 
Project Description
A personalized dashboard app to connect users in private "spaces" based on relationships like Couple, Friends, Family, or Custom. Users can share memories, track timelines, and chat.

The Problem Statement
Long-distance relationships and close friendships struggle to maintain daily connections and shared experiences digitally.

The Solution
Long-distance relationships and close friendships struggle to maintain daily connections and shared experiences digitally.
Technical Details`
- Create or join a private space with an invite code.
- Role-based spaces: Couple, Friend, Sibling, Family, or Custom.
- Share memories (images) with members.
- Track timelines and milestones.
- Real-time connection with members.
- Edit personal nicknames.
- Leave a space anytime.
- Themed UI with customizable colors and gradients.

Technologies/Components Used
Software:
•	Languages: JavaScript, HTML, CSS
•	Frameworks: Next.js
•	Libraries: Firebase (Auth, Firestore, Storage), TailwindCSS
•	Tools: VS Code, Git, Vercel
Hardware: Not applicable

## Features
List the key features of your project:  
•  Personal Space Dashboard: Interactive timeline, clocks, and memories.
•  Member Pulse: Upload and view daily photos/updates.
•  Real-time Chat: Leave notes for your partner/friends.
•  Invite System: Share your space via a unique code.
•  Nickname Customization: Set personalized nicknames for your partner/friends.
Implementation

For Software
Installation:
git clone https://github.com/HelaOdinson/tinkerhack_project.git 
cd tinkerhack_project
npm install
npm run dev

Run:
npm run dev
Project Documentation
For Software

<img width="975" height="458" alt="image" src="https://github.com/user-attachments/assets/5f671462-5fcc-443d-b321-2c1e66001b0e" />
Landing Page: Buttons leads to log in/sign up page

 <img width="975" height="459" alt="image" src="https://github.com/user-attachments/assets/facedb49-255d-48ea-87e3-c5ce61a4934b" />

Log in/Sign up page: Leads to roles selection page for first time users and my spaces page for existing user.
 
<img width="975" height="453" alt="image" src="https://github.com/user-attachments/assets/ff130a68-6802-4897-84d7-630c25948e9e" />
My spaces: lists all the groups the user is apart of.
 
<img width="975" height="647" alt="image" src="https://github.com/user-attachments/assets/1327625f-5a29-48af-af57-9b2149d593db" />
Roles page: Select a role and either create a new group or join an existing one.
 
<img width="713" height="612" alt="image" src="https://github.com/user-attachments/assets/871944a2-5331-40d2-aaff-847c4cd733af" />
Create: lets user name the group, add the cities they are from and a hangout date before generating a 6 digit alphanumerical code, which can be copied and shared.
 
<img width="575" height="540" alt="image" src="https://github.com/user-attachments/assets/38355b4e-44fc-4937-b9b9-145259e5c31a" />
Join page: select role and enter code to join the groups
 
<img width="975" height="465" alt="image" src="https://github.com/user-attachments/assets/1e72d52f-b677-40fb-9c9b-a9faf505aba2" />
Dashboard: Showcases calendar schedules, revolving gallery, today’s moments and a small chat system. The colour theme is customizable. Shows number of days since last met. Has a button that leads to the gallery grid.

Diagrams
System Architecture and Application Workflow:
<img width="845" height="845" alt="image" src="https://github.com/user-attachments/assets/f16a24bb-1945-4e2b-815b-8ef073c68a01" />
 

Project Demo- Video uploaded in drive

AI Tools Used (Optional)
Tool Used: Gemini, ChatGPT
Purpose: Code Generation
Key Prompts Used:
•	Create a Next.js logic for a 'Create' and 'Join' space system using Firebase Firestore. I need it to generate a unique 6-digit code and allow users to select roles like 'Couple', 'Friends', or 'Family'.
•	Add a 'Daily Pulse' section for uploading snapshots, a 'Countdown to Reunion' timer, and local/away time clocks that update in real-time.
•	I am getting a 'prerender-error' in Vercel because of useSearchParams. Standardize the dashboard code by wrapping it in a Suspense boundary and using force-dynamic to ensure it passes the production build.
•	Write Firestore Security Rules that restrict data access so only members of a specific Space ID can read or write messages in that collection.
Percentage of AI-generated code: [Approximately 75%]
Human Contributions:
•	Architecture design
•	Custom business logic implementation
•	UI/UX design decisions
________________________________________
Team Contributions
•	Khulood: Firebase Authentication, Log in Page, Documentation
•	Hellan: UI/UX, Github activation, Hosting
________________________________________
License
This project is unlicensed.




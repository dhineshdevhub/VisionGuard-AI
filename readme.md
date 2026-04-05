Ran command: `cls`

To launch the full system, you need to open **three separate terminal windows** (or tabs) and run one command in each.

Follow this order:

### 1️⃣ Start the Backend (API & Database)
*In your first terminal:*
```powershell
cd backend
npm run dev
```
> **What this does:** Connects to Supabase, starts the real-time Socket.io server, and prepares the API on `http://localhost:3000`.

---

### 2️⃣ Start the Frontend Dashboard (The UI)
*In your second terminal:*
```powershell
cd frontend
npm run dev
```
> **What this does:** Launches your React dashboard. 
> 🔗 Open **`http://localhost:5173`** in your browser to see the live map and stats.

---

### 3️⃣ Start the Edge AI (The Camera/Detector)
*In your third terminal:*
```powershell
cd edgeai
python main.py
```
> **What this does:** Loads the YOLOv11 model, opens your camera/video, and starts looking for accidents.
> 💡 **Note:** If you want to use your video file instead of your webcam, edit `edgeai/.env` and change `VIDEO_SOURCE=0` to `VIDEO_SOURCE=testing.mp4`.

---

### 🚨 How to Test:
1.  Open the **Frontend** in your browser (`http://localhost:5173`).
2.  Enable the **Siren** icon (top right) in the Dashboard.
3.  Run the **Edge AI** script.
4.  Once an accident is detected (and confirmed for 40 frames), you will immediately:
    -   See a **Red Alert** pop up on your dashboard.
    -   Hear the **Emergency Siren**.
    -   See the **evidence image** and **map marker** update in real-time.

**You are now fully operational!** 🔒🚀
# Student Performance Prediction System

A full-stack web application that predicts whether a student's performance will be **Low, Average or High**
from attendance, study hours, marks, assignment scores and activity participation. Faculty can manage student
records and see the results on a dashboard, so students who need support can be identified before the final exams.

| Part         | Technology                                              | Folder        | Port |
|--------------|---------------------------------------------------------|---------------|------|
| Frontend     | React 18, Vite, React Router, Recharts                  | `frontend/`   | 5173 |
| Backend API  | Spring Boot 3.2, Java 17, Spring Data JPA               | `backend/`    | 8080 |
| Database     | MySQL 8                                                 | `database/`   | 3306 |
| Machine learning | Python, Flask, Scikit-learn (Random Forest)         | `ml-service/` | 5001 |

```
React app  --->  Spring Boot API  --->  MySQL
                      |
                      +--->  Python ML service (Random Forest model)
```

## Features

- **Login** with a faculty account (password stored as a BCrypt hash, token-based sessions)
- **Students**: add, view (list, search and detail page), update and delete
- **Prediction**: the ML model classifies each student as Low, Average or High and estimates a score out of 100,
  with a confidence value. "Check prediction" on the form previews the result before saving.
- **Dashboard** with charts: performance level split, score spread, attendance vs score, study hours vs score,
  department averages, top performers and students who may need support
- If the ML service is not running, the backend falls back to a simple weighted formula so the app keeps working.
  Each student shows which one produced the result.

## 1. What to install

- Java 17 or newer and Maven 3.8+
- Node.js 18 or newer
- Python 3.9 or newer
- MySQL 8 (running on port 3306)

## 2. Set up and run

Open four terminals, one for each part. Start them in this order.

### Step 1: Database (MySQL)

Make sure MySQL is running. The backend creates the `student_performance` database and its tables automatically
the first time it starts, as long as your MySQL user is allowed to create databases (root is).

If you prefer to create it yourself, run:

```bash
mysql -u root -p < database/schema.sql
```

Tell the backend your MySQL login, either by editing `backend/src/main/resources/application.properties`
(`spring.datasource.username` and `spring.datasource.password`; the defaults are `root` / `root`) or with
environment variables:

```bash
# macOS / Linux
export DB_USERNAME=root
export DB_PASSWORD=your_password

# Windows (Command Prompt)
set DB_USERNAME=root
set DB_PASSWORD=your_password
```

### Step 2: Machine learning service

```bash
cd ml-service
python -m venv .venv

# macOS / Linux
source .venv/bin/activate
# Windows
.venv\Scripts\activate

pip install -r requirements.txt
python app.py
```

The first start trains the model (a few seconds) from `data/student_data.csv` and prints its accuracy.
The service then listens on http://localhost:5001. Check it at http://localhost:5001/health.

### Step 3: Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

On first start it creates the tables, the login `admin` / `admin123`, and 12 sample students (predicted by the
ML model if the ML service is already running).

### Step 4: Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** and log in with:

- Username: `admin`
- Password: `admin123`

## Trying it without MySQL

For a quick try-out you can run the backend on a built-in H2 file database instead:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

## How the machine learning works

1. **Data**: `ml-service/data/student_data.csv` has 3,000 records with attendance, study hours, previous marks,
   assignment score, internal marks, activities, the final score and the performance level.
2. **Preprocessing**: rows with missing values are dropped; the data is split 80% training, 20% testing.
3. **Training** (`train_model.py`): a Random Forest classifier predicts Low / Average / High and a Random Forest
   regressor predicts the score. Levels are Low below 50, Average from 50 to 74.9 and High from 75.
4. **Evaluation**: accuracy, a classification report and score error (MAE and R2) are printed after training and
   shown on the dashboard. On the supplied dataset the test accuracy is about 89%.
5. **Prediction**: the backend sends a student's figures to `POST /predict` and stores the result.

**Important:** the supplied dataset is simulated by `generate_dataset.py` (correlated values with random noise),
so the model learns the patterns built into that data, not the behaviour of real students. To use your own
institution's records, replace `data/student_data.csv` with a file that has the same columns, delete
`ml-service/model/student_models.joblib` if it exists, and run `python train_model.py`. Restart `python app.py`
afterwards, then click **Refresh predictions** on the Students page to update existing students.

The predictions support teachers; they should not be the only basis for any decision about a student.

## API (Spring Boot)

All endpoints except login need the header `Authorization: Bearer <token>`.

| Method | Path                       | Purpose                                          |
|--------|----------------------------|--------------------------------------------------|
| POST   | /api/auth/login            | Log in, returns a token                          |
| POST   | /api/auth/logout           | End the session                                  |
| GET    | /api/students              | List students                                    |
| GET    | /api/students/{id}         | View one student                                 |
| POST   | /api/students              | Add a student (prediction is calculated)         |
| PUT    | /api/students/{id}         | Update a student (prediction is recalculated)    |
| DELETE | /api/students/{id}         | Delete a student                                 |
| POST   | /api/students/recalculate  | Re-run predictions for every student             |
| POST   | /api/predict               | Preview a prediction without saving              |
| GET    | /api/ml/status             | Is the ML service up, and its accuracy           |
| GET    | /api/dashboard/summary     | Figures and chart data for the dashboard         |

ML service: `POST /predict`, `GET /metrics`, `GET /health` on port 5001.

## Troubleshooting

- **Backend fails with "Access denied for user"**: your MySQL username or password is wrong. Set `DB_USERNAME`
  and `DB_PASSWORD` (or edit `application.properties`).
- **Dashboard says "ML service not reachable"**: start `python app.py` in `ml-service/`, then click
  **Refresh predictions** on the Students page.
- **Port already in use**: change `server.port` in `application.properties` (and the proxy in
  `frontend/vite.config.js`), or set the `PORT` environment variable for the ML service
  (and `ML_SERVICE_URL` for the backend).
- **Login stops working after restarting the backend**: sessions are kept in memory, so log in again.

## Before real use

- Change the default `admin` password (see `DataSeeder.java`) and your MySQL password.
- Replace the simulated dataset with real, consented, anonymised student records.

## Project layout

```
Student_Performance_Prediction_System/
  README.md
  database/schema.sql          MySQL tables
  ml-service/                  Flask API, dataset, training script
    app.py  train_model.py  generate_dataset.py  requirements.txt  data/student_data.csv
  backend/                     Spring Boot API
    pom.xml
    src/main/java/com/spps/    controller, service, repository, model, dto, security, config
    src/main/resources/        application.properties (MySQL), application-h2.properties
  frontend/                    React app
    src/pages/                 Login, Dashboard, Students, StudentDetail, AddStudent, EditStudent
    src/components/            Layout, StudentForm, CategoryBadge
```

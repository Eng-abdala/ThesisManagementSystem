

CREATE DATABASE ThesisManagementSystem;
GO

USE ThesisManagementSystem;
GO


   -- TABLE 1: Departments

CREATE TABLE Departments (
    Department_ID   INT IDENTITY(1,1) PRIMARY KEY,
    Department_Name NVARCHAR(100) NOT NULL,
    Department_Head NVARCHAR(100) NULL
);



  -- TABLE 2: Students

CREATE TABLE Students (
    Student_ID      INT IDENTITY(1,1) PRIMARY KEY,
    Full_Name       NVARCHAR(100) NOT NULL,
    Email           NVARCHAR(100) NOT NULL UNIQUE,
    Phone           NVARCHAR(20)  NULL,
    Department_ID   INT NOT NULL,
        FOREIGN KEY (Department_ID) REFERENCES Departments(Department_ID)
);


  -- TABLE 3: Supervisors
CREATE TABLE Supervisors (
    Supervisor_ID   INT IDENTITY(1,1) PRIMARY KEY,
    Full_Name       NVARCHAR(100) NOT NULL,
    Email           NVARCHAR(100) NOT NULL UNIQUE,
    Specialization  NVARCHAR(150) NULL,
    Department_ID   INT NOT NULL,

        FOREIGN KEY (Department_ID) REFERENCES Departments(Department_ID)
);


   --TABLE 4: Theses
CREATE TABLE Theses (
    Thesis_ID        INT IDENTITY(1,1) PRIMARY KEY,
    Title            NVARCHAR(200) NOT NULL,
    Student_ID       INT NOT NULL,
    Supervisor_ID    INT NOT NULL,
    Status           NVARCHAR(30) NOT NULL DEFAULT 'In Progress', -- In Progress / Submitted / Approved / Rejected
    Submission_Date  DATE NULL,

        FOREIGN KEY (Student_ID) REFERENCES Students(Student_ID),
        FOREIGN KEY (Supervisor_ID) REFERENCES Supervisors(Supervisor_ID),
        UNIQUE (Student_ID) -- one student has one thesis
);


   -- TABLE 5: Evaluations
CREATE TABLE Evaluations (
    Evaluation_ID    INT IDENTITY(1,1) PRIMARY KEY,
    Thesis_ID        INT NOT NULL,
    Examiner_Name    NVARCHAR(100) NOT NULL,
    Score            DECIMAL(5,2) NOT NULL CHECK (Score >= 0 AND Score <= 100),
    Comments         NVARCHAR(500) NULL,
    Evaluation_Date  DATE NOT NULL DEFAULT GETDATE(),

        FOREIGN KEY (Thesis_ID) REFERENCES Theses(Thesis_ID)
);



   --SAMPLE DATA


-- Departments
INSERT INTO Departments (Department_Name, Department_Head) VALUES
('Computer Application', 'Eng.Mohamed Abduulahi'),
('Information Technology', 'Eng. Abdullahi Salad'),
('Software Engineering', 'Eng.Yahye Ali');


-- Students
INSERT INTO Students (Full_Name, Email, Phone,  Department_ID) VALUES
('Mohamed Abdi', 'mohamedabdi@gmai.com', '0611234567', 1),
('Sitra Salad', 'sitrasalad@gmail.com', '0612345678', 1),
('Aisha Salad', 'aishasalad@gmail.com', '0613482562', 2);





-- Supervisors
INSERT INTO Supervisors (Full_Name, Email, Specialization, Department_ID) VALUES
('Eng.Mohamed Ali', 'mohamedali@gmail.com', 'Softuare Engineer', 3),
('Eng.Yahye Ali', 'yahyeali@gmail.com', 'Database Administrator', 2),
('Eng Nasri', 'nasri@gmail.com', 'Software Architecture', 1);


-- Theses
INSERT INTO Theses (Title, Student_ID, Supervisor_ID, Status, Submission_Date) VALUES
('AI-Based Recommendation System', 1, 1, 'Submitted', '2026-05-10'),
('Cloud-Based Database Optimization', 2, 2, 'In Progress', NULL),
('Machine Learning for Healthcare', 3, 1, 'Approved', '2026-04-20');




-- Evaluations
INSERT INTO Evaluations (Thesis_ID, Examiner_Name, Score, Comments, Evaluation_Date) VALUES
(4, 'Dr. Nadia Omar', 85.50, 'Strong methodology, minor revisions needed.', '2026-05-20'),
(5, 'Dr. Samir Adan', 92.00, 'Excellent research, approved without changes.', '2026-04-25'),
(6, 'Dr. Nadia Omar', 78.00, 'Good work, needs clearer security testing section.', '2026-05-22');
GO


SELECT * FROM Departments;
SELECT * FROM Students;
SELECT * FROM Supervisors;
SELECT * FROM Theses;
SELECT * FROM Evaluations;

-- Example join: full thesis overview
SELECT 
    t.Thesis_ID,
    t.Title,
    s.Full_Name AS Student_Name,
    sup.Full_Name AS Supervisor_Name,
    d.Department_Name,
    t.Status,
    t.Submission_Date
FROM Theses t
JOIN Students s ON t.Student_ID = s.Student_ID
JOIN Supervisors sup ON t.Supervisor_ID = sup.Supervisor_ID
JOIN Departments d ON s.Department_ID = d.Department_ID;
GO

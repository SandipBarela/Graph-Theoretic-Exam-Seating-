"""
=============================================================================
Student Details:
Name: Pranjali Nitin Bharsakale | PRN: 1251070295 | Roll No: 2
Course: Discrete Mathematics
Project Title: Graph-Theoretic Exam Seating Arrangement: Minimising Adjacent Conflicts Using Graph Colouring
=============================================================================

File: data.py
Description: Defines classroom dimensions and sample student dataset.
Discrete Math Context:
- The classroom is modeled as a set of seat coordinates (vertices in a grid graph).
- The student population is partitioned into equivalence classes based on their
  enrolled course: S = C_maths U C_physics U C_chem U C_cs.
=============================================================================
"""

# Default classroom grid dimensions: 5 rows by 6 columns = 30 total seats.
DEFAULT_ROWS = 5
DEFAULT_COLS = 6

# Four distinct academic courses
COURSES = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Computer Science"
]

# Short codes for grid display
COURSE_CODES = {
    "Mathematics": "MTH",
    "Physics": "PHY",
    "Chemistry": "CHM",
    "Computer Science": "CSC"
}

# Single-letter initials for compact grid representation
COURSE_INITIALS = {
    "Mathematics": "M",
    "Physics": "P",
    "Chemistry": "C",
    "Computer Science": "S"
}


def get_classroom_dimensions():
    """Returns the default row and column counts for the exam hall."""
    return DEFAULT_ROWS, DEFAULT_COLS


def get_sample_students():
    """
    Generates a list of 24 students across 4 courses with uneven group sizes:
    - Mathematics: 8 students
    - Physics: 6 students
    - Chemistry: 5 students
    - Computer Science: 5 students
    Total = 24 students in a 30-seat room (leaving 6 empty seats).
    
    Returns:
        list of dict: Each dict contains student 'id', 'name', 'roll_no', 'course'.
    """
    students = [
        # Mathematics (8 students)
        {"id": 1, "name": "Aarav Sharma", "roll_no": "MTH101", "course": "Mathematics"},
        {"id": 2, "name": "Ananya Patel", "roll_no": "MTH102", "course": "Mathematics"},
        {"id": 3, "name": "Aditya Verma", "roll_no": "MTH103", "course": "Mathematics"},
        {"id": 4, "name": "Diya Kulkarni", "roll_no": "MTH104", "course": "Mathematics"},
        {"id": 5, "name": "Ishan Joshi", "roll_no": "MTH105", "course": "Mathematics"},
        {"id": 6, "name": "Kavya Deshmukh", "roll_no": "MTH106", "course": "Mathematics"},
        {"id": 7, "name": "Manish Gupta", "roll_no": "MTH107", "course": "Mathematics"},
        {"id": 8, "name": "Neha Shinde", "roll_no": "MTH108", "course": "Mathematics"},

        # Physics (6 students)
        {"id": 9, "name": "Omkar Jadhav", "roll_no": "PHY201", "course": "Physics"},
        {"id": 10, "name": "Pooja Patil", "roll_no": "PHY202", "course": "Physics"},
        {"id": 11, "name": "Pranav Kale", "roll_no": "PHY203", "course": "Physics"},
        {"id": 12, "name": "Riya More", "roll_no": "PHY204", "course": "Physics"},
        {"id": 13, "name": "Rohan Pawar", "roll_no": "PHY205", "course": "Physics"},
        {"id": 14, "name": "Sakshi Bhosale", "roll_no": "PHY206", "course": "Physics"},

        # Chemistry (5 students)
        {"id": 15, "name": "Tanmay Sawant", "roll_no": "CHM301", "course": "Chemistry"},
        {"id": 16, "name": "Utkarsh Wagh", "roll_no": "CHM302", "course": "Chemistry"},
        {"id": 17, "name": "Vaishnavi Kadam", "roll_no": "CHM303", "course": "Chemistry"},
        {"id": 18, "name": "Yash Gaikwad", "roll_no": "CHM304", "course": "Chemistry"},
        {"id": 19, "name": "Zoya Khan", "roll_no": "CHM305", "course": "Chemistry"},

        # Computer Science (5 students)
        {"id": 20, "name": "Aryan Mehta", "roll_no": "CSC401", "course": "Computer Science"},
        {"id": 21, "name": "Bhavna Nair", "roll_no": "CSC402", "course": "Computer Science"},
        {"id": 22, "name": "Chetan Rao", "roll_no": "CSC403", "course": "Computer Science"},
        {"id": 23, "name": "Deepika Sen", "roll_no": "CSC404", "course": "Computer Science"},
        {"id": 24, "name": "Eashan Roy", "roll_no": "CSC405", "course": "Computer Science"},
    ]
    return students

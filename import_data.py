import pandas as pd
import re
import json

def parse_subject_data(row_data):
    """
    Parses the subject data from a row and calculates total marks.
    Returns a tuple of (subject_marks_json, total_marks).
    """
    subject_marks = {}
    total_marks = 0
    # Regex to find subject code, name, and score (e.g., 101,BANGLA-I,137(A-))
    # This pattern looks for:
    # (\d{3}) - 3 digits (subject code)
    # ,([^,]+) - comma, then anything until next comma (subject name)
    # ,(\d{2,3})\(.*?\) - comma, then 2-3 digits (score), then (grade)
    # The non-greedy .*? is important for subject names with commas

    # We need to iterate from index 12, taking 3 columns at a time.
    # The loop should continue as long as there are at least 3 columns left.
    for i in range(12, len(row_data), 3):
        if i + 2 < len(row_data):
            try:
                subject_code = str(row_data[i]).strip()
                subject_name = str(row_data[i+1]).strip()
                score_grade_str = str(row_data[i+2]).strip()

                # Extract score from "SCORE(GRADE)" format
                score_match = re.search(r'(\d{2,3})\(.*\)', score_grade_str)
                if score_match:
                    score = int(score_match.group(1))
                    # Extract grade from inside parentheses, handling cases where grade might be missing or different format
                    grade_match = re.search(r'\((.*?)\)', score_grade_str)
                    grade = grade_match.group(1) if grade_match else ''

                    total_marks += score
                    subject_marks[subject_code] = {
                        "name": subject_name,
                        "score": score,
                        "grade": grade
                    }
            except (ValueError, IndexError, TypeError) as e:
                # Handle cases where parsing fails for a subject, e.g., malformed data
                # print(f"Warning: Could not parse subject data at index {i} in row. Error: {e}")
                continue
        else:
            # Not enough columns for a full subject triplet, stop processing subjects
            break
    return json.dumps(subject_marks), total_marks

def process_csv_to_json(csv_file_path, exam_year, exam_type):
    """
    Reads the CSV, processes each row, and returns a list of dictionaries
    suitable for PostgreSQL insertion.
    """
    df = pd.read_csv(csv_file_path, header=None, dtype=str) # Read all as string to avoid type inference issues

    processed_data = []
    for index, row in df.iterrows():
        # Extract core student info
        # Ensure all fields are treated as strings and stripped
        roll_number = str(row[0]).strip() # Corrected: Roll Number is now the first column
        student_name = str(row[1]).strip()
        institution_name = str(row[9]).strip().replace('"', '')
        gpa = str(row[10]).replace('GPA=', '').strip()
        registration_id = str(row[7]).strip() # New: Added registration_id from original roll_number column

        # Parse subject data and calculate total marks
        subject_marks_json, total_marks = parse_subject_data(row.tolist())

        processed_data.append({
            "roll_number": roll_number,
            "student_name": student_name,
            "institution_name": institution_name,
            "gpa": gpa,
            "total_marks": total_marks,
            "board": str(row[2]).strip(),
            "father_name": str(row[3]).strip(),
            "science_group": str(row[4]).strip(),
            "mother_name": str(row[5]).strip(),
            "year": exam_year,
            "exam_type": exam_type,
            "session_year": str(row[6]).strip(),
            "registration_id": registration_id,
            "student_type": str(row[8]).strip(),
            "date_of_birth": str(row[11]).strip(),
            "subject_marks": subject_marks_json
        })
    return processed_data

if __name__ == "__main__":
    # --- CONFIGURATION ---
    # Set these variables for each import
    EXAM_YEAR = "2025"
    EXAM_TYPE = "SSC"
    # ---------------------

    csv_path = 'ssc_results.csv'
    conn = None
    cur = None
    try:
        data_to_import = process_csv_to_json(csv_path, EXAM_YEAR, EXAM_TYPE)
        print(f"Processed {len(data_to_import)} records.")
        if data_to_import:
            print("\nSample processed record (first 2):")
            for i in range(min(2, len(data_to_import))):
                print(data_to_import[i])

        print("\nAttempting to import data into Neon PostgreSQL...")

        import os
        import psycopg2
        from psycopg2 import extras

        NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL")
        if not NEON_DATABASE_URL:
            raise ValueError("NEON_DATABASE_URL environment variable not set.")

        conn = psycopg2.connect(NEON_DATABASE_URL)
        cur = conn.cursor()

        insert_query = """
        INSERT INTO students (
            roll_number, student_name, institution_name, gpa, total_marks,
            board, father_name, science_group, mother_name, year, exam_type, session_year,
            registration_id, student_type, date_of_birth, subject_marks
        ) VALUES (
            %(roll_number)s, %(student_name)s, %(institution_name)s, %(gpa)s, %(total_marks)s,
            %(board)s, %(father_name)s, %(science_group)s, %(mother_name)s, %(year)s, %(exam_type)s, %(session_year)s,
            %(registration_id)s, %(student_type)s, %(date_of_birth)s, %(subject_marks)s
        ) ON CONFLICT (roll_number, exam_type, year) DO NOTHING; -- Prevents duplicate inserts for the same roll_number, exam_type, and year
        """

        # Using execute_batch for efficient bulk insertion
        extras.execute_batch(cur, insert_query, data_to_import)
        conn.commit()
        print("Data imported successfully into Neon PostgreSQL.")

    except FileNotFoundError:
        print(f"Error: The file '{csv_path}' was not found.")
    except Exception as e:
        print(f"An error occurred during data processing or import: {e}")
        if conn:
            conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
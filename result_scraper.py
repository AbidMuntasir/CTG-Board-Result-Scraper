from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
import sys # Added for platform detection
import time
import csv
import json # Added for progress tracking
from bs4 import BeautifulSoup

# Define the URL of the website
URL = 'https://sresult.bise-ctg.gov.bd/rxto2025/individual/'

# Define retry mechanism
MAX_RETRIES = 3 # Number of retries for blank entries or errors

# Define the overall range of roll numbers
OVERALL_START_ROLL = 300000
OVERALL_END_ROLL = 340000

# Define batch size for processing
BATCH_SIZE = 20000 # How many rolls per batch

# Define progress file path
PROGRESS_FILE_NAME = 'progress.json'

# Define CSV file path
CSV_FILE_NAME = 'ssc_results.csv'

# Function to load progress from a JSON file
def load_progress(progress_file):
    try:
        with open(progress_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {'last_scraped_roll': OVERALL_START_ROLL - 1} # Start before the first roll

# Function to save progress to a JSON file
def save_progress(progress, progress_file):
    with open(progress_file, 'w') as f:
        json.dump(progress, f)

# Load current progress
progress = load_progress(PROGRESS_FILE_NAME)
current_start_roll = progress['last_scraped_roll'] + 1

# Determine the end roll for this batch
current_end_roll = min(current_start_roll + BATCH_SIZE - 1, OVERALL_END_ROLL)

print(f"Starting batch from roll number: {current_start_roll} to {current_end_roll}")

# Ensure the CSV file exists and has a header if it's a new file
# This part remains similar, but the header writing logic is now inside the loop
# to ensure it's written only when data is first appended.
if not os.path.exists(CSV_FILE_NAME):
    with open(CSV_FILE_NAME, 'w', newline='', encoding='utf-8') as csvfile:
        pass # Just ensure file exists, header will be written on first data entry

# Set up Chrome options for headless browsing
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run Chrome in headless mode (without GUI)
chrome_options.add_argument("--disable-gpu")  # Disable GPU acceleration (recommended for headless)
chrome_options.add_argument("--no-sandbox")  # Bypass OS security model (necessary for some environments)
chrome_options.add_argument("--disable-dev-shm-usage")  # Overcome limited resource problems

# Set up the WebDriver
# Determine chromedriver path based on OS for local and GitHub Actions compatibility
if sys.platform == "win32":
    # For Windows, assume chromedriver.exe is in PATH or automatically found
    driver = webdriver.Chrome(options=chrome_options)
else:
    # For Linux environments like GitHub Actions, chromedriver is often in /usr/local/bin/
    # or can be specified if downloaded to a custom path.
    service_instance = Service(executable_path="/usr/local/bin/chromedriver") # Linux (GitHub Actions)
    driver = webdriver.Chrome(service=service_instance, options=chrome_options)

from selenium.common.exceptions import TimeoutException, WebDriverException

try:
    continuous_failure_count = 0 # Initialize failure counter
    MAX_CONTINUOUS_FAILURES = 10 # Define the maximum continuous failures allowed

    for roll_number in range(current_start_roll, current_end_roll + 1):
        print(f"Processing roll number: {roll_number}")
        # Check if we have exceeded the overall end roll
        if roll_number > OVERALL_END_ROLL:
            print(f"Reached overall end roll {OVERALL_END_ROLL}. Stopping.")
            break
        
        if continuous_failure_count >= MAX_CONTINUOUS_FAILURES:
            print(f"Stopped scraping after {MAX_CONTINUOUS_FAILURES} continuous failures.")
            break

        scraped_successfully = False
        for attempt in range(MAX_RETRIES):
            print(f"Attempt {attempt + 1}/{MAX_RETRIES} for roll number: {roll_number}")
            try:
                driver.get(URL)

                # Wait for the roll number input field to be present
                roll_input = WebDriverWait(driver, 20).until(
                    EC.presence_of_element_located((By.NAME, "roll"))
                )
                roll_input.clear()
                roll_input.send_keys(str(roll_number))

                # Find and click the submit button
                submit_button = WebDriverWait(driver, 20).until(
                    EC.element_to_be_clickable((By.ID, "button2"))
                )
                submit_button.click()

                # Wait for the result page to load.
                WebDriverWait(driver, 20).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
                
                # Wait for a specific element on the result page to ensure it's loaded
                WebDriverWait(driver, 20).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "tftable"))
                )

                # Get the page source (HTML content)
                html_content = driver.page_source
        
                # Parse HTML content with BeautifulSoup
                soup = BeautifulSoup(html_content, 'html.parser')
        
                # Extract general information
                general_info = {}
                try:
                    table1 = soup.find('table', class_='tftable')
                    if table1:
                        rows = table1.find_all('tr')
                        for row in rows:
                            cols = row.find_all('td')
                            if len(cols) == 4:
                                key1 = cols[0].get_text(strip=True)
                                value1 = cols[1].get_text(strip=True)
                                key2 = cols[2].get_text(strip=True)
                                value2 = cols[3].get_text(strip=True)
                                general_info[key1] = value1
                                general_info[key2] = value2
                except Exception as e:
                    print(f"Error extracting general info for roll {roll_number}: {e}")
        
                # Extract subject-wise grades
                subject_grades = []
                try:
                    table2 = soup.find('table', class_='tftable2')
                    if table2:
                        rows = table2.find_all('tr')
                        # Skip header row
                        for row in rows[1:]:
                            cols = row.find_all('td')
                            if len(cols) == 3:
                                subject_grades.append({
                                    'Code': cols[0].get_text(strip=True),
                                    'Subject': cols[1].get_text(strip=True),
                                    'Grade': cols[2].get_text(strip=True)
                                })
                except Exception as e:
                    print(f"Error extracting subject grades for roll {roll_number}: {e}")
        
                # Prepare data for CSV
                csv_data = {
                    'Roll No': roll_number,
                    'Name': general_info.get('Name', ''),
                    'Board': general_info.get('Board', ''),
                    'Father\'s Name': general_info.get('Father\'s Name', ''),
                    'Group': general_info.get('Group', ''),
                    'Mother\'s Name': general_info.get('Mother\'s Name', ''),
                    'Session': general_info.get('Session', ''),
                    'Reg. NO': general_info.get('Reg. NO', ''),
                    'Type': general_info.get('Type', ''),
                    'Institute': general_info.get('Institute', ''),
                    'Result': general_info.get('Result', ''),
                    'DATE OF BIRTH': general_info.get('DATE OF BIRTH', '')
                }
        
                # Add subject grades as separate columns
                for i, subject in enumerate(subject_grades):
                    csv_data[f'Subject_{i+1}_Code'] = subject['Code']
                    csv_data[f'Subject_{i+1}_Name'] = subject['Subject']
                    csv_data[f'Subject_{i+1}_Grade'] = subject['Grade']

                # Check for blank entries (e.g., Name or Result is empty)
                if not csv_data.get('Name') or not csv_data.get('Result'):
                    print(f"Blank entry detected for roll {roll_number}. Retrying...")
                    time.sleep(2) # Small delay before retry
                    continue # Retry this roll number

                # Write to CSV
                file_exists = os.path.isfile(CSV_FILE_NAME)
                
                with open(CSV_FILE_NAME, 'a', newline='', encoding='utf-8') as csvfile:
                    fieldnames = list(csv_data.keys())
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
                    if not file_exists:
                        writer.writeheader()
        
                    writer.writerow(csv_data)
                print(f"Appended data for roll {roll_number} to {CSV_FILE_NAME}")
                scraped_successfully = True
                break # Break from retry loop if successful

            except TimeoutException:
                print(f"Timeout while processing roll number {roll_number}. Page elements not found. Retrying...")
                time.sleep(2)
                continue # Retry this roll number
            except WebDriverException as we:
                print(f"WebDriver error for roll number {roll_number}: {we}. Retrying...")
                time.sleep(2)
                continue # Retry this roll number
            except IOError as ioe:
                print(f"File I/O error for roll number {roll_number}: {ioe}. Retrying...")
                time.sleep(2)
                continue # Retry this roll number
            except Exception as ex:
                print(f"An unexpected error occurred for roll number {roll_number}: {ex}. Retrying...")
                time.sleep(2)
                continue # Retry this roll number
        
        if scraped_successfully:
            # Update progress only if successfully scraped and written
            progress['last_scraped_roll'] = roll_number
            save_progress(progress, PROGRESS_FILE_NAME) # Save progress after each successful roll
            continuous_failure_count = 0 # Reset failure counter on success
        else:
            print(f"Failed to scrape roll number {roll_number} after {MAX_RETRIES} attempts. Skipping.")
            continuous_failure_count += 1 # Increment failure counter
            # Progress is not updated for this roll, so it will be retried in the next batch if within range.

    print(f"Batch completed. Last scraped roll in this batch: {progress['last_scraped_roll']}")

except Exception as e:
    print(f"A critical error occurred during the scraping process: {e}")

finally:
    # Close the browser
    driver.quit()
    print("Browser closed.")

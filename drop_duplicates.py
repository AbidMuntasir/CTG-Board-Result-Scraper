import pandas as pd

def drop_duplicates_from_csv(input_csv_path, output_csv_path=None):
    """
    Reads a CSV file, drops duplicate rows based on 'roll' and 'reg' columns,
    and saves the result to a new CSV file or overwrites the original.

    Args:
        input_csv_path (str): The path to the input CSV file.
        output_csv_path (str, optional): The path to save the cleaned CSV file.
                                          If None, the original file will be overwritten.
    """
    try:
        df = pd.read_csv(input_csv_path, header=None)
        print(f"Original DataFrame shape: {df.shape}")

        # Drop duplicates based on 'roll' (column 0) and 'reg' (column 7) columns
        df_cleaned = df.drop_duplicates(subset=[0, 7])
        print(f"Cleaned DataFrame shape: {df_cleaned.shape}")

        if output_csv_path:
            df_cleaned.to_csv(output_csv_path, index=False)
            print(f"Cleaned data saved to {output_csv_path}")
        else:
            df_cleaned.to_csv(input_csv_path, index=False)
            print(f"Original file {input_csv_path} overwritten with cleaned data.")

    except FileNotFoundError:
        print(f"Error: The file '{input_csv_path}' was not found.")
    except KeyError as e:
        print(f"Error: Missing expected column(s) in CSV: {e}. Make sure 'roll' and 'reg' columns exist.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    input_file = "ssc_results.csv"
    # You can specify an output file, e.g., "ssc_results_cleaned.csv"
    # Or leave it as None to overwrite the original file.
    output_file = "ssc_results_cleaned.csv" # Set to "ssc_results_cleaned.csv" to save to a new file

    drop_duplicates_from_csv(input_file, output_file)
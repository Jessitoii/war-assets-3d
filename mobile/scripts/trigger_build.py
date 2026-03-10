import subprocess
import time
import sys

def run_eas_build():
    process = subprocess.Popen(
        'npx eas build --platform android --profile production',
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
        shell=True
    )

    def wait_and_send(target_text, input_text):
        print(f"Waiting for: {target_text}")
        output = ""
        while target_text not in output:
            line = process.stdout.read(1)
            if not line:
                break
            output += line
            sys.stdout.write(line)
            sys.stdout.flush()
        
        print(f"\nSending: {input_text}")
        process.stdin.write(input_text + "\n")
        process.stdin.flush()

    try:
        wait_and_send("Generate a new Android Keystore?", "n")
        wait_and_send("Path to the Keystore file.", "warassets.keystore")
        wait_and_send("Keystore password", "3xDqQVZG5llMOf5l")
        wait_and_send("Key alias", "warassets-key")
        wait_and_send("Key password", "3xDqQVZG5llMOf5l")
        
        # Read the rest of the output
        while True:
            line = process.stdout.readline()
            if not line:
                break
            print(line, end='')
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        process.terminate()

if __name__ == "__main__":
    run_eas_build()

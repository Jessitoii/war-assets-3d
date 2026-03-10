import secrets
import string

def generate_password(length=16):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for i in range(length))

keystore_pass = generate_password()
key_pass = generate_password()

print(f"KEYSTORE_PASSWORD={keystore_pass}")
print(f"KEY_PASSWORD={key_pass}")

import os
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from pathlib import Path

class UserKeyManager:
    def __init__(self, keys_dir: str = "keys/users"):
        self.keys_dir = keys_dir
        Path(keys_dir).mkdir(parents=True, exist_ok=True)

    def generate_user_keys(self, user_id: str) -> tuple[str, str]:
        """Generate RSA key pair for a user and return paths to the keys"""
        # Create user directory
        user_dir = os.path.join(self.keys_dir, user_id)
        Path(user_dir).mkdir(exist_ok=True)

        # Generate key pair
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )

        # Save private key
        private_key_path = os.path.join(user_dir, "private_key.pem")
        with open(private_key_path, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))

        # Save public key
        public_key_path = os.path.join(user_dir, "public_key.pem")
        with open(public_key_path, "wb") as f:
            f.write(private_key.public_key().public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ))

        return private_key_path, public_key_path

    def get_user_keys(self, user_id: str) -> tuple[str, str]:
        """Get paths to user's key pair"""
        user_dir = os.path.join(self.keys_dir, user_id)
        private_key_path = os.path.join(user_dir, "private_key.pem")
        public_key_path = os.path.join(user_dir, "public_key.pem")

        if not os.path.exists(private_key_path) or not os.path.exists(public_key_path):
            raise ValueError(f"Keys not found for user {user_id}")

        return private_key_path, public_key_path

    def user_exists(self, user_id: str) -> bool:
        """Check if a user has generated keys"""
        user_dir = os.path.join(self.keys_dir, user_id)
        private_key_path = os.path.join(user_dir, "private_key.pem")
        public_key_path = os.path.join(user_dir, "public_key.pem")
        return os.path.exists(private_key_path) and os.path.exists(public_key_path) 
import base64
import hashlib
import json
from datetime import datetime, timezone
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from pathlib import Path
from .user_keys import UserKeyManager

def sign_document(document_data: bytes, signature_base64: str, user_id: str, output_path: str = None):
    """
    Sign a document using user-specific keys
    
    Args:
        document_data: The document to sign
        signature_base64: Base64 encoded signature image
        user_id: ID of the user signing the document
        output_path: Optional path to save the signed package
    
    Returns:
        dict: The signed package containing all necessary information for verification
    """
    # Initialize key manager and get user's private key
    key_manager = UserKeyManager()
    if not key_manager.user_exists(user_id):
        raise ValueError(f"User {user_id} does not have keys. Generate keys first.")
    
    private_key_path, _ = key_manager.get_user_keys(user_id)
    
    # Generate timestamp
    timestamp = datetime.now(timezone.utc).isoformat()

    # Prepare data to sign
    data_to_sign = {
        "document": base64.b64encode(document_data).decode(),
        "signature_image": signature_base64,
        "timestamp": timestamp,
        "user_id": user_id  # Include user ID in signed data
    }

    # Create hash and sign
    json_data = json.dumps(data_to_sign, sort_keys=True).encode()
    hash_digest = hashlib.sha256(json_data).digest()

    with open(private_key_path, 'rb') as key_file:
        private_key = serialization.load_pem_private_key(key_file.read(), password=None)

    signature = private_key.sign(
        hash_digest,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

    # Create signed package
    signed_package = {
        "timestamp": timestamp,
        "signature": base64.b64encode(signature).decode(),
        "hash_algorithm": "SHA-256",
        "user_id": user_id,  # Include user ID in package
        "signed_data": data_to_sign
    }

    # Save to file if output path provided
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(signed_package, f, indent=2)
        print(f"Document signed and saved with timestamp for user {user_id}.")

    return signed_package

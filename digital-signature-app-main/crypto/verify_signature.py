import base64
import hashlib
import json
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from .user_keys import UserKeyManager

def verify_signature(document_data: bytes, signature_base64: str, signed_package_data: dict) -> dict:
    """
    Verify a signed document using user-specific keys
    
    Args:
        document_data: The original document to verify
        signature_base64: The original signature image
        signed_package_data: The signed package containing signature and metadata
    
    Returns:
        dict: Verification result containing:
            - valid: bool indicating if signature is valid
            - timestamp: str timestamp if valid, None if invalid
            - user_id: str user ID if valid, None if invalid
            - error: str error message if invalid, None if valid
    """
    try:
        # Extract values from the signed package
        timestamp = signed_package_data.get('timestamp')
        signature = base64.b64decode(signed_package_data.get('signature', ''))
        user_id = signed_package_data.get('user_id')
        
        if not user_id:
            return {
                "valid": False,
                "timestamp": None,
                "user_id": None,
                "error": "No user ID found in signed package"
            }
        
        # Initialize key manager and get user's public key
        key_manager = UserKeyManager()
        if not key_manager.user_exists(user_id):
            return {
                "valid": False,
                "timestamp": None,
                "user_id": None,
                "error": f"Keys not found for user {user_id}"
            }
        
        _, public_key_path = key_manager.get_user_keys(user_id)
        
        # Reconstruct the data that was signed
        data_to_verify = {
            "document": base64.b64encode(document_data).decode(),
            "signature_image": signature_base64,
            "timestamp": timestamp,
            "user_id": user_id
        }
        
        # Create the same hash that was signed
        json_data = json.dumps(data_to_verify, sort_keys=True).encode()
        hash_digest = hashlib.sha256(json_data).digest()
        
        # Load the public key
        with open(public_key_path, 'rb') as key_file:
            public_key = serialization.load_pem_public_key(key_file.read())
        
        # Verify the signature
        try:
            public_key.verify(
                signature,
                hash_digest,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            print(f"✅ Signature verified successfully for user {user_id}!")
            return {
                "valid": True,
                "timestamp": timestamp,
                "user_id": user_id,
                "error": None
            }
        except Exception as e:
            print(f"❌ Signature verification failed: {str(e)}")
            return {
                "valid": False,
                "timestamp": None,
                "user_id": None,
                "error": f"Signature verification failed: {str(e)}"
            }
            
    except Exception as e:
        print(f"❌ Verification error: {str(e)}")
        return {
            "valid": False,
            "timestamp": None,
            "user_id": None,
            "error": f"Verification error: {str(e)}"
        }

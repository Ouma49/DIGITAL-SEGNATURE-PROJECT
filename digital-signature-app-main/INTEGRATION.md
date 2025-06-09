# Digital Signature System Integration Guide

This guide explains how to integrate the digital signature system with your existing authentication system.

## Overview

The digital signature system uses a per-user key management system that can be integrated with your existing authentication system. Each user has their own unique key pair stored in the `keys/users/{user_id}/` directory.

## Integration Points

### 1. User Authentication Flow

When a user logs in through your authentication system:

```python
# Example integration code
from crypto.user_keys import KeyManager

def handle_user_login(user_id, auth_token):
    # 1. Verify user authentication with your system
    if not verify_auth_token(auth_token):
        return False
    
    # 2. Check if user has digital signature keys
    key_manager = KeyManager()
    if not key_manager.user_exists(user_id):
        # Generate keys for new user
        key_manager.generate_keys(user_id)
    
    return True
```

### 2. Key Management

The system stores keys in the following structure:
```
keys/
└── users/
    └── {user_id}/
        ├── private_key.pem
        └── public_key.pem
```

You can access these keys through the `KeyManager` class:

```python
from crypto.user_keys import KeyManager

key_manager = KeyManager()

# Check if user has keys
if key_manager.user_exists(user_id):
    # Get user's public key
    public_key = key_manager.get_public_key(user_id)
    
    # Get user's private key (requires authentication)
    if verify_user_authentication(user_id, auth_token):
        private_key = key_manager.get_private_key(user_id)
```

### 3. Document Signing Integration

When a user wants to sign a document:

```python
from crypto.sign_document import sign_document

def handle_document_signing(user_id, document, signature_image):
    # 1. Verify user is authenticated
    if not verify_user_authentication(user_id, auth_token):
        return {"error": "Unauthorized"}
    
    # 2. Get user's keys
    key_manager = KeyManager()
    if not key_manager.user_exists(user_id):
        return {"error": "User keys not found"}
    
    # 3. Sign the document
    signed_package = sign_document(
        document=document,
        signature_image=signature_image,
        user_id=user_id
    )
    
    return signed_package
```

### 4. Signature Verification Integration

To verify a signature:

```python
from crypto.verify_signature import verify_signature

def handle_signature_verification(document, signed_package):
    # 1. Extract user_id from signed package
    user_id = signed_package.get("user_id")
    
    # 2. Verify the signature
    verification_result = verify_signature(
        document=document,
        signed_package=signed_package
    )
    
    return verification_result
```

## Security Considerations

1. **Key Storage**:
   - Private keys are stored in `keys/users/{user_id}/private_key.pem`
   - Ensure this directory is properly secured
   - Consider encrypting private keys with user's password

2. **Access Control**:
   - Only allow access to private keys for authenticated users
   - Implement proper session management
   - Use secure token-based authentication

3. **Key Generation**:
   - Keys are generated when a user first needs to sign a document
   - Consider generating keys during user registration
   - Implement key rotation policies

## Example Integration with FastAPI

```python
from fastapi import FastAPI, Depends, HTTPException
from your_auth_system import get_current_user  # Your auth system's user verification

app = FastAPI()

@app.post("/sign")
async def sign_document(
    document: UploadFile,
    signature: str,
    current_user = Depends(get_current_user)
):
    # Verify user has keys
    key_manager = KeyManager()
    if not key_manager.user_exists(current_user.id):
        key_manager.generate_keys(current_user.id)
    
    # Sign document
    signed_package = sign_document(
        document=await document.read(),
        signature_image=signature,
        user_id=current_user.id
    )
    
    return signed_package

@app.post("/verify")
async def verify_document(
    document: UploadFile,
    signed_package: dict,
    current_user = Depends(get_current_user)
):
    # Verify signature
    result = verify_signature(
        document=await document.read(),
        signed_package=signed_package
    )
    
    return result
```

## Testing the Integration

1. Create a test user in your authentication system
2. Generate keys for the user:
   ```python
   from crypto.user_keys import KeyManager
   key_manager = KeyManager()
   key_manager.generate_keys("test_user_id")
   ```
3. Test signing a document:
   ```python
   # Sign document
   signed_package = sign_document(
       document=document_bytes,
       signature_image=signature_base64,
       user_id="test_user_id"
   )
   
   # Verify signature
   result = verify_signature(
       document=document_bytes,
       signed_package=signed_package
   )
   ```

## Troubleshooting

1. **Key Not Found**:
   - Check if user_id matches between auth system and key storage
   - Verify keys directory permissions
   - Ensure key generation completed successfully

2. **Authentication Issues**:
   - Verify user authentication before accessing private keys
   - Check token validity and expiration
   - Ensure proper session management

3. **Signature Verification Fails**:
   - Verify document hasn't been modified
   - Check if using correct user's public key
   - Ensure signed package format is correct

## Support

For integration support:
1. Check the `crypto/` directory for detailed implementation
2. Review `test_signature.py` for example usage
3. Contact the development team for assistance 
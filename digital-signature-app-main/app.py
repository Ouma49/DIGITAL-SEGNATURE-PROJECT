from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import asyncio
import hashlib
from crypto.user_keys import UserKeyManager
from crypto.sign_document import sign_document as crypto_sign_document
from crypto.verify_signature import verify_signature as verify_sig
from datetime import datetime
import pytz

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize key manager
key_manager = UserKeyManager()

# Create necessary directories
os.makedirs("keys/users", exist_ok=True)
os.makedirs("input", exist_ok=True)
os.makedirs("output", exist_ok=True)

@app.get("/")
async def read_root():
    return FileResponse("static/index.html")

@app.post("/users/{user_id}/keys")
async def generate_user_keys(user_id: str):
    """Generate new key pair for a user"""
    if key_manager.user_exists(user_id):
        raise HTTPException(status_code=400, detail=f"User {user_id} already has keys")
    try:
        key_manager.generate_keys(user_id)
        return {"message": f"Keys generated for user {user_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sign")
async def sign_document(
    document: UploadFile = File(...),
    signature_base64: str = Form(...),
    user_id: str = Form(...)
):
    try:
        # Check if user exists
        if not key_manager.user_exists(user_id):
            raise HTTPException(status_code=400, detail="User not found")

        # Read document
        document_bytes = await document.read()
        
        # Calculate document hash
        document_hash = hashlib.sha256(document_bytes).hexdigest()
        
        # Get current timestamp with timezone
        timestamp = datetime.now(pytz.UTC).isoformat()
        
        # Define output path
        output_path = os.path.join("output", f"signed_document_{user_id}.json")
        
        # Sign the document using the crypto module
        signed_package = crypto_sign_document(
            document_bytes,
            signature_base64,
            user_id
        )
        
        # Add enhanced non-repudiation data
        signed_package.update({
            "document_hash": document_hash,
            "timestamp": timestamp,
            "signing_info": {
                "algorithm": "SHA-256",
                "signature_type": "Digital Signature",
                "key_type": "RSA",
                "key_size": 2048,  # Assuming 2048-bit keys
                "signature_format": "PKCS#1 v1.5"
            },
            "metadata": {
                "original_filename": document.filename,
                "content_type": document.content_type,
                "file_size": len(document_bytes)
            }
        })
        
        # Save the signed package
        with open(output_path, 'w') as f:
            json.dump(signed_package, f)
        
        print(f"Document signed and saved with timestamp for user {user_id}.")
        return signed_package
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error signing document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error signing document: {str(e)}")

@app.post("/verify")
async def verify_signature(
    document: UploadFile = File(...),
    signed_package: UploadFile = File(...),
    signature_base64: str = Form(...)
):
    try:
        # Read the document
        document_bytes = await document.read()
        
        # Read and parse the signed package
        signed_package_content = await signed_package.read()
        try:
            signed_package_data = json.loads(signed_package_content)
            print(f"Signed package data: {signed_package_data}")  # Debug log
        except json.JSONDecodeError as e:
            print(f"Error parsing signed package: {e}")  # Debug log
            return JSONResponse(
                status_code=400,
                content={
                    "valid": False,
                    "message": "Invalid signed package format",
                    "details": {
                        "error": str(e),
                        "received_data": signed_package_content.decode('utf-8', errors='ignore')
                    }
                }
            )

        # Verify the signature
        try:
            # Get the original document hash from the signed package
            original_hash = signed_package_data.get("document_hash")
            if not original_hash:
                return JSONResponse(
                    status_code=400,
                    content={
                        "valid": False,
                        "message": "Invalid signed package: missing document hash",
                        "details": {
                            "error": "Document hash not found in signed package"
                        }
                    }
                )

            # Calculate hash of the current document
            current_hash = hashlib.sha256(document_bytes).hexdigest()
            
            # Compare hashes
            if current_hash != original_hash:
                return JSONResponse(
                    status_code=400,
                    content={
                        "valid": False,
                        "message": "Document has been modified",
                        "details": {
                            "error": "Document hash mismatch",
                            "original_hash": original_hash,
                            "current_hash": current_hash
                        }
                    }
                )

            # Verify the signature
            is_valid = verify_sig(
                document_bytes,
                signed_package_data,
                signature_base64
            )
            
            # Get signing information
            signing_info = signed_package_data.get("signing_info", {})
            metadata = signed_package_data.get("metadata", {})
            
            if is_valid:
                return {
                    "valid": True,
                    "message": "Signature is valid",
                    "details": {
                        "user_id": signed_package_data.get("user_id"),
                        "timestamp": signed_package_data.get("timestamp"),
                        "document_hash": current_hash,
                        "signing_info": signing_info,
                        "metadata": metadata,
                        "non_repudiation": {
                            "document_integrity": "Verified",
                            "signature_validity": "Verified",
                            "timestamp": signed_package_data.get("timestamp"),
                            "key_type": signing_info.get("key_type"),
                            "algorithm": signing_info.get("algorithm")
                        }
                    }
                }
            else:
                return {
                    "valid": False,
                    "message": "Signature verification failed",
                    "details": {
                        "user_id": signed_package_data.get("user_id"),
                        "timestamp": signed_package_data.get("timestamp"),
                        "error": "Signature mismatch",
                        "document_hash": current_hash,
                        "signing_info": signing_info,
                        "metadata": metadata,
                        "non_repudiation": {
                            "document_integrity": "Verified",
                            "signature_validity": "Failed",
                            "timestamp": signed_package_data.get("timestamp"),
                            "key_type": signing_info.get("key_type"),
                            "algorithm": signing_info.get("algorithm")
                        }
                    }
                }
        except Exception as e:
            print(f"Verification error: {str(e)}")  # Debug log
            return JSONResponse(
                status_code=400,
                content={
                    "valid": False,
                    "message": "Error during verification",
                    "details": {
                        "error": str(e),
                        "user_id": signed_package_data.get("user_id"),
                        "timestamp": signed_package_data.get("timestamp")
                    }
                }
            )
    except Exception as e:
        print(f"Unexpected error: {str(e)}")  # Debug log
        return JSONResponse(
            status_code=500,
            content={
                "valid": False,
                "message": "Internal server error",
                "details": {
                    "error": str(e)
                }
            }
        )

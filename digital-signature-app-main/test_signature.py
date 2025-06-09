import os
import base64
import json
from fastapi.testclient import TestClient
from app import app
from crypto.user_keys import UserKeyManager

# Create test client
client = TestClient(app)

def create_test_document():
    """Create a test document with some content"""
    test_content = "This is a test document for digital signature verification."
    doc_path = "input/test_document.txt"
    try:
        with open(doc_path, "w") as f:
            f.write(test_content)
        print(f"Created test document at {doc_path}")
        return doc_path
    except Exception as e:
        print(f"Error creating test document: {str(e)}")
        raise

def create_test_signature():
    """Create a test signature (base64 encoded)"""
    try:
        # This is just a dummy signature for testing
        dummy_signature = "Test Signature"
        signature = base64.b64encode(dummy_signature.encode()).decode()
        print("Created test signature")
        return signature
    except Exception as e:
        print(f"Error creating test signature: {str(e)}")
        raise

def test_user_key_generation():
    """Test user key generation"""
    print("\n=== Testing User Key Generation ===")
    
    try:
        # Test user ID
        user_id = "test_user_123"
        
        # Generate keys
        response = client.post(f"/users/{user_id}/keys")
        print(f"Key generation response: {response.status_code}")
        print(f"Response content: {response.text}")
        assert response.status_code == 200
        print("✅ Key generation successful")
        
        # Try generating keys again (should fail)
        response = client.post(f"/users/{user_id}/keys")
        print(f"Duplicate key generation response: {response.status_code}")
        assert response.status_code == 400
        print("✅ Duplicate key generation properly rejected")
        
        return user_id
    except Exception as e:
        print(f"Error in key generation test: {str(e)}")
        raise

def test_document_signing(user_id):
    """Test document signing"""
    print("\n=== Testing Document Signing ===")
    
    try:
        # Create test document and signature
        doc_path = create_test_document()
        signature = create_test_signature()
        
        print(f"Attempting to sign document with user_id: {user_id}")
        # Sign document
        with open(doc_path, "rb") as f:
            response = client.post(
                "/sign",
                files={"document": f},
                data={
                    "signature_base64": signature,
                    "user_id": user_id
                }
            )
        
        print(f"Signing response: {response.status_code}")
        print(f"Response content: {response.text}")
        assert response.status_code == 200
        signed_package = response.json()
        
        # Verify signed package structure
        assert "timestamp" in signed_package
        assert "signature" in signed_package
        assert "user_id" in signed_package
        assert signed_package["user_id"] == user_id
        print("✅ Document signing successful")
        
        return signed_package
    except Exception as e:
        print(f"Error in document signing test: {str(e)}")
        raise

def test_signature_verification(user_id, signed_package):
    """Test signature verification"""
    print("\n=== Testing Signature Verification ===")
    
    try:
        # Save signed package to file
        package_path = "output/test_signed_package.json"
        with open(package_path, "w") as f:
            json.dump(signed_package, f)
        print(f"Saved signed package to {package_path}")
        
        # Verify signature
        with open("input/test_document.txt", "rb") as doc_file, \
             open(package_path, "rb") as package_file:
            response = client.post(
                "/verify",
                files={
                    "document": doc_file,
                    "signed_package": package_file
                },
                data={
                    "signature_base64": create_test_signature()
                }
            )
        
        print(f"Verification response: {response.status_code}")
        print(f"Response content: {response.text}")
        assert response.status_code == 200
        verification_result = response.json()
        assert verification_result["valid"] == True
        assert verification_result["user_id"] == user_id
        print("✅ Signature verification successful")
    except Exception as e:
        print(f"Error in signature verification test: {str(e)}")
        raise

def test_error_cases():
    """Test various error cases"""
    print("\n=== Testing Error Cases ===")
    
    try:
        # Test signing with non-existent user
        with open("input/test_document.txt", "rb") as f:
            response = client.post(
                "/sign",
                files={"document": f},
                data={
                    "signature_base64": create_test_signature(),
                    "user_id": "non_existent_user"
                }
            )
        print(f"Non-existent user response: {response.status_code}")
        assert response.status_code == 400
        print("✅ Proper error for non-existent user")
        
        # Test verification with invalid signature
        with open("input/test_document.txt", "rb") as doc_file, \
             open("output/test_signed_package.json", "rb") as package_file:
            response = client.post(
                "/verify",
                files={
                    "document": doc_file,
                    "signed_package": package_file
                },
                data={
                    "signature_base64": "invalid_signature"
                }
            )
        print(f"Invalid signature response: {response.status_code}")
        assert response.status_code == 400
        print("✅ Proper error for invalid signature")
    except Exception as e:
        print(f"Error in error cases test: {str(e)}")
        raise

def cleanup():
    """Clean up test files"""
    print("\n=== Cleaning Up ===")
    try:
        files_to_remove = [
            "input/test_document.txt",
            "output/test_signed_package.json"
        ]
        for file_path in files_to_remove:
            try:
                os.remove(file_path)
                print(f"Removed {file_path}")
            except FileNotFoundError:
                print(f"{file_path} not found")
        print("✅ Test files cleaned up")
    except Exception as e:
        print(f"Error during cleanup: {str(e)}")

def main():
    """Run all tests"""
    print("Starting Digital Signature System Tests...")
    
    try:
        # Create necessary directories
        os.makedirs("input", exist_ok=True)
        os.makedirs("output", exist_ok=True)
        print("Created test directories")
        
        # Run tests
        user_id = test_user_key_generation()
        signed_package = test_document_signing(user_id)
        test_signature_verification(user_id, signed_package)
        test_error_cases()
        
        print("\n✅ All tests completed successfully!")
    except AssertionError as e:
        print(f"\n❌ Test failed: {str(e)}")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
    finally:
        cleanup()

if __name__ == "__main__":
    main() 
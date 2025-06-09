# Digital Signature Application

A secure digital signature system that provides non-repudiation guarantees for document signing and verification.

## Features

- User key generation and management
- Document signing with digital signatures
- Signature verification with integrity checks
- Non-repudiation guarantees
- Web-based interface for easy use

## Prerequisites

- Python 3.11 or higher
- pip (Python package manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd digital-signature-app
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

## Project Structure

```
digital-signature-app/
├── app.py              # FastAPI application
├── crypto/            # Cryptographic operations
│   ├── user_keys.py   # Key management
│   ├── sign_document.py    # Document signing
│   └── verify_signature.py # Signature verification
├── static/            # Web interface files
│   └── index.html     # Main web interface
├── keys/              # User keys storage
├── input/             # Input documents
├── output/            # Signed documents
└── requirements.txt   # Python dependencies
```

## Running the Application

1. Start the server:
```bash
python -m uvicorn app:app --reload
```

2. Open your browser and navigate to:
```
http://localhost:8000
```

## Usage Guide

### 1. Generate User Keys

1. Enter a user ID in the "Generate Keys" section
2. Click "Generate Keys"
3. The system will create a unique key pair for the user

### 2. Sign a Document

1. Enter the user ID
2. Upload the document to sign
3. Draw your signature on the canvas
4. Click "Sign Document"
5. Download the signed package (JSON file)

### 3. Verify a Signature

1. Upload the original document
2. Upload the signed package (JSON file)
3. Draw the original signature
4. Click "Verify Signature"
5. View the verification results

## Security Features

- **Non-Repudiation**: Each signature is uniquely tied to a user's private key
- **Document Integrity**: SHA-256 hashing ensures document hasn't been modified
- **Timestamp**: UTC timestamps with timezone information
- **Metadata**: Original file information is preserved
- **Technical Details**: Algorithm and key information is recorded

## Development

### Adding New Features

1. Cryptographic operations are in the `crypto/` directory
2. Web interface is in `static/index.html`
3. API endpoints are in `app.py`

### Testing

Run the test suite:
```bash
python test_signature.py
```

## Troubleshooting

1. If uvicorn is not found:
```bash
pip install uvicorn
```

2. If keys directory is missing:
```bash
mkdir -p keys/users
```

3. If input/output directories are missing:
```bash
mkdir input output
```

## Security Considerations

- Keep private keys secure
- Regularly backup the keys directory
- Monitor the output directory for signed documents
- Consider implementing additional security measures:
  - Trusted timestamp authority
  - Certificate-based key management
  - Digital certificate validation
  - Audit logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your License Here]

## Contact

[Your Contact Information]
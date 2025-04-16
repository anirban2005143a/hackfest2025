from googleapiclient.discovery import build
from google.oauth2 import service_account

# Path to your service account credentials
SERVICE_ACCOUNT_FILE = r"D:\projects\hackfest 2025\flask\hackfest-pathway-8228655f880d.json"

# Scopes to access Google Drive
SCOPES = ['https://www.googleapis.com/auth/drive']

creds = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)

# Build the Google Drive service
service = build('drive', 'v3', credentials=creds)

# Test if it can list files
results = service.files().list(pageSize=10, fields="files(id, name)").execute()
items = results.get('files', [])

if not items:
    print('No files found.')
else:
    print('Files:')
    for item in items:
        print(f'{item["name"]} ({item["id"]})')
